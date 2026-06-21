import { useState } from 'react';
import type { CartItem } from '../App';

interface Props {
  onAddToCart: (item: CartItem) => void;
}

const NIT_OPTIONS = [
  "NIT Trichy", "NIT Surathkal", "NIT Warangal", "NIT Calicut", "NIT Rourkela",
  "MNIT Jaipur", "VNIT Nagpur", "NIT Kurukshetra", "SVNIT Surat", "NIT Durgapur",
  "MNNIT Allahabad", "NIT Silchar", "NIT Raipur", "NIT Meghalaya", "NIT Bhopal",
  "NIT Jalandhar", "NIT Jamshedpur", "NIT Patna", "NIT Goa", "NIT Hamirpur"
];

export default function NITCustomizer({ onAddToCart }: Props) {
  const [view, setView] = useState<'front' | 'back'>('front');
  const [nitName, setNitName] = useState(NIT_OPTIONS[0]);
  const [userName, setUserName] = useState('');
  const [batch, setBatch] = useState('');

  const handleAdd = () => {
    onAddToCart({
      id: Date.now().toString(),
      type: 'nit',
      title: 'NIT Identity Hoodie',
      quantity: 1,
      details: { nitName, userName, batch }
    });
  };

  return (
    <div className="customizer-layout">
      <div className="preview-col">
        <div className="preview-container">
          <button className="preview-toggle" onClick={() => setView(view === 'front' ? 'back' : 'front')}>
            Switch to {view === 'front' ? 'Back' : 'Front'}
          </button>
          
          <div className="preview-text" style={{ fontSize: view === 'front' ? '3rem' : '2rem' }}>
            {view === 'front' ? (
              <div style={{ color: 'var(--text)' }}>nit.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{nitName}</div>
                <div style={{ fontSize: '2.5rem' }}>{userName || 'YOUR NAME'}</div>
                {batch && <div style={{ fontSize: '1.25rem', color: 'var(--tm)' }}>Class of {batch}</div>}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="form-col">
        <h2 className="mb-8">Customize Your NIT Merch</h2>
        
        <div className="form-group">
          <label className="form-label">Select your NIT</label>
          <select className="form-select" value={nitName} onChange={e => setNitName(e.target.value)}>
            {NIT_OPTIONS.map(nit => <option key={nit} value={nit}>{nit}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Your Name (Back)</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="e.g. KRISHNA" 
            value={userName} 
            onChange={e => setUserName(e.target.value.toUpperCase())}
            maxLength={15}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Batch / Year (Optional)</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="e.g. 2026" 
            value={batch} 
            onChange={e => setBatch(e.target.value)}
            maxLength={4}
          />
        </div>

        <button className="btn btn-primary btn-full mt-4" onClick={handleAdd}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}
