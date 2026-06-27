import { useState } from 'react';
import type { ViewState } from '../App';
import TShirtMockup from './TShirtMockup';

interface Props {
  onNavigate: (view: ViewState) => void;
}

const Letter = ({ children }: { children: React.ReactNode }) => {
  const [jiggling, setJiggling] = useState(false);
  
  const handleHover = () => {
    if (!jiggling) {
      setJiggling(true);
      setTimeout(() => setJiggling(false), 2000);
    }
  };

  return (
    <span 
      className={`letter-jiggle ${jiggling ? 'is-jiggling' : ''}`} 
      onMouseEnter={handleHover}
    >
      {children}
    </span>
  );
};

export default function HomeView({ onNavigate }: Props) {
  return (
    <>
      <section className="hero-section">
        <div className="hero-inner">
          <h1>
            {"Wear What You've Built".split('').map((char, i) => char === ' ' ? ' ' : <Letter key={`t1-${i}`}>{char}</Letter>)}
          </h1>
          <p className="subtext" style={{ margin: '0 auto 48px auto' }}>
            Merch for students building, publishing, and proving themselves
          </p>
          <button className="btn btn-primary" onClick={() => {
            document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            Choose Your Product
          </button>
        </div>
      </section>

      <section id="products" className="products-grid">
        <div className="product-card" onClick={() => onNavigate('customize-nit')}>
          <div className="product-image-placeholder">
            [ NIT Identity Hoodie Mockup ]
          </div>
          <h2 className="product-title">NIT Identity Merch</h2>
          <p className="product-desc">Customizable hoodie featuring your NIT, your name, and your batch year.</p>
          <button className="btn btn-secondary btn-full">Customize</button>
        </div>

        <div className="product-card" onClick={() => onNavigate('customize-research')}>
          <div className="product-image-placeholder" style={{ padding: 0, background: 'transparent', border: 'none' }}>
            <TShirtMockup view="front" />
          </div>
          <h2 className="product-title">Research Publish Merch</h2>
          <p className="product-desc">"Evidence over assumptions" on the back. THINK RESEARCH PUBLISH on the front.</p>
          <button className="btn btn-primary btn-full">Buy Now</button>
        </div>
      </section>
    </>
  );
}
