import { publicPath } from "./public-path";
import { resolveProductImage, type ProductImageInput } from "./product-images";

const BASE = publicPath("/images/products");

/**
 * Curated photorealistic product montage photos (GPT Image 2) for the hero slider.
 */
const SLIDER_HERO_BY_SLUG: Record<string, string> = {
  "dtf-service": `${BASE}/dtf-tshirt.jpg`,
  "indoor-banner-380g": `${BASE}/indoor-print.jpg`,
  "outdoor-banner-280g": `${BASE}/outdoor-banner.jpg`,
  "outdoor-banner-380g": `${BASE}/outdoor-banner.jpg`,
  "indoor-reflective-banner": `${BASE}/outdoor-banner.jpg`,
  "stamps-service": `${BASE}/stamps.jpg`,
  "stands-roll-up-80-200-banner": `${BASE}/rollup-100x200.jpg`,
  "stands-roll-up-85-200-banner": `${BASE}/roll-up.jpg`,
  "stands-x-banner": `${BASE}/x-banner.jpg`,
  "stands-pop-up": `${BASE}/pop-up.jpg`,
};

const SLIDER_HERO_BY_CATEGORY: Record<string, string> = {
  outdoor: `${BASE}/outdoor-banner.jpg`,
  indoor: `${BASE}/indoor-print.jpg`,
  stands: `${BASE}/rollup-100x200.jpg`,
  stamps: `${BASE}/stamps.jpg`,
  dtf: `${BASE}/dtf-tshirt.jpg`,
  uvprinting: `${BASE}/uv-printing.jpg`,
  envelopes: `${BASE}/envelopes.jpg`,
  dafater: `${BASE}/notebooks.jpg`,
  "notebooks-invoices": `${BASE}/notebooks.jpg`,
  "notebooks-books-booklets": `${BASE}/catalogs.jpg`,
  "safety-printing": `${BASE}/safety-vest.jpg`,
  "promotional-gifts": `${BASE}/promotional-gifts.jpg`,
  sublimationgift: `${BASE}/promotional-gifts.jpg`,
};

export function resolveSliderHeroImage(input: ProductImageInput): string {
  if (input.slug && SLIDER_HERO_BY_SLUG[input.slug]) {
    return SLIDER_HERO_BY_SLUG[input.slug];
  }
  if (input.categorySlug && SLIDER_HERO_BY_CATEGORY[input.categorySlug]) {
    return SLIDER_HERO_BY_CATEGORY[input.categorySlug];
  }
  return resolveProductImage(input);
}
