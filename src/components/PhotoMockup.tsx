import type { ReactNode } from 'react';
import './PhotoMockup.css';

interface Props {
  image: { src: string; ratio: number };
  alt: string;
  // Overlays are positioned in % of the photo and sized in cqw so they scale with it
  children?: ReactNode;
}

export default function PhotoMockup({ image, alt, children }: Props) {
  return (
    <div className="photo-mockup" style={{ aspectRatio: image.ratio }}>
      <img src={image.src} alt={alt} draggable={false} />
      {children}
    </div>
  );
}

interface PrintProps {
  x: number;
  y: number;
  size: number;
  align?: 'center' | 'right';
  color?: string;
  weight?: number;
  children: ReactNode;
}

export function PrintText({ x, y, size, align = 'center', color = '#fff', weight = 800, children }: PrintProps) {
  return (
    <span
      className="photo-print"
      style={{
        top: `${y}%`,
        fontSize: `${size}cqw`,
        color,
        fontWeight: weight,
        ...(align === 'right'
          ? { right: `${100 - x}%`, transform: 'translateY(-50%)' }
          : { left: `${x}%`, transform: 'translate(-50%, -50%)' }),
      }}
    >
      {children}
    </span>
  );
}
