/** Human label for how a product's base price is charged (Product.unit). */
const UNIT_LABELS: Record<string, { ar: string; en: string }> = {
  sqm: { ar: "للمتر المربع", en: "per m²" },
  meter: { ar: "للمتر", en: "per meter" },
  piece: { ar: "للقطعة", en: "per piece" },
};

export function getPriceUnitLabel(unit: string | null | undefined, locale: string): string {
  const entry = unit ? UNIT_LABELS[unit] : undefined;
  if (!entry) return "";
  return locale === "ar" ? entry.ar : entry.en;
}
