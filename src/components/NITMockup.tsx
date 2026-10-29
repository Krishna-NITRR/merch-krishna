import PhotoMockup, { PrintText } from './PhotoMockup';
import { fitSize, LONGSLEEVE_FRONT, LONGSLEEVE_BACK } from '../constants';

interface Props {
  view: 'front' | 'back';
  nitName: string;
  userName?: string;
  batch?: string;
}

export default function NITMockup({ view, nitName, userName, batch }: Props) {
  if (view === 'front') {
    return (
      <PhotoMockup image={LONGSLEEVE_FRONT} alt="NIT long sleeve, front">
        <PrintText x={50} y={36} size={13} weight={800}>nit.</PrintText>
      </PhotoMockup>
    );
  }
  const nit = nitName.toUpperCase();
  const name = userName || 'YOUR NAME';
  return (
    <PhotoMockup image={LONGSLEEVE_BACK} alt="NIT long sleeve, back">
      <PrintText x={50} y={33} size={fitSize(nit, 5, 48)} color="#a085ff">{nit}</PrintText>
      <PrintText x={50} y={41} size={fitSize(name, 9, 52)}>{name}</PrintText>
      {batch && <PrintText x={50} y={48.5} size={4} color="#9997B8" weight={600}>Class of {batch}</PrintText>}
    </PhotoMockup>
  );
}
