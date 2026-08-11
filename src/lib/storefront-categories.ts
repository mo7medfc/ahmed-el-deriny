/**
 * Categories visible on storefront + admin.
 *
 * Empty = storefront shows no products at all. Add legacy category IDs here
 * (matching prisma/catalog-export.json) to publish a category and its products.
 */
export const ALLOWED_STOREFRONT_CATEGORIES: readonly string[] = [
  "Outdoor",
  "Indoor",
  "Stands",
  "PopUp",
  "DTF",
  "DeskSets",
  "WoodDeskSets",
  "Certificates",
  "Nameplates",
  "Stamps",
];

export type AllowedCategoryId = string;

export function isAllowedCategory(legacyId: string | null | undefined): boolean {
  if (!legacyId) return false;
  return ALLOWED_STOREFRONT_CATEGORIES.includes(legacyId);
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
export const STOREFRONT_CATEGORY_NAMES: Record<string, { nameAr: string; nameEn: string }> = {
  Outdoor: { nameAr: "اليفط الأوت دور", nameEn: "Outdoor Signage" },
  Indoor: { nameAr: "اليفط الإن دور", nameEn: "Indoor Signage" },
  Stands: { nameAr: "الأستندات", nameEn: "Stands" },
  PopUp: { nameAr: "البوب أب", nameEn: "Pop-Up Displays" },
  DTF: { nameAr: "طباعة DTF و UV DTF", nameEn: "DTF & UV DTF Printing" },
  DeskSets: { nameAr: "طقم المكتب محفور الاسم", nameEn: "Engraved Desk Sets" },
  WoodDeskSets: { nameAr: "طقم المكتب الخشب الزان", nameEn: "Beech Wood Desk Sets" },
  Certificates: { nameAr: "شهادات التقدير", nameEn: "Appreciation Certificates" },
  Nameplates: { nameAr: "باغة محفور عليها الاسم", nameEn: "Engraved Nameplates" },
  Stamps: { nameAr: "الأختام", nameEn: "Stamps" },
};

export function getStorefrontCategoryName(
  legacyId: string,
  locale: string,
  fallback: { nameAr: string; nameEn: string }
) {
  const custom = STOREFRONT_CATEGORY_NAMES[legacyId];
  if (custom) return locale === "ar" ? custom.nameAr : custom.nameEn;
  return locale === "ar" ? fallback.nameAr : fallback.nameEn;
}
