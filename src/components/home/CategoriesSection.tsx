import { prisma } from "@/lib/prisma";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { ProductCard } from "@/components/products/ProductCard";
import { getCategoryImage, resolveProductImage, resolveProductImageAlt } from "@/lib/product-images";
import { allowedCategoryFilter, allowedProductFilter, getStorefrontCategoryName } from "@/lib/storefront-categories";
import { getPriceUnitLabel } from "@/lib/price-unit";

export async function CategoriesSection() {
  const locale = await getLocale();
  const t = await getTranslations("categories");
  const categories = await prisma.category.findMany({
    where: allowedCategoryFilter,
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  if (categories.length === 0) return null;

  return (
    <section className="py-16 heritage-section">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="heritage-badge mb-2 text-[0.65rem]">{t("badge")}</span>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-brand-900 mb-1">{t("title")}</h2>
            <p className="text-brand-700/50 text-sm">{t("subtitle")}</p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-500 font-medium text-xs transition-colors"
          >
            {t("viewAll")}
            {locale === "ar" ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {categories.map((cat) => {
            const image = getCategoryImage(cat.slug);
            return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="heritage-card rounded-sm overflow-hidden card-hover group"
              >
                <div className="relative h-32 overflow-hidden">
                  <Image
                    src={image}
                    alt={locale === "ar" ? cat.nameAr : cat.nameEn}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="300px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-900/70 via-brand-900/20 to-transparent" />
                </div>
                <div className="p-4">
                  <h3 className="text-sm sm:text-base font-display font-semibold text-brand-900 mb-0.5 group-hover:text-brand-600 transition-colors">
                    {getStorefrontCategoryName(cat.legacyId || cat.slug, locale, {
                      nameAr: cat.nameAr,
                      nameEn: cat.nameEn,
                    })}
                  </h3>
                  <p className="text-brand-700/40 text-xs">{cat._count.products} {locale === "ar" ? "منتج" : "products"}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export async function FeaturedProducts() {
  const locale = await getLocale();
  const t = await getTranslations("products");
  const products = await prisma.product.findMany({
    where: { ...allowedProductFilter, featured: true },
    orderBy: { sortOrder: "asc" },
    take: 6,
    include: { category: true },
  });

  if (products.length === 0) return null;

  return (
    <section className="py-24 bg-white border-t border-brand-100 heritage-section">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="heritage-badge mb-4">{t("featured")}</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-brand-900 mt-2">{t("title")}</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => {
            const imageInput = {
              slug: product.slug,
              image: product.image,
              pricingCategory: product.pricingCategory,
              legacyId: product.legacyId,
              categorySlug: product.category.slug,
              nameAr: product.nameAr,
              nameEn: product.nameEn,
            };
            return (
            <ProductCard
              key={product.id}
              slug={product.slug}
              name={locale === "ar" ? product.nameAr : product.nameEn}
              categoryName={locale === "ar" ? product.category.nameAr : product.category.nameEn}
              description={locale === "ar" ? product.descriptionAr : product.descriptionEn}
              basePrice={product.basePrice}
              priceUnitLabel={getPriceUnitLabel(product.unit, locale)}
              image={resolveProductImage(imageInput)}
              imageAlt={resolveProductImageAlt(imageInput, locale)}
              locale={locale}
              fromLabel={t("from")}
              priceOnRequestLabel={t("priceOnRequest")}
              configureLabel={t("configure")}
              variant="featured"
              index={index}
            />
            );
          })}
        </div>
      </div>
    </section>
  );
}
