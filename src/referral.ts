import type { ViewState } from './App';

export interface Referral {
  code: string;
  referrer: string | null;
}

export async function validateReferral(rawCode: string): Promise<Referral | null> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return null;
  try {
    const res = await fetch(`/api/referral-validate?code=${encodeURIComponent(code)}`);
    const data = await res.json();
    if (data.success && data.data?.valid) {
      return { code, referrer: data.data.referrer?.name || null };
    }
  } catch {
    // Treat network errors as an invalid code
  }
  return null;
}

// Promo links: ?product=research-mode&code=RESEARCH-IMPACT opens that product
// with the referral code pre-applied, so podcast viewers skip straight to buying.
const PRODUCT_VIEWS: Record<string, ViewState> = {
  'research-mode': 'customize-research-mode',
  nit: 'customize-nit',
  tshirt: 'customize-research',
  hoodie: 'customize-research-hoodie',
};

export function readPromoLink(): { view: ViewState | null; code: string | null } {
  const params = new URLSearchParams(window.location.search);
  const view = PRODUCT_VIEWS[(params.get('product') || '').toLowerCase()] ?? null;
  const code = (params.get('code') || '').trim().toUpperCase();
  return { view, code: /^[A-Z0-9-]{3,20}$/.test(code) ? code : null };
}
