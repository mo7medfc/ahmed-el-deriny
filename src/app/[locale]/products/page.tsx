import { prisma } from "@/lib/prisma";
import { getLocale, getTranslations } from "next-intl/server";
import { ProductSearch } from "@/components/products/ProductSearch";
import { ProductsGrid } from "@/components/products/ProductsGrid";
import { resolveProductImage, resolveProductImageAlt } from "@/lib/product-images";
import {
  allowedCategoryFilter,
  allowedProductFilter,
  getStorefrontCategoryName,
} from "@/lib/storefront-categories";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;
  const locale = await getLocale();
  const t = await getTranslations("products");

  const categories = await prisma.category.findMany({
    where: allowedCategoryFilter,
    orderBy: { sortOrder: "asc" },
  });

  const products = await prisma.product.findMany({
    where: {
      ...allowedProductFilter,
      ...(category ? { category: { slug: category, ...allowedCategoryFilter } } : {}),
      ...(q
        ? {
            OR: [
              { nameAr: { contains: q } },
              { nameEn: { contains: q } },
              { descriptionAr: { contains: q } },
              { descriptionEn: { contains: q } },
            ],
          }
        : {}),
    },
    include: { category: true, options: true },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
  });

  const items = products.map((product) => {
    const imageInput = {
      slug: product.slug,
      image: product.image,
      pricingCategory: product.pricingCategory,
      legacyId: product.legacyId,
      categorySlug: product.category.slug,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
    };
    return {
      id: product.id,
      slug: product.slug,
      name: locale === "ar" ? product.nameAr : product.nameEn,
      categoryName: getStorefrontCategoryName(
        product.category.legacyId || product.category.slug,
        locale,
        { nameAr: product.category.nameAr, nameEn: product.category.nameEn }
      ),
      description: locale === "ar" ? product.descriptionAr : product.descriptionEn,
      basePrice: product.basePrice,
      image: resolveProductImage(imageInput),
      imageAlt: resolveProductImageAlt(imageInput, locale),
    };
  });

  const searchCategories = categories.map((cat) => ({
    ...cat,
    nameAr: getStorefrontCategoryName(cat.legacyId || cat.slug, "ar", {
      nameAr: cat.nameAr,
      nameEn: cat.nameEn,
    }),
    nameEn: getStorefrontCategoryName(cat.legacyId || cat.slug, "en", {
      nameAr: cat.nameAr,
      nameEn: cat.nameEn,
    }),
  }));

  return (
    <div className="pt-28 pb-20 heritage-section min-h-screen">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <span className="heritage-badge mb-3">{locale === "ar" ? "منذ 1918" : "Since 1918"}</span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-heritage-50 mb-2">{t("title")}</h1>
          <p className="text-heritage-200/55">{t("subtitle")}</p>
        </div>

        <ProductSearch categories={searchCategories} activeCategory={category} />

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-heritage-200/45 text-lg">{t("noProducts")}</p>
          </div>
        ) : (
          <ProductsGrid
            products={items}
            locale={locale}
            fromLabel={t("from")}
            configureLabel={t("configure")}
            showAllLabel={t("showAll")}
            showLessLabel={t("showLess")}
            initialCount={q ? items.length : 12}
          />
        )}
      </div>
    </div>
  );
}
