export const ENVELOPE_PRODUCTS = [
  { id: "american_22_11", nameAr: "American 22 × 11", nameEn: "American 22 × 11", supportsInkjet: true },
  { id: "a5", nameAr: "A5 (22.9 × 16.2)", nameEn: "A5 (22.9 × 16.2)", supportsInkjet: true },
  { id: "a4", nameAr: "A4 (32.4 × 22.9)", nameEn: "A4 (32.4 × 22.9)", supportsInkjet: false },
  { id: "half_congratulations", nameAr: "Half Congratulations (17 × 25)", nameEn: "Half Congratulations (17 × 25)", supportsInkjet: true },
  { id: "congratulations", nameAr: "Congratulations (25 × 35)", nameEn: "Congratulations (25 × 35)", supportsInkjet: false },
  { id: "a3", nameAr: "A3 (33 × 45)", nameEn: "A3 (33 × 45)", supportsInkjet: false },
] as const;

export const ENVELOPE_QUANTITY_TIERS = [500, 1000, 1500, 2000, 2500, 3000, 5000, 10000];
export const ENVELOPE_OFFSET_MIN = 500;
export const ENVELOPE_PLATE_PRICE_DEFAULT = 50;

export function getEnvelopeTierForQuantity(quantity: number) {
  const q = Math.max(0, Math.floor(quantity));
  for (const tier of ENVELOPE_QUANTITY_TIERS) {
    if (q <= tier) return tier;
  }
  return ENVELOPE_QUANTITY_TIERS[ENVELOPE_QUANTITY_TIERS.length - 1];
}
