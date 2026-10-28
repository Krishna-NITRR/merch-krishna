import { useState } from 'react';
import type { CartItem, ViewState } from '../App';
import { Trash2, Plus, Minus, ShieldCheck, Truck, CheckCircle2, ArrowRight } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Props {
  cart: CartItem[];
  onNavigate: (view: ViewState) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface ConfirmedOrder {
  receipt: string;
  paymentId: string;
  amount: number;
  customer: CustomerDetails;
  items: CartItem[];
}

const REFERRAL_DISCOUNT = 0.10;

export default function CartView({ cart, onNavigate, onUpdateQuantity, onRemoveItem, onClearCart }: Props) {
  const [customer, setCustomer] = useState<CustomerDetails>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);

  // Referral code state
  const [refCode, setRefCode] = useState('');
  const [refStatus, setRefStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [refReferrer, setRefReferrer] = useState<string | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = refStatus === 'valid' ? Math.round(subtotal * REFERRAL_DISCOUNT) : 0;
  const total = subtotal - discount;

  const handleApplyRef = async () => {
    const code = refCode.trim().toUpperCase();
    if (!code) return;
    setRefStatus('checking');
    setRefReferrer(null);
    try {
      const res = await fetch(`/api/referral-validate?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (data.success && data.data?.valid) {
        setRefStatus('valid');
        setRefReferrer(data.data.referrer?.name || null);
      } else {
        setRefStatus('invalid');
      }
    } catch {
      setRefStatus('invalid');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!customer.name.trim() || !customer.email.trim() || !customer.phone.trim() || !customer.address.trim() || !customer.pincode.trim()) {
      setError('Please fill in all shipping details to proceed with checkout.');
      return;
    }

    if (customer.pincode.replace(/\D/g, '').length !== 6) {
      setError('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    try {
      setLoading(true);

      // 1. Ensure Razorpay script is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Could not load Razorpay payment gateway. Please check your internet connection.');
      }

      // 2. Call server to create order
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          customer,
          ...(refStatus === 'valid' ? { referralCode: refCode.trim().toUpperCase() } : {})
        })
      });

      const orderData = await res.json();
      if (!res.ok) {
        throw new Error(orderData.error || 'Failed to initialize order');
      }

      // 3. Open Razorpay Checkout modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Krishna Mahawar Merch',
        description: `Order ${orderData.receipt} (${cart.length} items)`,
        order_id: orderData.orderId,
        prefill: {
          name: customer.name,
          email: customer.email,
          contact: customer.phone,
        },
        notes: {
          shippingAddress: `${customer.address}, ${customer.city}, ${customer.state} - ${customer.pincode}`,
          receipt: orderData.receipt
        },
        theme: {
          color: '#6C4CF1'
        },
        handler: async function (response: any) {
          try {
            setLoading(true);
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                receipt: orderData.receipt
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              setConfirmedOrder({
                receipt: orderData.receipt,
                paymentId: response.razorpay_payment_id,
                amount: total,
                customer: { ...customer },
                items: [...cart]
              });
              onClearCart();
            } else {
              setError(verifyData.error || 'Payment verification failed. Please contact admin@krishnamahawar.in');
            }
          } catch (verErr: any) {
            setError(verErr.message || 'Payment verification network error. Please contact support.');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        const desc = resp.error?.description || 'Payment could not be processed';
        setError(`Payment failed: ${desc}`);
        setLoading(false);
      });

      rzp.open();

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong while initiating checkout');
      setLoading(false);
    }
  };

  // SUCCESS VIEW
  if (confirmedOrder) {
    return (
      <div style={{ maxWidth: '680px', margin: '40px auto', padding: '0 16px' }}>
        <div style={{
          background: 'var(--card)',
          border: '1px solid rgba(108,76,241,0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px 32px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
        }}>
          <CheckCircle2 size={64} color="#4ade80" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Order Placed Successfully!</h2>
          <p style={{ color: 'var(--tm)', marginBottom: '24px' }}>
            Thank you, {confirmedOrder.customer.name}! We've received your custom merch order.
          </p>

          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--div)',
            borderRadius: 'var(--radius)',
            padding: '20px',
            textAlign: 'left',
            marginBottom: '24px',
            fontSize: '0.9rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: 'var(--tm)' }}>Order Reference:</span>
              <strong style={{ color: '#a085ff', fontFamily: 'monospace' }}>{confirmedOrder.receipt}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: 'var(--tm)' }}>Payment ID:</span>
              <strong style={{ fontFamily: 'monospace' }}>{confirmedOrder.paymentId}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: 'var(--tm)' }}>Amount Paid:</span>
              <strong style={{ color: '#4ade80' }}>₹{confirmedOrder.amount.toLocaleString()} (Paid)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--div)', paddingTop: '10px' }}>
              <span style={{ color: 'var(--tm)' }}>Delivery To:</span>
              <span style={{ textAlign: 'right', maxWidth: '320px' }}>
                {confirmedOrder.customer.address}, {confirmedOrder.customer.city}, {confirmedOrder.customer.state} - {confirmedOrder.customer.pincode}
              </span>
            </div>
          </div>

          <div style={{
            background: 'rgba(108,76,241,0.1)',
            border: '1px solid rgba(108,76,241,0.2)',
            borderRadius: 'var(--radius)',
            padding: '16px',
            marginBottom: '32px',
            color: 'var(--text)',
            fontSize: '0.88rem',
            textAlign: 'left'
          }}>
            <strong>📦 What happens next?</strong>
            <p style={{ margin: '6px 0 0', color: 'var(--tm)' }}>
              Your custom items will be printed and prepared for quality check. You'll receive delivery tracking updates on <strong>{confirmedOrder.customer.email}</strong> & WhatsApp within 48 hours. Estimated delivery: 5-7 business days.
            </p>
          </div>

          <button className="btn btn-primary" onClick={() => onNavigate('home')} style={{ padding: '12px 32px' }}>
            Back to Merch Store
          </button>
        </div>
      </div>
    );
  }

  // EMPTY CART VIEW
  if (cart.length === 0) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
        <h2>Your Cart</h2>
        <div className="mt-8 text-center" style={{ padding: '64px 24px', border: '1px dashed var(--div)', borderRadius: 'var(--radius-lg)' }}>
          <p className="subtext" style={{ margin: '0 auto 24px auto', fontSize: '1.1rem' }}>Your merch cart is currently empty.</p>
          <button className="btn btn-primary" onClick={() => onNavigate('home')}>
            Browse Products &rarr;
          </button>
        </div>
      </div>
    );
  }

  // ACTIVE CART & CHECKOUT
  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Your Shopping Cart</h2>
      <p style={{ color: 'var(--tm)', marginBottom: '32px' }}>
        Review your customized items and complete delivery details below.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '40px', alignItems: 'start' }}>
        
        {/* LEFT: CART ITEMS LIST */}
        <div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--div)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Items ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
              <span style={{ color: 'var(--tm)', fontSize: '0.9rem', fontWeight: 400 }}>Price</span>
            </h3>

            {cart.map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: '16px', padding: '20px 0', borderTop: '1px solid var(--div)' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1.1rem', margin: '0 0 6px 0', color: 'var(--text)' }}>{item.title}</h4>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                    <span style={{ background: 'var(--bg3)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', color: '#a085ff', border: '1px solid var(--div)' }}>
                      Size: {item.size || 'M'}
                    </span>
                    {item.details.nitName && (
                      <span style={{ background: 'var(--bg3)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--text)', border: '1px solid var(--div)' }}>
                        {item.details.nitName}
                      </span>
                    )}
                    {item.details.userName && (
                      <span style={{ background: 'var(--bg3)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--text)', border: '1px solid var(--div)' }}>
                        Name: {item.details.userName}
                      </span>
                    )}
                    {item.details.batch && (
                      <span style={{ background: 'var(--bg3)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--tm)', border: '1px solid var(--div)' }}>
                        Batch: {item.details.batch}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--div)', borderRadius: '6px', background: 'var(--bg3)' }}>
                      <button 
                        type="button" 
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        style={{ padding: '6px 10px', color: 'var(--text)', display: 'flex', alignItems: 'center' }}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ padding: '0 10px', fontWeight: 600, fontSize: '0.9rem' }}>{item.quantity}</span>
                      <button 
                        type="button" 
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        style={{ padding: '6px 10px', color: 'var(--text)', display: 'flex', alignItems: 'center' }}
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button 
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', padding: '6px 8px' }}
                      title="Remove item"
                    >
                      <Trash2 size={15} /> Remove
                    </button>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)' }}>
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </div>
                  {item.quantity > 1 && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--tm)' }}>
                      (₹{item.price.toLocaleString()} each)
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Price breakdown */}
            <div style={{ borderTop: '1px solid var(--div)', marginTop: '16px', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--tm)' }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#4ade80' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>🎟 Referral Discount (10%)</span>
                  <span>-₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'var(--tm)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Truck size={16} color="#4ade80" /> Express Shipping across India
                </span>
                <span style={{ color: '#4ade80', fontWeight: 600 }}>FREE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: 800, color: '#a085ff', borderTop: '1px solid var(--div)', paddingTop: '12px' }}>
                <span>Total to Pay</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '16px', padding: '16px', background: 'var(--bg2)', borderRadius: 'var(--radius)', border: '1px solid var(--div)' }}>
            <ShieldCheck size={28} color="#6C4CF1" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.85rem', color: 'var(--tm)' }}>
              <strong style={{ color: 'var(--text)' }}>100% Authentic Quality:</strong> High-grade 380 GSM fleece and combed cotton. Dispatched with live tracking link to your phone & email.
            </div>
          </div>
        </div>

        {/* RIGHT: SHIPPING & PAYMENT FORM */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--div)', borderRadius: 'var(--radius-lg)', padding: '32px' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '4px' }}>Shipping Details</h3>
          <p style={{ color: 'var(--tm)', fontSize: '0.88rem', marginBottom: '24px' }}>
            Where should we deliver your order?
          </p>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '12px 16px', borderRadius: 'var(--radius)', fontSize: '0.88rem', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name *</label>
              <input 
                type="text" 
                name="name" 
                required 
                className="form-input" 
                placeholder="e.g. Krishna Mahawar" 
                value={customer.name}
                onChange={handleInputChange}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email (for receipt) *</label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  className="form-input" 
                  placeholder="name@gmail.com" 
                  value={customer.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone / WhatsApp *</label>
                <input 
                  type="tel" 
                  name="phone" 
                  required 
                  className="form-input" 
                  placeholder="9876543210" 
                  value={customer.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Delivery Address (Hostel / Flat / House) *</label>
              <input 
                type="text" 
                name="address" 
                required 
                className="form-input" 
                placeholder="Room 204, Hostel H, NIT Raipur Campus" 
                value={customer.address}
                onChange={handleInputChange}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">City *</label>
                <input 
                  type="text" 
                  name="city" 
                  required 
                  className="form-input" 
                  placeholder="Raipur" 
                  value={customer.city}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">State *</label>
                <input 
                  type="text" 
                  name="state" 
                  required 
                  className="form-input" 
                  placeholder="Chhattisgarh" 
                  value={customer.state}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">PIN Code *</label>
                <input 
                  type="text" 
                  name="pincode" 
                  required 
                  maxLength={6}
                  className="form-input" 
                  placeholder="492010" 
                  value={customer.pincode}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--div)', marginTop: '8px', paddingTop: '16px' }}>

              {/* Referral code input */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--tm)', marginBottom: '6px' }}>
                  Referral Code (optional, get 10% off)
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="e.g. KRISHNA10"
                    value={refCode}
                    onChange={e => { setRefCode(e.target.value); setRefStatus('idle'); setRefReferrer(null); }}
                    disabled={refStatus === 'valid' || loading}
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      border: `1.5px solid ${refStatus === 'valid' ? '#4ade80' : refStatus === 'invalid' ? '#ef4444' : 'var(--div)'}`,
                      borderRadius: 'var(--radius)',
                      fontSize: '0.9rem',
                      fontFamily: 'inherit',
                      background: 'var(--bg3)',
                      color: 'var(--text)',
                      outline: 'none'
                    }}
                  />
                  {refStatus !== 'valid' ? (
                    <button
                      type="button"
                      onClick={handleApplyRef}
                      disabled={!refCode.trim() || refStatus === 'checking' || loading}
                      style={{ padding: '9px 16px', background: 'var(--p)', color: '#fff', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '0.85rem', fontFamily: 'inherit', cursor: 'pointer', opacity: refCode.trim() ? 1 : 0.6, whiteSpace: 'nowrap' }}
                    >
                      {refStatus === 'checking' ? '...' : 'Apply'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setRefStatus('idle'); setRefCode(''); setRefReferrer(null); }}
                      style={{ padding: '9px 12px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '0.8rem', fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                {refStatus === 'valid' && (
                  <div style={{ marginTop: '6px', color: '#4ade80', fontSize: '0.8rem', fontWeight: 600 }}>
                    ✓ Code applied{refReferrer ? `. Referred by ${refReferrer}` : ''}. 10% off!
                  </div>
                )}
                {refStatus === 'invalid' && (
                  <div style={{ marginTop: '6px', color: '#ef4444', fontSize: '0.8rem' }}>✗: Invalid or expired code.</div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--tm)', fontSize: '0.8rem' }}>
                <ShieldCheck size={16} color="#6C4CF1" />
                <span>Secured by Razorpay · UPI, Cards, NetBanking, Wallets supported</span>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-full"
                disabled={loading}
                style={{ padding: '16px', fontSize: '1.05rem', fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              >
                {loading ? 'Opening Payment Gateway...' : (
                  <>
                    Pay ₹{total.toLocaleString()} via Razorpay <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
