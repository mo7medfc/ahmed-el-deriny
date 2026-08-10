export const PRICING_CATEGORY_META: Record<
  string,
  {
    nameAr: string;
    nameEn: string;
    icon: string;
    sortOrder: number;
    editorType: "sqm_groups" | "stands" | "stamps" | "business_cards" | "unit" | "config" | "dtf" | "nbb" | "notebooks_invoices";
  }
> = {
  Outdoor: { nameAr: "اليفط الأوت دور", nameEn: "Outdoor Signage", icon: "sun", sortOrder: 1, editorType: "sqm_groups" },
  Indoor: { nameAr: "اليفط الإن دور", nameEn: "Indoor Signage", icon: "home", sortOrder: 2, editorType: "sqm_groups" },
  Stands: { nameAr: "الأستندات", nameEn: "Stands", icon: "layout", sortOrder: 3, editorType: "stands" },
  PopUp: { nameAr: "البوب أب", nameEn: "Pop-Up Displays", icon: "layout", sortOrder: 4, editorType: "unit" },
  Stamps: { nameAr: "الأختام", nameEn: "Stamps", icon: "stamp", sortOrder: 4, editorType: "stamps" },
  BusinessCard: { nameAr: "كروت شخصية", nameEn: "Business Cards", icon: "credit-card", sortOrder: 5, editorType: "business_cards" },
  envelopes: { nameAr: "المظاريف", nameEn: "Envelopes", icon: "mail", sortOrder: 6, editorType: "unit" },
  UVPrinting: { nameAr: "طباعة UV", nameEn: "UV Printing", icon: "sparkles", sortOrder: 7, editorType: "unit" },
  Tableaux: { nameAr: "تابلوهات", nameEn: "Tableaux", icon: "frame", sortOrder: 8, editorType: "unit" },
  DTF: { nameAr: "طباعة DTF و UV DTF", nameEn: "DTF & UV DTF Printing", icon: "shirt", sortOrder: 5, editorType: "dtf" },
  DeskSets: { nameAr: "طقم المكتب محفور الاسم", nameEn: "Engraved Desk Sets", icon: "briefcase", sortOrder: 6, editorType: "unit" },
  WoodDeskSets: { nameAr: "طقم المكتب خشب الزان", nameEn: "Beech Wood Desk Sets", icon: "briefcase", sortOrder: 7, editorType: "unit" },
  Nameplates: { nameAr: "باغة محفور عليها الاسم", nameEn: "Engraved Nameplates", icon: "badge", sortOrder: 8, editorType: "unit" },
  Flag: { nameAr: "أعلام", nameEn: "Flags", icon: "flag", sortOrder: 10, editorType: "unit" },
  TShirt: { nameAr: "تيشرتات", nameEn: "T-Shirts", icon: "shirt", sortOrder: 11, editorType: "unit" },
  FabricBag: { nameAr: "شنط قماش", nameEn: "Fabric Bags", icon: "shopping-bag", sortOrder: 12, editorType: "unit" },
  IDCard: { nameAr: "بطاقات شخصية", nameEn: "ID Cards", icon: "id-card", sortOrder: 13, editorType: "unit" },
  brochures: { nameAr: "بروشورات", nameEn: "Brochures", icon: "book-open", sortOrder: 14, editorType: "unit" },
  catalogs: { nameAr: "كتالوجات", nameEn: "Catalogs", icon: "book", sortOrder: 15, editorType: "unit" },
  boxes: { nameAr: "علب", nameEn: "Boxes", icon: "box", sortOrder: 16, editorType: "unit" },
  dafater: { nameAr: "دفاتر", nameEn: "Notebooks", icon: "notebook", sortOrder: 17, editorType: "config" },
  Offset: { nameAr: "أوفست", nameEn: "Offset", icon: "printer", sortOrder: 18, editorType: "config" },
  digital_printing: { nameAr: "طباعة رقمية", nameEn: "Digital Printing", icon: "monitor", sortOrder: 19, editorType: "unit" },
  paper_bags: { nameAr: "شنط ورق", nameEn: "Paper Bags", icon: "bag", sortOrder: 20, editorType: "unit" },
  kraft_bags: { nameAr: "شنط Kraft", nameEn: "Kraft Bags", icon: "bag", sortOrder: 21, editorType: "unit" },
  plastic_bags: { nameAr: "شنط بلاستيك", nameEn: "Plastic Bags", icon: "bag", sortOrder: 22, editorType: "unit" },
  acrylic_badge: { nameAr: "بادج أكريليك", nameEn: "Acrylic Badge", icon: "badge", sortOrder: 23, editorType: "unit" },
  annual_ads: { nameAr: "إعلانات سنوية", nameEn: "Annual Ads", icon: "calendar", sortOrder: 24, editorType: "unit" },
  card_rosary: { nameAr: "سبحة كروت", nameEn: "Card Rosary", icon: "circle", sortOrder: 25, editorType: "unit" },
  cladding_letters: { nameAr: "حروف cladding", nameEn: "Cladding Letters", icon: "type", sortOrder: 26, editorType: "unit" },
  cup_quran_bags: { nameAr: "شنط كوب/قرآن", nameEn: "Cup/Quran Bags", icon: "gift", sortOrder: 27, editorType: "unit" },
  ZikrMedal: { nameAr: "أوسمة الذكر", nameEn: "Zikr Medals", icon: "medal", sortOrder: 28, editorType: "unit" },
  SublimationGift: { nameAr: "هدايا sublimation", nameEn: "Sublimation Gifts", icon: "gift", sortOrder: 29, editorType: "unit" },
  promotional_gifts: { nameAr: "هدايا ترويجية", nameEn: "Promotional Gifts", icon: "gift", sortOrder: 30, editorType: "unit" },
  ruler_frames: { nameAr: "مساطر وإطارات", nameEn: "Ruler Frames", icon: "ruler", sortOrder: 31, editorType: "unit" },
  shipping_flyers_clear_bags: { nameAr: "شحن/فلاير/شنط", nameEn: "Shipping/Flyers", icon: "truck", sortOrder: 32, editorType: "unit" },
  safety_printing: { nameAr: "طباعة safety", nameEn: "Safety Printing", icon: "shield", sortOrder: 33, editorType: "unit" },
  inkjet_paper_printing: { nameAr: "طباعة inkjet", nameEn: "Inkjet Printing", icon: "file", sortOrder: 34, editorType: "unit" },
  notebooks_invoices: { nameAr: "دفاتر/فواتير", nameEn: "Notebooks/Invoices", icon: "file-text", sortOrder: 35, editorType: "notebooks_invoices" },
  notebooks_books_booklets: { nameAr: "كتب/كتيبات", nameEn: "Books/Booklets", icon: "book", sortOrder: 36, editorType: "nbb" },
  Medallion: { nameAr: "أوسمة", nameEn: "Medallions", icon: "medal", sortOrder: 37, editorType: "unit" },
};

export function getCategoryMeta(categoryId: string) {
  return (
    PRICING_CATEGORY_META[categoryId] || {
      nameAr: categoryId,
      nameEn: categoryId,
      icon: "package",
      sortOrder: 99,
      editorType: "unit" as const,
    }
  );
}

export function inferPricingType(categoryId: string, editorType?: string): string {
  if (editorType === "sqm_groups") return "per_sqm";
  if (editorType === "stands") return "stands";
  if (editorType === "stamps") return "stamps";
  if (editorType === "config") return "config";
  if (editorType === "nbb") return "nbb";
  if (editorType === "notebooks_invoices") return "notebooks_invoices";
  if (editorType === "business_cards") return "business_cards";
  if (editorType === "dtf") return "per_meter";
  return "unit";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function parseFirestoreDocId(docId: string): { categoryId: string; productId: string } {
  const idx = docId.indexOf("_");
  if (idx === -1) return { categoryId: docId, productId: docId };
  return { categoryId: docId.slice(0, idx), productId: docId.slice(idx + 1) };
}

export function getSellPriceFromData(data: Record<string, unknown>): number {
  if (typeof data.pricePerSquareMeter === "number") return data.pricePerSquareMeter;
  if (typeof data.sellingPrice === "number") return data.sellingPrice;
  if (typeof data.price === "number") return data.price;
  if (typeof data.pricePerMeter === "number") return data.pricePerMeter;
  return 0;
}

export function getCostPriceFromData(data: Record<string, unknown>): number {
  if (typeof data.costPerSquareMeter === "number") return data.costPerSquareMeter;
  if (typeof data.costPrice === "number") return data.costPrice;
  if (typeof data.productionCost === "number") return data.productionCost;
  return 0;
}
