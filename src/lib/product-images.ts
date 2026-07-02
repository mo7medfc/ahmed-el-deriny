const BASE = "/images/products";

/** Category slug → representative product photo (storefront categories only) */
export const categoryImages: Record<string, string> = {
  outdoor: `${BASE}/outdoor-banner.jpg`,
  indoor: `${BASE}/indoor-print.jpg`,
  stands: `${BASE}/roll-up.jpg`,
  stamps: `${BASE}/stamps.jpg`,
  envelopes: `${BASE}/envelopes.jpg`,
  uvprinting: `${BASE}/uv-printing.jpg`,
  dtf: `${BASE}/dtf-tshirt.jpg`,
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
    test: (t) => /pop-up|popup|pop_up|بوب\s*أ?ب|كاونتر|طاولة\s*ترويج/i.test(t),
    image: `${BASE}/pop-up.jpg`,
    altAr: "ستاند Pop Up للمعارض",
    altEn: "Pop-up exhibition display",
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
    test: (t) => /stamp|seal|ختم|ختام|clich|timestamp/i.test(t),
    image: `${BASE}/stamps.jpg`,
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
  if (input.image?.startsWith("/")) return input.image;
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
