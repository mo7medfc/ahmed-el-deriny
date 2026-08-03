import { prisma } from "@/lib/prisma";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { ProductSearch } from "@/components/products/ProductSearch";
import { FilteredProductsGrid } from "@/components/products/FilteredProductsGrid";
import { resolveProductImage, resolveProductImageAlt } from "@/lib/product-images";
import {
  allowedCategoryFilter,
  allowedProductFilter,
  getStorefrontCategoryName,
} from "@/lib/storefront-categories";
import { Suspense } from "react";
import { getPriceUnitLabel } from "@/lib/price-unit";
import { Link } from "@/i18n/navigation";
import { PackageOpen } from "lucide-react";

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const currentLocale = await getLocale();
  const t = await getTranslations("products");

  const categories = await prisma.category.findMany({
    where: allowedCategoryFilter,
    orderBy: { sortOrder: "asc" },
  });

  const products = await prisma.product.findMany({
    where: allowedProductFilter,
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
      name: currentLocale === "ar" ? product.nameAr : product.nameEn,
      categorySlug: product.category.slug,
      categoryName: getStorefrontCategoryName(
        product.category.legacyId || product.category.slug,
        currentLocale,
        { nameAr: product.category.nameAr, nameEn: product.category.nameEn }
      ),
      description: currentLocale === "ar" ? product.descriptionAr : product.descriptionEn,
      basePrice: product.basePrice,
      priceUnitLabel: getPriceUnitLabel(product.unit, currentLocale),
      image: resolveProductImage(imageInput),
      imageAlt: resolveProductImageAlt(imageInput, currentLocale),
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
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-900 mb-2">{t("title")}</h1>
          <p className="text-brand-700/60">{t("subtitle")}</p>
        </div>

        {items.length === 0 ? (
          <div className="heritage-card rounded-sm text-center py-20 px-6">
            <PackageOpen className="w-12 h-12 mx-auto mb-5 text-brand-500/60" />
            <h2 className="font-display text-2xl font-semibold text-brand-900 mb-3">
              {t("comingSoonTitle")}
            </h2>
            <p className="text-brand-700/60 max-w-lg mx-auto mb-8 leading-relaxed">
              {t("comingSoonDesc")}
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-md text-base font-semibold text-white gradient-bg shadow-md hover:opacity-90 transition-opacity"
            >
              {t("comingSoonCta")}
            </Link>
          </div>
        ) : (
          <>
            <Suspense fallback={<div className="h-24" />}>
              <ProductSearch categories={searchCategories} />
            </Suspense>

            <Suspense fallback={<div className="text-center py-20 text-brand-600/50">{t("calculating")}</div>}>
              <FilteredProductsGrid
                products={items}
                locale={currentLocale}
                fromLabel={t("from")}
                configureLabel={t("configure")}
                showAllLabel={t("showAll")}
                showLessLabel={t("showLess")}
              />
            </Suspense>
          </>
        )}
      </div>
    </div>
  );
}
