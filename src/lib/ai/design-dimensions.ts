import type { DesignImageSize } from "./design-prompts";
import {
  type DesignConfigurationState,
  parseStampSizeId,
} from "./design-studio";
import {
  buildProductDesignBlock,
  getProductDesignSpec,
  type ProductDesignSpec,
} from "./product-design-specs";

const ENVELOPE_DIMENSIONS: Record<string, { widthCm: number; heightCm: number }> = {
  american_22_11: { widthCm: 22, heightCm: 11 },
  a5: { widthCm: 22.9, heightCm: 16.2 },
  a4: { widthCm: 32.4, heightCm: 22.9 },
  half_congratulations: { widthCm: 17, heightCm: 25 },
  congratulations: { widthCm: 25, heightCm: 35 },
  a3: { widthCm: 33, heightCm: 45 },
};

/** Parse width×height from slug, name, or size id (e.g. roll-up-80-200, 80×200, american_22_11). */
export function parseDimensionsFromText(
  text?: string | null
): { widthCm?: number; heightCm?: number } {
  if (!text) return {};

  const envelope = ENVELOPE_DIMENSIONS[text];
  if (envelope) return envelope;

  const sizeIdMatch = text.match(/(?:^|[_-])(\d+(?:\.\d+)?)[_x×](\d+(?:\.\d+)?)(?:[_-]|$)/i);
  if (sizeIdMatch) {
    return {
      widthCm: parseFloat(sizeIdMatch[1]),
      heightCm: parseFloat(sizeIdMatch[2]),
    };
  }

  const multiplyMatch = text.match(/(\d+(?:\.\d+)?)\s*[×xX]\s*(\d+(?:\.\d+)?)/);
  if (multiplyMatch) {
    return {
      widthCm: parseFloat(multiplyMatch[1]),
      heightCm: parseFloat(multiplyMatch[2]),
    };
  }

  const slugMatch = text.match(/(?:^|[-_/])(\d{2,3}(?:\.\d+)?)-(\d{2,3}(?:\.\d+)?)(?:[-_/]|$)/);
  if (slugMatch) {
    return {
      widthCm: parseFloat(slugMatch[1]),
      heightCm: parseFloat(slugMatch[2]),
    };
  }

  return {};
}

function resolveFixedBounds(config?: DesignConfigurationState) {
  const minW = config?.minWidth as number | undefined;
  const maxW = config?.maxWidth as number | undefined;
  const minH = config?.minHeight as number | undefined;
  const maxH = config?.maxHeight as number | undefined;

  if (
    minW &&
    maxW &&
    minH &&
    maxH &&
    minW === maxW &&
    minH === maxH &&
    minW > 1 &&
    minH > 1
  ) {
    return { widthCm: minW, heightCm: minH };
  }

  return {};
}

export interface ResolvedDimensions {
  widthCm: number | null;
  heightCm: number | null;
  aspectRatio: number | null;
  shape: string | null;
  sizeLabel: string | null;
  imageSize: DesignImageSize;
  isStamp: boolean;
  spec: ProductDesignSpec | null;
}

const SHAPE_LABELS: Record<string, string> = {
  round: "circular",
  oval: "oval",
  rect: "rectangular",
  square: "square",
};

export function resolveDimensions(
  config?: DesignConfigurationState,
  pricingCategory?: string | null
): ResolvedDimensions {
  const category = config?.category || pricingCategory;
  const isStamp = category === "Stamps";
  const parsed = parseStampSizeId(config?.sizeId as string | undefined);
  const fixed = resolveFixedBounds(config);
  const spec = getProductDesignSpec({
    pricingCategory: category,
    productSlug: config?.productSlug,
    productName: config?.productName,
  });
  const noText = spec?.ignoreTextDimensions === true;
  const fromSlug = noText ? {} : parseDimensionsFromText(config?.productSlug as string | undefined);
  const fromName = noText ? {} : parseDimensionsFromText(config?.productName as string | undefined);
  const fromSummary = noText ? {} : parseDimensionsFromText(config?.summary as string | undefined);
  const fromSizeId =
    ENVELOPE_DIMENSIONS[config?.sizeId as string] ||
    parseDimensionsFromText(config?.sizeId as string | undefined);

  const widthCm =
    config?.widthCm ??
    parsed.widthCm ??
    config?.width ??
    fixed.widthCm ??
    fromSizeId.widthCm ??
    fromSlug.widthCm ??
    fromName.widthCm ??
    fromSummary.widthCm ??
    spec?.printWidthCm ??
    null;
  const heightCm =
    config?.heightCm ??
    parsed.heightCm ??
    config?.height ??
    fixed.heightCm ??
    fromSizeId.heightCm ??
    fromSlug.heightCm ??
    fromName.heightCm ??
    fromSummary.heightCm ??
    spec?.printHeightCm ??
    null;

  const shape = (config?.shape as string) || parsed.shape || null;
  const sizeLabel = (config?.sizeLabel as string) || null;

  let aspectRatio: number | null = null;
  if (widthCm && heightCm && heightCm > 0) {
    aspectRatio = widthCm / heightCm;
  } else if (shape === "round" || shape === "square") {
    aspectRatio = 1;
  }

  const imageSize = computeImageSize(widthCm, heightCm, shape) ?? spec?.imageSize ?? "1024x1024";

  return {
    widthCm,
    heightCm,
    aspectRatio,
    shape,
    sizeLabel,
    imageSize,
    isStamp,
    spec,
  };
}

/** Returns null when nothing about the product hints at an orientation. */
function computeImageSize(
  widthCm?: number | null,
  heightCm?: number | null,
  shape?: string | null
): DesignImageSize | null {
  if (shape === "round" || shape === "square") {
    return "1024x1024";
  }

  const w = widthCm || 0;
  const h = heightCm || 0;

  if (w > 0 && h > 0) {
    const ratio = w / h;
    if (ratio > 1.15) return "1792x1024";
    if (ratio < 0.87) return "1024x1792";
    return "1024x1024";
  }

  return null;
}

export function buildDimensionPromptBlock(
  dims: ResolvedDimensions,
  _pricingCategory?: string | null
): string {
  const lines: string[] = [
    "=== MANDATORY PRINT DIMENSIONS (customer already selected — DO NOT change) ===",
  ];

  if (dims.sizeLabel) {
    lines.push(`Selected size label: ${dims.sizeLabel}`);
  }

  if (dims.widthCm && dims.heightCm) {
    lines.push(
      `EXACT physical size: ${dims.widthCm} cm wide × ${dims.heightCm} cm tall`,
      `EXACT aspect ratio: ${dims.widthCm}:${dims.heightCm} (${(dims.aspectRatio ?? dims.widthCm / dims.heightCm).toFixed(3)}:1 width-to-height)`,
      `The artwork canvas proportions MUST match this ratio precisely — design fills the full frame edge-to-edge with correct proportions.`,
      `All text and elements must fit inside this exact proportion — nothing cropped, nothing overflowing.`
    );
  }

  if (dims.shape) {
    lines.push(
      `Shape: ${SHAPE_LABELS[dims.shape] || dims.shape} stamp/product face`,
      dims.shape === "round"
        ? "Circular composition centered in square canvas, content inside circle boundary."
        : dims.shape === "oval"
          ? "Oval composition matching the width:height ratio exactly."
          : `Rectangular composition matching ${dims.widthCm || "?"}×${dims.heightCm || "?"} cm exactly.`
    );
  }

  if (dims.isStamp) {
    lines.push(
      "STAMP: flat rubber cliche imprint artwork, black ink on pure white background, crisp commercial stamp quality.",
      "View straight-on, no 3D stamp object, no shadow, no mockup."
    );
  }

  lines.push(`Canvas orientation for image AI: ${dims.imageSize}`);

  const stretchNote = buildCanvasMismatchNote(dims);
  if (stretchNote) lines.push(stretchNote);

  lines.push("=== END DIMENSIONS ===");

  const mediumBlock = buildProductDesignBlock(dims.spec);

  return mediumBlock ? `${lines.join("\n")}\n\n${mediumBlock}` : lines.join("\n");
}

const CANVAS_RATIOS: Record<DesignImageSize, number> = {
  "1024x1024": 1,
  "1792x1024": 1.75,
  "1024x1792": 0.5714,
};

/**
 * The image model only offers square, 3:2 and 2:3 canvases. Roll-ups (1:2.5) and
 * similar formats are far taller than anything it can render, so the layout has
 * to survive being stretched to the real print ratio.
 */
function buildCanvasMismatchNote(dims: ResolvedDimensions): string | null {
  if (!dims.aspectRatio) return null;

  const canvasRatio = CANVAS_RATIOS[dims.imageSize];
  const drift = dims.aspectRatio / canvasRatio;
  if (drift > 0.75 && drift < 1.33) return null;

  return dims.aspectRatio < canvasRatio
    ? "NOTE: the real print is even TALLER than this canvas. Compose in clear horizontal bands (top brand zone, middle hero zone, bottom contact zone) with generous vertical breathing space, so the layout still reads correctly when stretched to the true height. Do NOT rely on a single full-height photo or on elements that must touch both the top and bottom edges."
    : "NOTE: the real print is even WIDER than this canvas. Compose in clear vertical zones with generous horizontal breathing space, so the layout still reads correctly when stretched to the true width. Do NOT rely on elements that must touch both the left and right edges.";
}

export const QUALITY_PROMPT_BLOCK = `DESIGN QUALITY REQUIREMENTS:
- Top-tier Cairo design agency quality — unique, creative, visually stunning, bespoke to customer request.
- Customer description is the PRIMARY creative brief — every name, purpose, and detail must appear in the design.
- Elegant balanced composition with perfect spacing and clear visual hierarchy.
- Crisp gorgeous Arabic typography — formal Naskh, decorative calligraphy, or modern sans as fits the brand.
- Premium Egyptian/Gulf commercial aesthetic — looks expensive, trustworthy, and professionally crafted.
- Thoughtful decorative details: borders, patterns, icons, color accents — NOT empty or template-like.
- Flat 2D print artwork only — NO mockup, NO device, NO hands, NO room photo, NO watermark.`;

export const NEGATIVE_AVOID_BLOCK = `STRICTLY AVOID (these produce bad results):
- Generic centered text on a solid color square — boring Canva template look
- Plain amateur layout with no creative flair
- Ignoring customer's actual text, names, phone numbers from their description
- Wrong medium: stamp designs must NOT look like posters, cards, or social media graphics
- Stamp: NO colored backgrounds (no green/teal/gold cards) — stamps are black ink on white only unless customer asked otherwise
- Repeating the same layout for every product — each design must feel custom
- Printing the customer's instruction/description sentences on the artwork (e.g. "تصميم عصري واحترافي") — only print actual business content`;

export function enrichDesignPrompt(
  prompt: string,
  config?: DesignConfigurationState,
  pricingCategory?: string | null
): { prompt: string; imageSize: DesignImageSize } {
  const dims = resolveDimensions(config, pricingCategory);
  const dimBlock = buildDimensionPromptBlock(dims, pricingCategory);
  return {
    prompt: `${dimBlock}\n\n${QUALITY_PROMPT_BLOCK}\n\n${prompt}`,
    imageSize: dims.imageSize,
  };
}
