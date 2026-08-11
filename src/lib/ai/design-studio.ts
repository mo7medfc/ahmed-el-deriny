import { resolveDimensions, QUALITY_PROMPT_BLOCK } from "./design-dimensions";

export type FontStyle = "formal" | "decorative" | "modern";
export type ColorStyle = "bw" | "blue_gold" | "red_black" | "full_color";
export type BorderStyle = "simple" | "ornate" | "none";

export interface DesignConfigurationState {
  category?: string | null;
  summary?: string;
  productSlug?: string;
  productName?: string;
  pricingType?: string;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  band?: string;
  bandLabel?: string;
  sizeLabel?: string;
  sizeId?: string;
  shape?: string;
  variant?: string;
  variantLabel?: string;
  inkColor?: string;
  widthCm?: number;
  heightCm?: number;
  width?: number;
  height?: number;
  quantity?: number;
  [key: string]: unknown;
}

export interface DesignChoices {
  fontStyle: FontStyle;
  colorStyle: ColorStyle;
  borderStyle: BorderStyle;
  mainText: string;
  subText: string;
}

export function parseStampSizeId(sizeId?: string) {
  if (!sizeId) return {};
  const match = sizeId.match(/^(rect|oval|round|square)-([\d.]+)-([\d.]+)$/);
  if (!match) return {};
  return {
    shape: match[1],
    widthCm: parseFloat(match[2]),
    heightCm: parseFloat(match[3]),
  };
}

const FONT_LABELS: Record<FontStyle, { ar: string; en: string; prompt: string }> = {
  formal: {
    ar: "خط رسمي",
    en: "Formal",
    prompt: "formal professional Arabic Naskh typography, clean government/business style, highly legible",
  },
  decorative: {
    ar: "خط حلو / مزخرف",
    en: "Decorative",
    prompt: "elegant decorative Arabic calligraphy style, artistic but readable, premium ornamental letterforms",
  },
  modern: {
    ar: "خط عصري",
    en: "Modern",
    prompt: "modern geometric Arabic sans-serif typography, bold contemporary commercial style",
  },
};

const COLOR_LABELS: Record<ColorStyle, string> = {
  bw: "black ink on white background only, high contrast monochrome",
  blue_gold: "deep navy blue and gold accent colors on white",
  red_black: "red and black two-color commercial print palette on white",
  full_color: "professional full color palette, balanced CMYK-friendly colors on white",
};

const BORDER_LABELS: Record<BorderStyle, string> = {
  simple: "clean simple rectangular border frame",
  ornate: "elegant ornamental decorative border frame",
  none: "no outer border, clean open layout",
};

const SHAPE_LABELS: Record<string, string> = {
  round: "circular round stamp face",
  oval: "oval stamp face",
  rect: "horizontal rectangular stamp face",
  square: "square stamp face",
};

export function getProductTypeFromCategory(category?: string | null): string {
  const map: Record<string, string> = {
    Stamps: "stamp",
    dafater: "notebook",
    notebooks_books_booklets: "catalog",
    notebooks_invoices: "notebook",
    envelopes: "envelope",
    brochures: "brochure",
    BusinessCard: "business_card",
    Outdoor: "banner",
    Indoor: "banner",
    Stands: "banner",
    PopUp: "banner",
    DTF: "banner",
    DeskSets: "other",
    WoodDeskSets: "other",
    DeskBases: "other",
    Nameplates: "other",
  };
  return map[category || ""] || "other";
}

export function resolveProductType(
  productType?: string | null,
  pricingCategory?: string | null
): string {
  const inferred = getProductTypeFromCategory(pricingCategory);
  if (
    (!productType || productType === "other" || productType === "design") &&
    inferred !== "other"
  ) {
    return inferred;
  }
  return productType || inferred;
}

export function getImageSize(
  category?: string | null,
  config?: DesignConfigurationState
): "1024x1024" | "1792x1024" | "1024x1792" {
  return resolveDimensions(config, category).imageSize;
}

export function buildDesignPrompt(
  config: DesignConfigurationState,
  choices: DesignChoices,
  productName: string
): { prompt: string; productType: string; imageSize: "1024x1024" | "1792x1024" | "1024x1792"; brief: string } {
  const category = config.category;
  const productType = getProductTypeFromCategory(category);
  const imageSize = getImageSize(category, config);
  const font = FONT_LABELS[choices.fontStyle];
  const isStamp = category === "Stamps";

  const parsed = parseStampSizeId(config.sizeId as string | undefined);
  const shape = (config.shape as string) || parsed.shape || "rect";
  const widthCm = config.widthCm || parsed.widthCm || config.width;
  const heightCm = config.heightCm || parsed.heightCm || config.height;

  const lines: string[] = [
    QUALITY_PROMPT_BLOCK,
    "FLAT print-ready artwork viewed straight-on. NO mockup, NO phone, NO laptop, NO hands, NO 3D scene, NO photo of paper on desk.",
    `Product: ${productName}`,
  ];

  if (config.summary) lines.push(`Order specs: ${config.summary}`);
  if (config.bandLabel) lines.push(`Stamp machine type: ${config.bandLabel}`);
  if (config.sizeLabel) lines.push(`Selected size: ${config.sizeLabel}`);
  if (widthCm && heightCm) {
    lines.push(
      `MANDATORY exact size: ${widthCm} cm × ${heightCm} cm`,
      `MANDATORY aspect ratio: ${widthCm}:${heightCm} — artwork must fill canvas with these exact proportions`
    );
  }
  if (config.variantLabel) lines.push(`Variant: ${config.variantLabel}`);
  if (config.inkColor) lines.push(`Ink color: ${config.inkColor}`);
  if (config.quantity) lines.push(`Quantity: ${config.quantity}`);

  if (isStamp) {
    lines.push(
      `Design a professional RUBBER STAMP IMPRINT / CLICHE artwork for printing.`,
      `Stamp face shape: ${SHAPE_LABELS[shape] || shape}.`,
      `Aspect ratio must match ${widthCm || "?"} x ${heightCm || "?"} cm.`,
      `Typography: ${font.prompt}.`,
      `Color style: ${COLOR_LABELS[choices.colorStyle]}.`,
      `Border: ${BORDER_LABELS[choices.borderStyle]}.`,
      `Main stamp text (Arabic): "${choices.mainText}"`,
      choices.subText ? `Secondary line text: "${choices.subText}"` : "",
      "Layout: centered balanced stamp composition, all text fully inside stamp boundary, crisp edges, commercial Egyptian stamp quality, looks like real stamp imprint artwork ready for production.",
      "Beautiful elegant stamp design — premium typography, NOT plain or basic.",
      "Ultra high resolution, sharp vector-like clarity."
    );
  } else {
    lines.push(
      `Design type: ${productType} for Ahmed El-Deriny printing house.`,
      `Typography: ${font.prompt}.`,
      `Color style: ${COLOR_LABELS[choices.colorStyle]}.`,
      `Border/frames: ${BORDER_LABELS[choices.borderStyle]}.`,
      `Headline text: "${choices.mainText}"`,
      choices.subText ? `Sub text: "${choices.subText}"` : "",
      "Professional commercial print layout, balanced whitespace, premium Egyptian market aesthetic, ultra high resolution flat artwork."
    );
  }

  const prompt = lines.filter(Boolean).join("\n");
  const brief = [
    config.summary,
    `${font.ar}`,
    choices.mainText,
    choices.subText,
  ]
    .filter(Boolean)
    .join(" · ");

  return { prompt, productType, imageSize, brief };
}

export const FONT_OPTIONS: { id: FontStyle; ar: string; en: string }[] = [
  { id: "formal", ar: "خط رسمي", en: "Formal" },
  { id: "decorative", ar: "خط حلو", en: "Decorative" },
  { id: "modern", ar: "خط عصري", en: "Modern" },
];

export const COLOR_OPTIONS: { id: ColorStyle; ar: string; en: string }[] = [
  { id: "bw", ar: "أسود وأبيض", en: "Black & white" },
  { id: "blue_gold", ar: "أزرق وذهبي", en: "Blue & gold" },
  { id: "red_black", ar: "أحمر وأسود", en: "Red & black" },
  { id: "full_color", ar: "ملون", en: "Full color" },
];

export const BORDER_OPTIONS: { id: BorderStyle; ar: string; en: string }[] = [
  { id: "simple", ar: "إطار بسيط", en: "Simple border" },
  { id: "ornate", ar: "إطار مزخرف", en: "Ornate border" },
  { id: "none", ar: "بدون إطار", en: "No border" },
];
