import './TShirtMockup.css';

interface Props {
  view: 'front' | 'back';
  userName?: string;
}

export default function TShirtMockup({ view, userName }: Props) {
  return (
    <div className="merch-shirt">
      {view === 'front' ? (
        <div className="merch-text-front">
          <div className="merch-line">THINK</div>
          <div className="merch-line highlight-red">RESEARCH</div>
          <div className="merch-line">PUBLISH</div>
          <div className="merch-name">{userName || '{YOUR NAME}'}</div>
        </div>
      ) : (
        <div className="merch-text-back">
          <div className="merch-line">THINK</div>
          <div className="merch-line">LIKE A</div>
          <div className="merch-line">RESEARCHER</div>
          <div className="merch-sub">Evidence over assumptions.</div>
          <div className="merch-site">krishnamahawar.in</div>
        </div>
      )}
    </div>
  );
}
