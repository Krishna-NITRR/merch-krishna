import PhotoMockup, { PrintText } from './PhotoMockup';
import { fitSize, LONGSLEEVE_FRONT, RESEARCH_MODE_BACK } from '../constants';

interface Props {
  view: 'front' | 'back';
  nitName?: string;
  batch?: string;
  userName?: string;
}

export default function ResearchModeMockup({ view, nitName, batch, userName }: Props) {
  if (view === 'back') {
    return <PhotoMockup image={RESEARCH_MODE_BACK} alt="Research Mode tee, back" />;
  }
  const nit = nitName?.toUpperCase() || '{NIT NAME}';
  const name = userName || '{YOUR NAME}';
  return (
    <PhotoMockup image={LONGSLEEVE_FRONT} alt="Research Mode tee, front">
      {/* Batch hangs off the right edge of the NIT name, as in the artwork */}
      <div className="photo-print-stack" style={{ left: '48.7%', top: '32.9%' }}>
        <span className="photo-print" style={{ fontSize: `${fitSize(nit, 6.6, 46)}cqw`, color: '#fff', fontWeight: 800 }}>
          {nit}
        </span>
        <span className="photo-print photo-print-sub" style={{ fontSize: '3.3cqw', color: '#fff', fontWeight: 700 }}>
          {batch || '{BATCH}'}
        </span>
      </div>
      <PrintText x={48.5} y={77.5} size={fitSize(name, 3.3, 40)}>{name}</PrintText>
    </PhotoMockup>
  );
}
