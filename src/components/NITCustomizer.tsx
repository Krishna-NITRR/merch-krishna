import { useState } from 'react';
import type { CartItem } from '../App';
import LazyMerch3D from './LazyMerch3D';

interface Props {
  onAddToCart: (item: CartItem) => void;
}

const NIT_OPTIONS = [
  "NIT Trichy", "NIT Surathkal", "NIT Warangal", "NIT Calicut", "NIT Rourkela",
  "MNIT Jaipur", "VNIT Nagpur", "NIT Kurukshetra", "SVNIT Surat", "NIT Durgapur",
  "MNNIT Allahabad", "NIT Silchar", "NIT Raipur", "NIT Meghalaya", "NIT Bhopal",
  "NIT Jalandhar", "NIT Jamshedpur", "NIT Patna", "NIT Goa", "NIT Hamirpur"
];

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export default function NITCustomizer({ onAddToCart }: Props) {
  const [view, setView] = useState<'front' | 'back'>('front');
  const [mode, setMode] = useState<'2d' | '3d'>('3d');
  const [nitName, setNitName] = useState(NIT_OPTIONS[0]);
  const [userName, setUserName] = useState('');
  const [batch, setBatch] = useState('');
  const [size, setSize] = useState('L');

  const handleAdd = () => {
    onAddToCart({
      id: Date.now().toString(),
      type: 'nit',
      title: 'NIT Identity Hoodie',
      price: 499,
      size,
      quantity: 1,
      details: { nitName, userName, batch }
    });
  };

  return (
    <div className="customizer-layout">
      <div className="preview-col">
        <div className="preview-container">
          <div className="view-mode-toggle" role="group" aria-label="Preview mode">
            <button className={mode === '3d' ? 'active' : ''} onClick={() => setMode('3d')}>3D</button>
            <button className={mode === '2d' ? 'active' : ''} onClick={() => setMode('2d')}>2D</button>
          </div>
          <button className="preview-toggle" onClick={() => setView(view === 'front' ? 'back' : 'front')}>
            Switch to {view === 'front' ? 'Back' : 'Front'}
          </button>
          
          {mode === '3d' ? (
            <LazyMerch3D product="nit" view={view} userName={userName} nitName={nitName} batch={batch} />
          ) : (
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
          )}
        </div>
      </div>

      <div className="form-col">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.6rem' }}>Customize Your NIT Hoodie</h2>
            <p style={{ color: 'var(--tm)', fontSize: '0.9rem', margin: '4px 0 0' }}>Heavyweight 380 GSM fleece · Premium embroidery</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#a085ff' }}>₹499</div>
            <div style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: 600 }}>Free India Shipping</div>
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Select your NIT</label>
          <select className="form-select" value={nitName} onChange={e => setNitName(e.target.value)}>
            {NIT_OPTIONS.map(nit => <option key={nit} value={nit}>{nit}</option>)}
          </select>
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

        <div style={{ marginTop: '20px', fontSize: '0.8rem', color: 'var(--tm)', borderTop: '1px solid var(--div)', paddingTop: '16px', paddingBottom: '16px', lineHeight: '1.5' }}>
          <strong>Want custom lab/dept details?</strong> Email <a href="mailto:admin@krishnamahawar.in" style={{ color: 'var(--p2)' }}>admin@krishnamahawar.in</a>.
        </div>

        <button className="btn btn-primary btn-full mt-2" onClick={handleAdd}>
          Add to Cart · ₹499
        </button>
      </div>
    </div>
  );
}
