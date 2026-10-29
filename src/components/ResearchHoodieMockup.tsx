import PhotoMockup, { PrintText } from './PhotoMockup';
import { fitSize, RESEARCH_HOODIE_FRONT, RESEARCH_HOODIE_BACK } from '../constants';

interface Props {
  view: 'front' | 'back';
  userName?: string;
}

export default function ResearchHoodieMockup({ view, userName }: Props) {
  if (view === 'back') {
    return <PhotoMockup image={RESEARCH_HOODIE_BACK} alt="Research Publish hoodie, back" />;
  }
  const name = userName || 'NAME';
  return (
    <PhotoMockup image={RESEARCH_HOODIE_FRONT} alt="Research Publish hoodie, front">
      <PrintText x={49.4} y={58.1} size={fitSize(name, 3.6, 40)}>{name}</PrintText>
    </PhotoMockup>
  );
}
