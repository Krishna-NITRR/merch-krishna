import { useState } from 'react';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import HomeView from './components/HomeView';
import NITCustomizer from './components/NITCustomizer';
import ResearchCustomizer from './components/ResearchCustomizer';
import CartView from './components/CartView';

export type ViewState = 'home' | 'customize-nit' | 'customize-research' | 'cart';

export interface CartItem {
  id: string;
  type: 'nit' | 'research';
  title: string;
  quantity: number;
  details: {
    nitName?: string;
    userName?: string;
    batch?: string;
  };
}

function App() {
  const [activeView, setActiveView] = useState<ViewState>('home');
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCart([...cart, item]);
    setActiveView('cart');
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

      <main className="container pt-12 mb-8">
        {activeView === 'home' && <HomeView onNavigate={setActiveView} />}
        {activeView === 'customize-nit' && <NITCustomizer onAddToCart={addToCart} />}
        {activeView === 'customize-research' && <ResearchCustomizer onAddToCart={addToCart} />}
        {activeView === 'cart' && <CartView cart={cart} onNavigate={setActiveView} />}
      </main>
    </>
  );
}

export default App;
