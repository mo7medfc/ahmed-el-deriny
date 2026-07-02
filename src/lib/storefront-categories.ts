/** Categories visible on storefront + admin (legacy Firebase category IDs) */
export const ALLOWED_STOREFRONT_CATEGORIES = [
  "Outdoor",
  "Indoor",
  "UVPrinting",
  "DTF",
  "safety_printing",
  "promotional_gifts",
  "SublimationGift",
  "Stamps",
  "Stands",
  "dafater",
  "notebooks_invoices",
  "notebooks_books_booklets",
  "envelopes",
] as const;

export type AllowedCategoryId = (typeof ALLOWED_STOREFRONT_CATEGORIES)[number];

export function isAllowedCategory(legacyId: string | null | undefined): legacyId is AllowedCategoryId {
  if (!legacyId) return false;
  return (ALLOWED_STOREFRONT_CATEGORIES as readonly string[]).includes(legacyId);
}

export const allowedCategoryFilter = {
  legacyId: { in: [...ALLOWED_STOREFRONT_CATEGORIES] },
};

export const allowedProductFilter = {
  isActive: true,
  category: allowedCategoryFilter,
};

export function filterAllowedCatalogCategories<T extends { categoryId: string }>(categories: T[]): T[] {
  return categories.filter((c) => isAllowedCategory(c.categoryId));
}

/** Arabic display names override for storefront */
export const STOREFRONT_CATEGORY_NAMES: Partial<Record<AllowedCategoryId, { nameAr: string; nameEn: string }>> = {
  safety_printing: { nameAr: "الفيستات", nameEn: "Safety Vests" },
  promotional_gifts: { nameAr: "هدايا ترويجية", nameEn: "Promotional Gifts" },
  SublimationGift: { nameAr: "هدايا sublimation", nameEn: "Sublimation Gifts" },
  dafater: { nameAr: "دفاتر", nameEn: "Notebooks" },
  notebooks_invoices: { nameAr: "دفاتر وفواتير", nameEn: "Notebooks & Invoices" },
  notebooks_books_booklets: { nameAr: "كتب وكتيبات", nameEn: "Books & Booklets" },
  envelopes: { nameAr: "المظاريف", nameEn: "Envelopes" },
};

export function getStorefrontCategoryName(
  legacyId: string,
  locale: string,
  fallback: { nameAr: string; nameEn: string }
) {
  const custom = STOREFRONT_CATEGORY_NAMES[legacyId as AllowedCategoryId];
  if (custom) return locale === "ar" ? custom.nameAr : custom.nameEn;
  return locale === "ar" ? fallback.nameAr : fallback.nameEn;
}
