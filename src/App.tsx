import { useEffect, useState } from 'react';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import HomeView from './components/HomeView';
import NITCustomizer from './components/NITCustomizer';
import ResearchCustomizer from './components/ResearchCustomizer';
import ResearchHoodieCustomizer from './components/ResearchHoodieCustomizer';
import ResearchModeCustomizer from './components/ResearchModeCustomizer';
import CartView from './components/CartView';
import { readPromoLink, validateReferral, type Referral } from './referral';

export type ViewState = 'home' | 'customize-nit' | 'customize-research' | 'customize-research-hoodie' | 'customize-research-mode' | 'cart';

export interface CartItem {
  id: string;
  type: 'nit' | 'research' | 'researchhoodie' | 'researchmode';
  title: string;
  price: number;
  size: string;
  quantity: number;
  details: {
    nitName?: string;
    userName?: string;
    batch?: string;
  };
}

function App() {
  const [promoLink] = useState(readPromoLink);
  const [activeView, setActiveView] = useState<ViewState>(promoLink.view ?? 'home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [promo, setPromo] = useState<Referral | null>(null);

  useEffect(() => {
    if (promoLink.code) validateReferral(promoLink.code).then(setPromo);
  }, [promoLink.code]);

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      // Check if identical item already exists
      const existingIdx = prev.findIndex(
        i => i.type === item.type &&
             i.size === item.size &&
             i.details.nitName === item.details.nitName &&
             i.details.userName === item.details.userName &&
             i.details.batch === item.details.batch
      );
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += item.quantity;
        return next;
      }
      return [...prev, item];
    });
    setActiveView('cart');
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <header className="header container">
        <div className="logo" style={{ cursor: 'pointer' }} onClick={() => setActiveView('home')}>
          Krishna Mahawar<span>.</span>
        </div>
        <div className="nav-right">
          {activeView !== 'home' && (
            <button className="btn btn-secondary" onClick={() => setActiveView('home')} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              <ArrowLeft size={16} style={{ marginRight: '6px' }} /> Back
            </button>
          )}
          <button className="cart-btn" onClick={() => setActiveView('cart')}>
            <ShoppingBag size={20} />
            <span>Cart ({cartCount})</span>
          </button>
        </div>
      </header>

      {promo && (
        <div className="promo-banner" role="status">
          🎟 Code <strong>{promo.code}</strong> applied: 10% off at checkout
        </div>
      )}

      <main className="container pt-12 mb-8">
        {activeView === 'home' && <HomeView onNavigate={setActiveView} />}
        {activeView === 'customize-nit' && <NITCustomizer onAddToCart={addToCart} />}
        {activeView === 'customize-research' && <ResearchCustomizer onAddToCart={addToCart} />}
        {activeView === 'customize-research-hoodie' && <ResearchHoodieCustomizer onAddToCart={addToCart} />}
        {activeView === 'customize-research-mode' && <ResearchModeCustomizer onAddToCart={addToCart} />}
        {activeView === 'cart' && (
          <CartView 
            cart={cart} 
            onNavigate={setActiveView}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            onClearCart={clearCart}
            initialReferral={promo}
          />
        )}
      </main>
    </>
  );
}

export default App;
