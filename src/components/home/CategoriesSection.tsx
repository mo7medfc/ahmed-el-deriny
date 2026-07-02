import { prisma } from "@/lib/prisma";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { ProductCard } from "@/components/products/ProductCard";
import { getCategoryImage, resolveProductImage, resolveProductImageAlt } from "@/lib/product-images";
import { allowedCategoryFilter, allowedProductFilter, getStorefrontCategoryName } from "@/lib/storefront-categories";

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
    <section className="py-24 heritage-section">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="heritage-badge mb-3">{t("badge")}</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-heritage-50 mb-2">{t("title")}</h2>
            <p className="text-heritage-200/55">{t("subtitle")}</p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 font-medium text-sm transition-colors"
          >
            {t("viewAll")}
            {locale === "ar" ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const image = getCategoryImage(cat.slug);
            return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="heritage-card rounded-sm overflow-hidden card-hover group"
              >
                <div className="relative h-36 overflow-hidden">
                  <Image
                    src={image}
                    alt={locale === "ar" ? cat.nameAr : cat.nameEn}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="300px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-heritage-950 via-heritage-950/40 to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-display font-semibold text-heritage-50 mb-1 group-hover:text-gold-300 transition-colors">
                    {getStorefrontCategoryName(cat.legacyId || cat.slug, locale, {
                      nameAr: cat.nameAr,
                      nameEn: cat.nameEn,
                    })}
                  </h3>
                  <p className="text-heritage-200/45 text-sm">{cat._count.products} {locale === "ar" ? "منتج" : "products"}</p>
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
    <section className="py-24 bg-heritage-900/40 border-t border-gold-500/10 heritage-section">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="heritage-badge mb-4">{t("featured")}</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-heritage-50 mt-2">{t("title")}</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
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
              image={resolveProductImage(imageInput)}
              imageAlt={resolveProductImageAlt(imageInput, locale)}
              locale={locale}
              fromLabel={t("from")}
              variant="featured"
            />
            );
          })}
        </div>
      </div>
    </section>
  );
}
