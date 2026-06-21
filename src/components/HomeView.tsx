import type { ViewState } from '../App';

interface Props {
  onNavigate: (view: ViewState) => void;
}

export default function HomeView({ onNavigate }: Props) {
  return (
    <>
      <section className="hero-section">
        <div className="hero-inner">
          <h1>Wear What You've Built</h1>
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
          <div className="product-image-placeholder">
            [ Research &gt; Publish T-Shirt Mockup ]
          </div>
          <h2 className="product-title">Research Publish Merch</h2>
          <p className="product-desc">"build before you speak" on the back. research &gt; publish on the front.</p>
          <button className="btn btn-primary btn-full">Buy Now</button>
        </div>
      </section>
    </>
  );
}
