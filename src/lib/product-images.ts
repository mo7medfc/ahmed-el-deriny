/**
 * Product image resolver — maps each product to a photorealistic montage photo.
 * Images generated via: npm run images:generate (GPT Image 2)
 */
import { publicPath } from "./public-path";

const BASE = publicPath("/images/products");

/** Category slug → representative product photo (storefront categories only) */
export const categoryImages: Record<string, string> = {
  outdoor: `${BASE}/outdoor-banner.jpg`,
  indoor: `${BASE}/indoor-print.jpg`,
  stands: `${BASE}/roll-up.jpg`,
  "pop-up": `${BASE}/pop-up.jpg`,
  stamps: `${BASE}/stamp-auto-medium.jpg`,
  envelopes: `${BASE}/envelopes.jpg`,
  uvprinting: `${BASE}/uv-printing.jpg`,
  dtf: `${BASE}/dtf-tshirt.jpg`,
  "desk-sets": `${BASE}/desk-set-black.jpg`,
  "wood-desk-sets": `${BASE}/wood-desk-beech.jpg`,
  certificates: `${BASE}/cert-ribbon.jpg`,
  nameplates: `${BASE}/nameplate-gold.jpg`,
  dafater: `${BASE}/notebooks.jpg`,
  "notebooks-invoices": `${BASE}/notebooks.jpg`,
  "notebooks-books-booklets": `${BASE}/catalogs.jpg`,
  "safety-printing": `${BASE}/safety-vest.jpg`,
  "promotional-gifts": `${BASE}/promotional-gifts.jpg`,
  sublimationgift: `${BASE}/promotional-gifts.jpg`,
};

export interface ProductImageInput {
  slug: string;
  image?: string | null;
  pricingCategory?: string | null;
  legacyId?: string | null;
  categorySlug?: string;
  nameAr?: string;
  nameEn?: string;
}

type ImageRule = {
  test: (text: string) => boolean;
  image: string;
  altAr: string;
  altEn: string;
};

const RULES: ImageRule[] = [
  {
    test: (t) => /desk-set-black|black-grained|مجزع\s*أسود/i.test(t),
    image: `${BASE}/desk-set-black.jpg`,
    altAr: "طقم مكتب جلد مجزع أسود",
    altEn: "Black grained leather desk set",
  },
  {
    test: (t) => /desk-set-brown|brown-grained|بنى\s*محروق/i.test(t),
    image: `${BASE}/desk-set-brown.jpg`,
    altAr: "طقم مكتب جلد مجزع بنى محروق",
    altEn: "Burnt brown grained leather desk set",
  },
  {
    test: (t) => /nameplate-gold|باغة\s*ذهب/i.test(t),
    image: `${BASE}/nameplate-gold.jpg`,
    altAr: "باغة ذهبى محفور عليها الاسم",
    altEn: "Gold engraved desk nameplate",
  },
  {
    test: (t) => /nameplate-silver|باغة\s*فض/i.test(t),
    image: `${BASE}/nameplate-silver.jpg`,
    altAr: "باغة فضى محفور عليها الاسم",
    altEn: "Silver engraved desk nameplate",
  },
  {
    test: (t) => /cert-ribbon|كافر\s*فيونكة/i.test(t),
    image: `${BASE}/cert-ribbon.jpg`,
    altAr: "كافر فيونكة بالشهادة",
    altEn: "Ribbon certificate cover",
  },
  {
    test: (t) => /cert-wood|كافر\s*خشب/i.test(t),
    image: `${BASE}/cert-wood.jpg`,
    altAr: "كافر خشب بالشهادة",
    altEn: "Wood certificate cover",
  },
  {
    test: (t) => /cert-grad|كاب\s*تخرج/i.test(t),
    image: `${BASE}/cert-grad.jpg`,
    altAr: "كافر كاب تخرج بالشهادة",
    altEn: "Graduation certificate cover",
  },
  {
    test: (t) => /cert-stamp|كافر\s*بالبصمة/i.test(t),
    image: `${BASE}/cert-stamp.jpg`,
    altAr: "كافر بالبصمة بالشهادة",
    altEn: "Foil stamp certificate cover",
  },
  {
    test: (t) => /cert-frame|برواز\s*بصمة/i.test(t),
    image: `${BASE}/cert-frame.jpg`,
    altAr: "كافر برواز بصمة بالشهادة",
    altEn: "Framed foil certificate cover",
  },
  {
    test: (t) => /cert-strip|كافر\s*شريطة/i.test(t),
    image: `${BASE}/cert-strip.jpg`,
    altAr: "كافر شريطة بالشهادة",
    altEn: "Tassel strip certificate cover",
  },
  {
    test: (t) => /certificate|certificates|شهادة|كافر|تقدير/i.test(t),
    image: `${BASE}/cert-ribbon.jpg`,
    altAr: "شهادة تقدير",
    altEn: "Appreciation certificate",
  },
  {
    test: (t) => /wood-desk-dark|dark-brown|بني\s*غامق/i.test(t),
    image: `${BASE}/wood-desk-dark.jpg`,
    altAr: "طقم مكتب خشب بني غامق",
    altEn: "Dark brown wooden desk set",
  },
  {
    test: (t) => /wood-desk-deep|deep-brown|بني\s*داكن/i.test(t),
    image: `${BASE}/wood-desk-deep.jpg`,
    altAr: "طقم مكتب خشب بني داكن",
    altEn: "Deep brown wooden desk set",
  },
  {
    test: (t) => /wood-desk-beech|wooddesksets-zan|خشب\s*زان/i.test(t),
    image: `${BASE}/wood-desk-beech.jpg`,
    altAr: "طقم مكتب خشب زان",
    altEn: "Beech wood desk set",
  },
  {
    test: (t) => /wood-desk|wooddesk|خشب\s*بني/i.test(t),
    image: `${BASE}/wood-desk-beech.jpg`,
    altAr: "طقم مكتب خشب زان",
    altEn: "Beech wood desk set",
  },
  {
    test: (t) => /desk-set|desksets|طقم\s*مكتب/i.test(t),
    image: `${BASE}/desk-set-black.jpg`,
    altAr: "طقم مكتب محفور الاسم",
    altEn: "Engraved leather desk set",
  },
  {
    test: (t) => /nameplate|باغة/i.test(t),
    image: `${BASE}/nameplate-gold.jpg`,
    altAr: "باغة محفور عليها الاسم",
    altEn: "Engraved desk nameplate",
  },
  {
    test: (t) => /roll-up|rollup|roll_up|رول\s*أ?ب/i.test(t),
    image: `${BASE}/roll-up.jpg`,
    altAr: "ستاند رول أب للمعارض والمحلات",
    altEn: "Roll-up banner stand for exhibitions",
  },
  {
    test: (t) => /x-banner|x_banner|اكس\s*بانر/i.test(t),
    image: `${BASE}/x-banner.jpg`,
    altAr: "ستاند X-Banner للعرض",
    altEn: "X-Banner display stand",
  },
  {
    test: (t) => /pop-up|popup|pop_up|بوب\s*أ?ب|كاونتر|طاولة\s*ترويج|adjust|أدجاست/i.test(t),
    image: `${BASE}/pop-up.jpg`,
    altAr: "ستاند Pop Up للمعارض",
    altEn: "Pop-up exhibition display",
  },
  {
    test: (t) => /uv[-_\s]?dtf/i.test(t),
    image: `${BASE}/uv-printing.jpg`,
    altAr: "طباعة UV DTF بنص بارز",
    altEn: "UV DTF printing with raised finish",
  },
  {
    test: (t) => /plotter|كاتر\s*بلوتر|تقطيع/i.test(t),
    image: `${BASE}/vinyl-roll.jpg`,
    altAr: "تقطيع كاتر بلوتر للفينيل",
    altEn: "Cutter-plotter vinyl cutting",
  },
  {
    test: (t) => /see-through|سي\s*ثرو/i.test(t),
    image: `${BASE}/vinyl-roll.jpg`,
    altAr: "خامة سي ثرو للواجهات الزجاجية",
    altEn: "See-through media for glass façades",
  },
  {
    test: (t) => /indoor-glossy|indoor-banner|جلوسي|canvas|كانفس|backlight|باك\s*لايت/i.test(t),
    image: `${BASE}/indoor-print.jpg`,
    altAr: "مطبوعات إندور — جلوسي وكانفس وباك لايت",
    altEn: "Indoor prints — glossy, canvas and backlight",
  },
  {
    test: (t) => /vinyl|فينيل|frosted|صقيل|transparent-vinyl|reflective-vinyl/i.test(t),
    image: `${BASE}/vinyl-roll.jpg`,
    altAr: "رول فينيل للطباعة",
    altEn: "Vinyl roll for printing",
  },
  {
    test: (t) => /flex|فليكس/i.test(t),
    image: `${BASE}/vinyl-flex.jpg`,
    altAr: "بانر فليكس للطباعة الخارجية",
    altEn: "Flex banner for outdoor printing",
  },
  {
    test: (t) => /banner|بانر|election|انتخابات|reflective-banner/i.test(t),
    image: `${BASE}/outdoor-banner.jpg`,
    altAr: "بانر إعلاني خارجي",
    altEn: "Large outdoor advertising banner",
  },
  {
    test: (t) => /lamination|لامين|glitter|glossy|لامع|see-through|سي\s*ثرو/i.test(t),
    image: `${BASE}/lamination.jpg`,
    altAr: "طباعة وتشطيب لامينيشن",
    altEn: "Print finishing and lamination",
  },
  {
    test: (t) => /stamp-wood-hand|wood-hand|يد\s*خشب/i.test(t),
    image: `${BASE}/stamp-wood-hand.jpg`,
    altAr: "ختم يد خشب",
    altEn: "Wooden hand stamp",
  },
  {
    test: (t) => /stamp-auto-small|auto-small|أتوماتيك\s*صغير/i.test(t),
    image: `${BASE}/stamp-auto-small.jpg`,
    altAr: "ختم أتوماتيك صغير",
    altEn: "Small automatic stamp",
  },
  {
    test: (t) => /stamp-auto-medium|auto-medium|أتوماتيك\s*وسط/i.test(t),
    image: `${BASE}/stamp-auto-medium.jpg`,
    altAr: "ختم أتوماتيك وسط",
    altEn: "Medium automatic stamp",
  },
  {
    test: (t) => /stamp-auto-large|auto-large|أتوماتيك\s*كبير/i.test(t),
    image: `${BASE}/stamp-auto-large.jpg`,
    altAr: "ختم أتوماتيك كبير",
    altEn: "Large automatic stamp",
  },
  {
    test: (t) => /stamp-round-5|round-5|مدور\s*5/i.test(t),
    image: `${BASE}/stamp-round-5.jpg`,
    altAr: "ختم مدور 5 × 5",
    altEn: "Round stamp 5 × 5",
  },
  {
    test: (t) => /stamp-round-4|round-4|مدور\s*4/i.test(t),
    image: `${BASE}/stamp-round-4.jpg`,
    altAr: "ختم مدور 4 × 4",
    altEn: "Round stamp 4 × 4",
  },
  {
    test: (t) => /stamp-rect-3x7|rect-3x7|3\s*[×x*]\s*7/i.test(t),
    image: `${BASE}/stamp-rect-3x7.jpg`,
    altAr: "ختم 3 × 7",
    altEn: "Stamp 3 × 7",
  },
  {
    test: (t) => /stamp-date-company|date-company|تاريخ\s*\+\s*اسم|اسم\s*الشركة/i.test(t),
    image: `${BASE}/stamp-date-company.jpg`,
    altAr: "ختم تاريخ + اسم الشركة",
    altEn: "Date + company name stamp",
  },
  {
    test: (t) => /stamp-date-only|date-only|تاريخ\s*فقط/i.test(t),
    image: `${BASE}/stamp-date-only.jpg`,
    altAr: "ختم تاريخ فقط",
    altEn: "Date stamp only",
  },
  {
    test: (t) => /stamp-embosser|embosser|ضاغط|أكلاشية/i.test(t),
    image: `${BASE}/stamp-embosser.jpg`,
    altAr: "ماكينة ضاغط بالأكلاشية",
    altEn: "Embossing press with die",
  },
  {
    test: (t) => /stamp-cliche-only|cliche-only|سريلة/i.test(t),
    image: `${BASE}/stamp-cliche-only.jpg`,
    altAr: "سريلة فقط بدون ماكينة",
    altEn: "Rubber die only",
  },
  {
    test: (t) => /stamp-square-4|square-4|مربع\s*4/i.test(t),
    image: `${BASE}/stamp-square-4.jpg`,
    altAr: "ختم مربع 4 × 4",
    altEn: "Square stamp 4 × 4",
  },
  {
    test: (t) => /stamp-pocket|pocket|ختم\s*الجيب/i.test(t),
    image: `${BASE}/stamp-pocket.jpg`,
    altAr: "ختم الجيب",
    altEn: "Pocket stamp",
  },
  {
    test: (t) => /stamp|seal|ختم|ختام|clich|timestamp/i.test(t),
    image: `${BASE}/stamp-auto-medium.jpg`,
    altAr: "أختام مطاطية وأوتوماتيك",
    altEn: "Rubber and self-inking stamps",
  },
  {
    test: (t) => /business.?card|كارت|كروت\s*شخص|businesscard/i.test(t),
    image: `${BASE}/business-cards.jpg`,
    altAr: "كروت شخصية مطبوعة",
    altEn: "High-quality printed business cards",
  },
  {
    test: (t) => /envelope|مظروف/i.test(t),
    image: `${BASE}/envelopes.jpg`,
    altAr: "مظاريف مطبوعة",
    altEn: "Printed envelopes",
  },
  {
    test: (t) => /brochure|بروشور|فلاير|flyer/i.test(t),
    image: `${BASE}/brochures.jpg`,
    altAr: "بروشورات وفلايرات مطبوعة",
    altEn: "Printed brochures and flyers",
  },
  {
    test: (t) => /catalog|كتالوج|booklet|كتيب/i.test(t),
    image: `${BASE}/catalogs.jpg`,
    altAr: "كتالوجات وكتيبات مطبوعة",
    altEn: "Printed catalogs and booklets",
  },
  {
    test: (t) => /notebook|invoice|دفتر|فاتور/i.test(t),
    image: `${BASE}/notebooks.jpg`,
    altAr: "دفاتر وفواتير مطبوعة",
    altEn: "Printed notebooks and invoices",
  },
  {
    test: (t) =>
      /vest|فيست|safety|سلامة|worker_vest|engineer_vest|reflective/i.test(t),
    image: `${BASE}/safety-vest.jpg`,
    altAr: "فيستات سلامة مطبوعة",
    altEn: "Printed safety vests",
  },
  {
    test: (t) => /dtf|heat.?press|تي\s*شرت|tshirt|t-shirt|تيشرت/i.test(t),
    image: `${BASE}/dtf-tshirt.jpg`,
    altAr: "طباعة DTF على التيشرتات",
    altEn: "DTF and heat-press printing on apparel",
  },
  {
    test: (t) => /flag|علم|أعلام/i.test(t),
    image: `${BASE}/flags.jpg`,
    altAr: "أعلام مطبوعة",
    altEn: "Printed flags",
  },
  {
    test: (t) => /fabric.?bag|شنط\s*قماش|tot/i.test(t),
    image: `${BASE}/fabric-bag.jpg`,
    altAr: "شنط قماش مطبوعة",
    altEn: "Printed fabric tote bags",
  },
  {
    test: (t) => /paper.?bag|شنط\s*ورق/i.test(t),
    image: `${BASE}/paper-bags.jpg`,
    altAr: "شنط ورق مطبوعة",
    altEn: "Printed paper bags",
  },
  {
    test: (t) => /kraft/i.test(t),
    image: `${BASE}/kraft-bags.jpg`,
    altAr: "شنط Kraft مطبوعة",
    altEn: "Printed kraft bags",
  },
  {
    test: (t) => /gift|هدي|sublimation|promotional/i.test(t),
    image: `${BASE}/promotional-gifts.jpg`,
    altAr: "هدايا ترويجية مطبوعة",
    altEn: "Promotional printed gifts",
  },
  {
    test: (t) => /uv/i.test(t),
    image: `${BASE}/uv-printing.jpg`,
    altAr: "طباعة UV على خامات متنوعة",
    altEn: "UV printing on various materials",
  },
  {
    test: (t) => /indoor|إندور|poster|بوستر|cutter|plotter|print-and-cut/i.test(t),
    image: `${BASE}/indoor-print.jpg`,
    altAr: "مطبوعات داخلية وبوسترات",
    altEn: "Indoor prints and posters",
  },
  {
    test: (t) => /outdoor|أوت\s*دور|out\s*door/i.test(t),
    image: `${BASE}/outdoor-banner.jpg`,
    altAr: "مطبوعات خارجية — بانر وفليكس",
    altEn: "Outdoor prints — banners and flex",
  },
];

const DEFAULT_IMAGE = `${BASE}/default-printing.jpg`;

function buildSearchText(input: ProductImageInput): string {
  return [
    input.slug,
    input.legacyId,
    input.pricingCategory,
    input.categorySlug,
    input.nameAr,
    input.nameEn,
  ]
    .filter(Boolean)
    .join(" ");
}

export function resolveProductImage(input: ProductImageInput): string {
  if (input.image?.startsWith("/")) return publicPath(input.image);
  if (input.image?.startsWith("http")) return input.image;

  const text = buildSearchText(input);
  for (const rule of RULES) {
    if (rule.test(text)) return rule.image;
  }

  if (input.categorySlug && categoryImages[input.categorySlug]) {
    return categoryImages[input.categorySlug];
  }

  const legacyKey = input.pricingCategory?.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  if (legacyKey && categoryImages[legacyKey]) {
    return categoryImages[legacyKey];
  }

  return DEFAULT_IMAGE;
}

export function resolveProductImageAlt(input: ProductImageInput, locale: string): string {
  const text = buildSearchText(input);
  for (const rule of RULES) {
    if (rule.test(text)) return locale === "ar" ? rule.altAr : rule.altEn;
  }
  if (input.categorySlug && categoryImages[input.categorySlug]) {
    const name = locale === "ar" ? input.nameAr : input.nameEn;
    return name || (locale === "ar" ? "منتج مطبوع" : "Printed product");
  }
  return locale === "ar" ? "منتج طباعة احترافي" : "Professional printing product";
}

/** @deprecated use resolveProductImage */
export function getProductImage(slug: string, dbImage?: string | null) {
  return resolveProductImage({ slug, image: dbImage });
}

/** @deprecated use resolveProductImageAlt */
export function getProductImageAlt(slug: string, locale: string) {
  return resolveProductImageAlt({ slug }, locale);
}

export function getCategoryImage(categorySlug: string): string {
  return categoryImages[categorySlug] || DEFAULT_IMAGE;
}

