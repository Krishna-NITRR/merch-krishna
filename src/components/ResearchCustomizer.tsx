import { useState } from 'react';
import type { CartItem } from '../App';
import TShirtMockup from './TShirtMockup';

interface Props {
  onAddToCart: (item: CartItem) => void;
}

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export default function ResearchCustomizer({ onAddToCart }: Props) {
  const [view, setView] = useState<'front' | 'back'>('front');
  const [userName, setUserName] = useState('');
  const [size, setSize] = useState('L');

  const handleAdd = () => {
    onAddToCart({
      id: Date.now().toString(),
      type: 'research',
      title: 'Research Publish T-Shirt',
      price: 699,
      size,
      quantity: 1,
      details: { userName }
    });
  };

  return (
    <div className="customizer-layout">
      <div className="preview-col">
        <div className="preview-container">
          <button className="preview-toggle" onClick={() => setView(view === 'front' ? 'back' : 'front')}>
            Switch to {view === 'front' ? 'Back' : 'Front'}
          </button>
          
          <div className="preview-text" style={{ padding: 0, background: 'transparent' }}>
            <TShirtMockup view={view} userName={userName} />
          </div>
        </div>
      </div>

      <div className="form-col">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.6rem' }}>Research Publish Merch</h2>
            <p style={{ color: 'var(--tm)', fontSize: '0.9rem', margin: '4px 0 0' }}>
              Standard fit · 220 GSM 100% Super-combed cotton
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#a085ff' }}>₹699</div>
            <div style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: 600 }}>Free India Shipping</div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Select Size</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {SIZES.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 'var(--radius)',
                  border: size === s ? '2px solid #6C4CF1' : '1px solid var(--div)',
                  background: size === s ? 'rgba(108,76,241,0.2)' : 'var(--bg3)',
                  color: size === s ? '#fff' : 'var(--tm)',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Add your name to the front (Optional)</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="e.g. KRISHNA MAHAWAR" 
            value={userName} 
            onChange={e => setUserName(e.target.value.toUpperCase())}
            maxLength={20}
          />
        </div>

        <div style={{ marginTop: '20px', fontSize: '0.8rem', color: 'var(--tm)', borderTop: '1px solid var(--div)', paddingTop: '16px', paddingBottom: '16px', lineHeight: '1.5' }}>
          <strong>Want bulk lab orders?</strong> Contact <a href="mailto:admin@krishnamahawar.in" style={{ color: 'var(--p2)' }}>admin@krishnamahawar.in</a> for research group discounts.
        </div>

        <button className="btn btn-primary btn-full mt-2" onClick={handleAdd}>
          Add to Cart · ₹699
        </button>
      </div>
    </div>
  );
}
