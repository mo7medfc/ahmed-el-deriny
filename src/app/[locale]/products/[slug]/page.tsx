import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getLocale, setRequestLocale } from "next-intl/server";
import { ProductConfigurator } from "@/components/products/ProductConfigurator";
import Image from "next/image";
import { resolveProductImage, resolveProductImageAlt } from "@/lib/product-images";
import { allowedCategoryFilter, allowedProductFilter } from "@/lib/storefront-categories";
import { Link } from "@/i18n/navigation";

/** `output: export` rejects an empty param list, so keep one stub route while the catalog is empty. */
const PLACEHOLDER_SLUG = "coming-soon";

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: allowedProductFilter,
    select: { slug: true },
  });

  if (products.length === 0) return [{ slug: PLACEHOLDER_SLUG }];

  return products.map(({ slug }) => ({ slug }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const currentLocale = await getLocale();

  const product = await prisma.product.findFirst({
    where: { slug, isActive: true, category: allowedCategoryFilter },
    include: { category: true, options: { orderBy: { sortOrder: "asc" } } },
  });

  if (!product) {
    if (slug !== PLACEHOLDER_SLUG) notFound();

    return (
      <div className="pt-28 pb-20 heritage-section min-h-screen">
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="heritage-card rounded-sm text-center py-20 px-6">
            <h1 className="font-display text-2xl font-semibold text-brand-900 mb-3">
              {currentLocale === "ar" ? "المنتجات في الطريق" : "Products coming soon"}
            </h1>
            <p className="text-brand-700/60 mb-8">
              {currentLocale === "ar"
                ? "بنجهّز كتالوج منتجاتنا الجديد بأسعاره."
                : "We are preparing our new product catalog and pricing."}
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-md text-base font-semibold text-white gradient-bg shadow-md hover:opacity-90 transition-opacity"
            >
              {currentLocale === "ar" ? "اطلب عرض سعر" : "Request a quote"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const imageInput = {
    slug: product.slug,
    image: product.image,
    pricingCategory: product.pricingCategory,
    legacyId: product.legacyId,
    categorySlug: product.category.slug,
    nameAr: product.nameAr,
    nameEn: product.nameEn,
  };
  const image = resolveProductImage(imageInput);
  const imageAlt = resolveProductImageAlt(imageInput, currentLocale);

  return (
    <div className="pt-28 pb-20 heritage-section min-h-screen">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10">
          <div>
            <span className="heritage-badge mb-4">{currentLocale === "ar" ? "منذ 1918" : "Since 1918"}</span>
            <p className="text-brand-600 text-sm font-medium mb-2 tracking-wide uppercase">
              {currentLocale === "ar" ? product.category.nameAr : product.category.nameEn}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-900 mb-4">
              {currentLocale === "ar" ? product.nameAr : product.nameEn}
            </h1>
            <p className="text-brand-700/70 leading-relaxed mb-8">
              {currentLocale === "ar" ? product.descriptionAr : product.descriptionEn}
            </p>

            <div className="relative h-72 sm:h-96 rounded-lg overflow-hidden border border-brand-200 shadow-lg">
              <Image
                  src={image}
                  alt={imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              <div className="absolute inset-0 bg-gradient-to-t from-heritage-950/60 to-transparent" />
            </div>
          </div>

          <ProductConfigurator
            product={{
              id: product.id,
              slug: product.slug,
              nameAr: product.nameAr,
              nameEn: product.nameEn,
              pricingType: product.pricingType,
              pricingCategory: product.pricingCategory,
              legacyId: product.legacyId,
              basePrice: product.basePrice,
              minWidth: product.minWidth,
              maxWidth: product.maxWidth,
              minHeight: product.minHeight,
              maxHeight: product.maxHeight,
              minQuantity: product.minQuantity,
              options: product.options.map((o) => ({
                id: o.id,
                nameAr: o.nameAr,
                nameEn: o.nameEn,
                priceAddon: o.priceAddon,
              })),
            }}
          />
        </div>
      </div>
    </div>
  );
}
