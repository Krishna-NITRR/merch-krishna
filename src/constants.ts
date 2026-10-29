export const NIT_OPTIONS = [
  "NIT Trichy", "NIT Surathkal", "NIT Warangal", "NIT Calicut", "NIT Rourkela",
  "MNIT Jaipur", "VNIT Nagpur", "NIT Kurukshetra", "SVNIT Surat", "NIT Durgapur",
  "MNNIT Allahabad", "NIT Silchar", "NIT Raipur", "NIT Meghalaya", "NIT Bhopal",
  "NIT Jalandhar", "NIT Jamshedpur", "NIT Patna", "NIT Goa", "NIT Hamirpur"
];

export const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

// Photo mockups (white studio background removed, placeholder print erased)
export const LONGSLEEVE_FRONT = { src: '/merch/longsleeve-front-blank.png', ratio: 456 / 484 };
export const LONGSLEEVE_BACK = { src: '/merch/longsleeve-back-blank.png', ratio: 448 / 513 };
export const RESEARCH_MODE_BACK = { src: '/merch/research-mode-back.png', ratio: 448 / 513 };

// Font size (cqw) that keeps text within maxWidth cqw, capped at max
export const fitSize = (text: string, max: number, maxWidth: number) =>
  Math.min(max, maxWidth / (0.85 * Math.max(text.length, 1)));
