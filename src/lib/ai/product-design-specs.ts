import type { DesignImageSize } from "./design-prompts";

/**
 * Per-product art direction for the design studio.
 *
 * The image model has no idea what a roll-up or a DTF transfer actually is, so
 * every product carries its real print size plus the layout constraints of its
 * medium (where the base cassette hides artwork, which corners hold frame
 * hooks, whether the background must stay transparent, and so on).
 */
export interface ProductDesignSpec {
  /** Medium name used inside the English image prompt. */
  medium: string;
  /** Medium name shown to the customer in Arabic. */
  mediumAr: string;
  /** Real artwork size when the medium has a standard one. */
  printWidthCm?: number;
  printHeightCm?: number;
  /** Canvas shape to request when no exact print size is known. */
  imageSize?: DesignImageSize;
  /** Typical reading distance — drives type size and detail level. */
  viewingDistance?: string;
  /** Set when the slug/name contains numbers that are not centimetres (pop-up module counts). */
  ignoreTextDimensions?: boolean;
  /** Medium-specific art direction rules. */
  layout: string[];
}

export interface ProductSpecInput {
  pricingCategory?: string | null;
  productSlug?: string | null;
  productName?: string | null;
}

const LARGE_FORMAT_BASE = [
  "Full-bleed artwork: the background must run edge to edge, no white page margin, no paper border.",
  "One dominant message: a short headline, one supporting line, then contact details — never a wall of text.",
];

const TRANSFER_BASE = [
  "Isolated transfer artwork on a FULLY TRANSPARENT background — no background rectangle, no white box, no card behind the graphic.",
  "Bold closed shapes only: no stroke thinner than 1 mm, no soft drop shadows, no fine gradients that would break when cut.",
  "Colours must stay readable on both light and dark garments or surfaces.",
];

function rollUpSpec(widthCm: number): ProductDesignSpec {
  return {
    medium: "roll-up (pull-up) banner stand",
    mediumAr: "ستاند رول أب",
    printWidthCm: widthCm,
    printHeightCm: 200,
    viewingDistance: "2–3 metres, viewer standing",
    layout: [
      ...LARGE_FORMAT_BASE,
      "Extremely tall vertical format — treat it as a standing poster, never as a stretched A4 page.",
      "Top third of the banner is eye level: put the logo and the single biggest headline there.",
      "Keep the bottom 15 cm clear of essential content — the aluminium base cassette and passing people cover it.",
      "Headline must be readable from 3 metres: very large weight, high contrast against the background.",
      "Build a strong vertical rhythm down the banner (gradient, photo, or geometric pattern) so the eye travels top to bottom.",
      "Finish with a compact contact strip (phone, site, social) just above the base zone.",
    ],
  };
}

function xBannerSpec(widthCm: number, heightCm: number): ProductDesignSpec {
  return {
    medium: "X-banner display stand",
    mediumAr: "ستاند أكس بانر",
    printWidthCm: widthCm,
    printHeightCm: heightCm,
    viewingDistance: "2–3 metres, viewer standing",
    layout: [
      ...LARGE_FORMAT_BASE,
      "Vertical X-frame banner: all four corners clip onto the frame hooks — keep every logo and word at least 5 cm away from each corner.",
      "The fabric bows slightly over the central X spine — keep fine detail and small text off the exact centre.",
      "Logo at the top, hero message in the upper half, call to action in the lower third.",
    ],
  };
}

function popUpWallSpec(label: string, wide: boolean): ProductDesignSpec {
  return {
    medium: `modular pop-up exhibition backdrop wall (${label} panel modules)`,
    mediumAr: "حائط بوب أب للمعارض",
    imageSize: wide ? "1792x1024" : "1024x1024",
    viewingDistance: "3–6 metres across an exhibition hall",
    ignoreTextDimensions: true,
    layout: [
      ...LARGE_FORMAT_BASE,
      `Built from a ${label} grid of panel modules — the numbers are module counts, NOT centimetres. The finished wall is roughly 2 to 3 metres across and about 2.3 metres tall.`,
      "Wide backdrop standing behind a stand team: the lower centre is blocked by people and furniture, so keep key content in the upper two thirds.",
      "Place the main logo large and high so it stays visible over a crowd.",
      "Spread secondary branding across the full width rather than stacking everything in the middle.",
      label.includes("curve")
        ? "The wall curves forward at both ends, so the far edges recede — keep essential text inside the central 60% and use the edges for colour, pattern or imagery."
        : "The wall is flat, so the full width is usable — you can run a strong horizontal band or panel split across it.",
    ],
  };
}

const SPECS: Array<{ match: RegExp; spec: (m: RegExpMatchArray) => ProductDesignSpec }> = [
  {
    match: /^stands-roll-up-(\d+)/,
    spec: (m) => rollUpSpec(Number(m[1])),
  },
  {
    match: /^stands-x-banner-(\d+)-(\d+)/,
    spec: (m) => xBannerSpec(Number(m[1]), Number(m[2])),
  },
  {
    match: /^stands-adjust-banner/,
    spec: () => ({
      medium: "adjustable banner backdrop wall",
      mediumAr: "أدجاست بانر",
      printWidthCm: 240,
      printHeightCm: 240,
      viewingDistance: "2–4 metres, people standing in front for photos",
      layout: [
        ...LARGE_FORMAT_BASE,
        "Large square step-and-repeat backdrop used behind speakers and photo moments.",
        "People stand across the lower half — keep the lower half simple and put the lockup in the upper half, or repeat the logo in an even diagonal grid across the whole surface.",
        "If repeating logos, keep the spacing generous and the scale consistent so any crop of the photo still shows a full logo.",
      ],
    }),
  },
  {
    match: /^popup-(straight|curve)-(\d)x(\d)/,
    spec: (m) =>
      popUpWallSpec(`${m[1]} ${m[2]}×${m[3]}`, Number(m[3]) >= 4),
  },
  {
    match: /^popup-counter/,
    spec: () => ({
      medium: "portable pop-up exhibition counter front panel",
      mediumAr: "كاونتر بوب أب",
      imageSize: "1792x1024",
      viewingDistance: "1–2 metres, viewed at waist height",
      layout: [
        ...LARGE_FORMAT_BASE,
        "Wide short front panel of a reception counter — the logo sits centred in the upper half where it clears the counter top.",
        "Keep the bottom 10 cm plain: it falls into shadow and is hidden by visitors standing at the counter.",
        "Simple bold branding only — no paragraphs, this panel is read in a glance.",
      ],
    }),
  },
  {
    match: /^popup-promotion-table/,
    spec: () => ({
      medium: "promotional table cover front panel",
      mediumAr: "برموشن تيبل",
      imageSize: "1792x1024",
      viewingDistance: "1–3 metres in a mall or street activation",
      layout: [
        ...LARGE_FORMAT_BASE,
        "Wide short panel wrapping the front of a promo table, seen from above and at an angle.",
        "Centre a large logo with one short slogan — anything smaller disappears at this angle.",
        "Bright saturated colours so the table stands out in a busy activation space.",
      ],
    }),
  },
  {
    match: /^outdoor-plotter-cutting/,
    spec: () => ({
      medium: "cutter-plotter vinyl cutting file",
      mediumAr: "تقطيع كاتر بلوتر",
      layout: [
        "Pure cut-ready silhouette: ONE solid flat colour on a plain white background.",
        "No gradients, no shadows, no photographic texture, no outlines — only closed solid shapes the blade can follow.",
        "Every shape must be at least 5 mm thick; delete any hairline detail that would tear when weeded.",
        "Letters and shapes stay separated with clear gaps so they can be transferred individually.",
      ],
    }),
  },
  {
    match: /^outdoor-(printed-frosted-vinyl)/,
    spec: () => ({
      medium: "printed frosted window film",
      mediumAr: "فينيل مصنفر مطبوع",
      layout: [
        "Frosted glass film: design as a single-tone etched/sandblasted look, translucent white on clear glass.",
        "No photographic imagery and no gradients — flat frosted shapes, patterns and clean typography only.",
        "Leave open clear areas so the glass still reads as glass and light passes through.",
      ],
    }),
  },
  {
    match: /^outdoor-(printed-reflective-vinyl|reflective-banner)/,
    spec: () => ({
      medium: "reflective safety film / reflective banner",
      mediumAr: "خامة عاكسة",
      viewingDistance: "10–40 metres, often at night under headlights",
      layout: [
        ...LARGE_FORMAT_BASE,
        "Reflective material read at night: extreme contrast, simple bold shapes, no photographic imagery.",
        "Very short text in heavy weight — a handful of words at most.",
        "Use saturated flat colour blocks; mid-tones and subtle detail vanish under headlights.",
      ],
    }),
  },
  {
    match: /^(outdoor|indoor)-(see-through|transparent-vinyl)/,
    spec: (m) => ({
      medium: m[2] === "see-through" ? "see-through perforated window graphic" : "printed transparent window vinyl",
      mediumAr: m[2] === "see-through" ? "سي ثرو للواجهات" : "فينيل شفاف",
      layout: [
        ...LARGE_FORMAT_BASE,
        "Applied to glass and seen against daylight — the design is backlit by the street.",
        "Avoid heavy dark fills across the whole surface; use bold saturated shapes with open breathing space.",
        "Keep text large and high-contrast so it survives the light shining through it.",
      ],
    }),
  },
  {
    match: /^indoor-backlight/,
    spec: () => ({
      medium: "backlit lightbox film",
      mediumAr: "باك لايت",
      viewingDistance: "1–5 metres indoors",
      layout: [
        ...LARGE_FORMAT_BASE,
        "Printed for a lightbox: the artwork glows from behind, so colours read brighter and lighter than on paper.",
        "Avoid large very dark areas — they turn into dead black panels when lit.",
        "Use luminous saturated colours and keep type in a weight that stays crisp when the light blooms around it.",
      ],
    }),
  },
  {
    match: /^indoor-canvas/,
    spec: () => ({
      medium: "stretched gallery canvas print",
      mediumAr: "كانفس",
      viewingDistance: "1–3 metres indoors",
      layout: [
        "Gallery wall art: painterly, decorative, composition centred with calm breathing space.",
        "The outer 3 cm on all four sides wraps around the stretcher frame — continue the background into that margin and keep every important element well inside it.",
        "Rich textured artwork rather than a flat commercial layout.",
      ],
    }),
  },
  {
    match: /^indoor-glossy/,
    spec: () => ({
      medium: "glossy photo poster print",
      mediumAr: "جلوسي",
      viewingDistance: "1–3 metres indoors",
      layout: [
        ...LARGE_FORMAT_BASE,
        "Close viewing distance allows fine detail: refined typography, subtle textures and rich photographic imagery.",
        "Deep saturated colours and clean deep blacks — the gloss finish rewards contrast.",
      ],
    }),
  },
  {
    match: /^dtf-uv/,
    spec: () => ({
      medium: "UV DTF transfer sticker artwork",
      mediumAr: "استيكر UV DTF",
      printWidthCm: 58,
      printHeightCm: 90,
      layout: [
        ...TRANSFER_BASE,
        "UV DTF is applied to mugs, glass, metal and wood with a slightly raised, embossed feel — favour crisp edges and confident shapes.",
        "Compose the graphic as a self-contained badge, logo lockup or illustration that can be cut out and stuck onto a product.",
      ],
    }),
  },
  {
    match: /^dtf-/,
    spec: () => ({
      medium: "DTF heat-transfer artwork for apparel",
      mediumAr: "طباعة DTF على الملابس",
      printWidthCm: 58,
      printHeightCm: 100,
      layout: [
        ...TRANSFER_BASE,
        "Designed to be pressed onto a t-shirt, hoodie or cap — compose it as a chest or back print, not as a poster.",
        "Strong central graphic with punchy lettering; keep the outline of the whole design simple enough to cut around.",
      ],
    }),
  },
];

const CATEGORY_FALLBACK: Record<string, ProductDesignSpec> = {
  Outdoor: {
    medium: "large-format outdoor banner",
    mediumAr: "يافطة أوت دور",
    viewingDistance: "10–30 metres from a street or building façade",
    layout: [
      ...LARGE_FORMAT_BASE,
      "Read from far away: headline of at most 7 words, cap height around one tenth of the banner height.",
      "Extreme colour contrast between text and background — thin type and pale tones disappear outdoors.",
      "Keep a 10 cm clear margin on all four sides for hemming and eyelets.",
    ],
  },
  Indoor: {
    medium: "indoor large-format print",
    mediumAr: "يافطة إن دور",
    viewingDistance: "1–3 metres indoors",
    layout: [
      ...LARGE_FORMAT_BASE,
      "Viewed up close, so fine typography, subtle texture and detailed imagery all work.",
      "Balanced editorial composition with generous whitespace — closer to a magazine spread than a street banner.",
    ],
  },
  Stands: rollUpSpec(100),
  PopUp: popUpWallSpec("straight 3×3", true),
  DTF: {
    medium: "DTF heat-transfer artwork",
    mediumAr: "طباعة DTF",
    printWidthCm: 58,
    printHeightCm: 100,
    layout: TRANSFER_BASE,
  },
};

export function getProductDesignSpec(input: ProductSpecInput): ProductDesignSpec | null {
  const slug = (input.productSlug || "").toLowerCase();

  for (const entry of SPECS) {
    const match = slug.match(entry.match);
    if (match) return entry.spec(match);
  }

  return CATEGORY_FALLBACK[input.pricingCategory || ""] || null;
}

export function buildProductDesignBlock(spec: ProductDesignSpec | null): string {
  if (!spec) return "";

  const lines = [
    "=== PRINT MEDIUM & ART DIRECTION (what this artwork is physically printed on) ===",
    `Medium: ${spec.medium}`,
  ];

  if (spec.viewingDistance) {
    lines.push(`Normal viewing distance: ${spec.viewingDistance}`);
  }

  lines.push(...spec.layout.map((rule) => `- ${rule}`));
  lines.push("=== END PRINT MEDIUM ===");

  return lines.join("\n");
}
