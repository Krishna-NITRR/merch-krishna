import type { CartItem, ViewState } from '../App';

interface Props {
  cart: CartItem[];
  onNavigate: (view: ViewState) => void;
}

export default function CartView({ cart, onNavigate }: Props) {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2>Your Cart</h2>
      
      {cart.length === 0 ? (
        <div className="mt-8 text-center" style={{ padding: '48px 0', border: '1px dashed var(--div)', borderRadius: 'var(--radius-lg)' }}>
          <p className="subtext" style={{ margin: '0 auto 24px auto' }}>Your cart is empty.</p>
          <button className="btn btn-primary" onClick={() => onNavigate('home')}>Browse Products</button>
        </div>
      ) : (
        <div className="mt-8">
          {cart.map((item, idx) => (
            <div key={idx} className="cart-item">
              <div className="cart-item-info">
                <h3>{item.title}</h3>
                <div className="cart-item-details">
                  {item.details.nitName && <div>NIT: {item.details.nitName}</div>}
                  {item.details.userName && <div>Name: {item.details.userName}</div>}
                  {item.details.batch && <div>Batch: {item.details.batch}</div>}
                </div>
              </div>
              <div style={{ fontWeight: 600 }}>Qty: {item.quantity}</div>
            </div>
          ))}
          
          <div className="mt-8" style={{ textAlign: 'right' }}>
            <button className="btn btn-primary" onClick={() => alert('Checkout flow not implemented yet.')}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
