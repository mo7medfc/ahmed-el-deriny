import { resolveDimensions, buildDimensionPromptBlock } from "../src/lib/ai/design-dimensions";

const cases = [
  { label: "Roll-up 100", category: "Stands", slug: "stands-roll-up-100-banner", name: "رول أب عرض 100 سم — بانر" },
  { label: "X-banner 60x160", category: "Stands", slug: "stands-x-banner-60-160", name: "أكس بانر 60 × 160 سم", widthCm: 60, heightCm: 160 },
  { label: "Pop-up curve 3x5", category: "PopUp", slug: "popup-curve-3x5", name: "بوب أب كيرف 3 × 5" },
  { label: "Outdoor banner 300x150", category: "Outdoor", slug: "outdoor-banner-380g", name: "بانر 380 جرام", widthCm: 300, heightCm: 150 },
  { label: "Indoor backlight 120x80", category: "Indoor", slug: "indoor-backlight", name: "باك لايت", widthCm: 120, heightCm: 80 },
  { label: "DTF 6 pass", category: "DTF", slug: "dtf-6-pass", name: "DTF 6 باص والتطريز", widthCm: 58, heightCm: 100 },
  { label: "UV DTF gold", category: "DTF", slug: "dtf-uv-gold", name: "UV DTF Gold", widthCm: 58, heightCm: 90 },
  { label: "Plotter cutting", category: "Outdoor", slug: "outdoor-plotter-cutting", name: "تقطيع فقط كاتر بلوتر", widthCm: 100, heightCm: 100 },
];

for (const c of cases) {
  const config = {
    category: c.category,
    productSlug: c.slug,
    productName: c.name,
    widthCm: c.widthCm,
    heightCm: c.heightCm,
  };
  const dims = resolveDimensions(config, c.category);
  console.log(`\n########## ${c.label} → ${dims.widthCm}×${dims.heightCm} cm, canvas ${dims.imageSize}, medium: ${dims.spec?.medium}`);
  console.log(buildDimensionPromptBlock(dims, c.category));
}
