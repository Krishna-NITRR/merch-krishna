import { useState } from 'react';
import type { ViewState } from '../App';
import LazyMerch3D from './LazyMerch3D';

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
        <div className="product-card" onClick={() => onNavigate('customize-research-mode')}>
          <div className="product-image-placeholder">
            <span className="product-badge">New</span>
            <LazyMerch3D product="researchmode" interactive={false} autoRotate />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '16px', marginBottom: '8px' }}>
            <h2 className="product-title" style={{ margin: 0 }}>Research Mode Long Sleeve</h2>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#a085ff' }}>₹699</span>
          </div>
          <p className="product-desc">Your NIT, batch and name on the front. RESEARCH MODE on the back.</p>
          <button className="btn btn-secondary btn-full">Customize Long Sleeve &rarr;</button>
        </div>

        <div className="product-card" onClick={() => onNavigate('customize-nit')}>
          <div className="product-image-placeholder">
            <LazyMerch3D product="nit" interactive={false} autoRotate />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '16px', marginBottom: '8px' }}>
            <h2 className="product-title" style={{ margin: 0 }}>NIT Identity Merch</h2>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#a085ff' }}>₹699</span>
          </div>
          <p className="product-desc">Customizable long-sleeve tee featuring your NIT, your name, and your batch year.</p>
          <button className="btn btn-secondary btn-full">Customize Long Sleeve &rarr;</button>
        </div>

        <div className="product-card" onClick={() => onNavigate('customize-research')}>
          <div className="product-image-placeholder">
            <LazyMerch3D product="research" interactive={false} autoRotate />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '16px', marginBottom: '8px' }}>
            <h2 className="product-title" style={{ margin: 0 }}>Research Publish T-Shirt</h2>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#a085ff' }}>₹699</span>
          </div>
          <p className="product-desc">"Evidence over assumptions" on the back. THINK RESEARCH PUBLISH on the front.</p>
          <button className="btn btn-primary btn-full">Buy T-Shirt &rarr;</button>
        </div>

        <div className="product-card" onClick={() => onNavigate('customize-research-hoodie')}>
          <div className="product-image-placeholder">
            <LazyMerch3D product="researchhoodie" interactive={false} autoRotate />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '16px', marginBottom: '8px' }}>
            <h2 className="product-title" style={{ margin: 0 }}>Research Publish Hoodie</h2>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#a085ff' }}>₹899</span>
          </div>
          <p className="product-desc">THINK RESEARCH PUBLISH and your name on the front. THINK LIKE A RESEARCHER on the back.</p>
          <button className="btn btn-primary btn-full">Buy Hoodie &rarr;</button>
        </div>
      </section>
    </>
  );
}
