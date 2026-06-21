import { useState } from 'react';
import type { CartItem } from '../App';

interface Props {
  onAddToCart: (item: CartItem) => void;
}

export default function ResearchCustomizer({ onAddToCart }: Props) {
  const [view, setView] = useState<'front' | 'back'>('front');
  const [userName, setUserName] = useState('');

  const handleAdd = () => {
    onAddToCart({
      id: Date.now().toString(),
      type: 'research',
      title: 'Research Publish T-Shirt',
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
          
          <div className="preview-text">
            {view === 'front' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '2.5rem', color: '#000', letterSpacing: '-0.04em' }}>
                  research &gt; publish
                </div>
                {userName && <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>{userName}</div>}
              </div>
            ) : (
              <div style={{ fontSize: '1.5rem', color: '#000', letterSpacing: '0.02em', fontWeight: 600 }}>
                build before you speak.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="form-col">
        <h2 className="mb-8">Research Publish Merch</h2>
        <p className="subtext" style={{ fontSize: '1rem', marginBottom: '32px' }}>
          Standard fit. Premium cotton. A daily reminder of the real work.
        </p>

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

        <button className="btn btn-primary btn-full mt-4" onClick={handleAdd}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}
