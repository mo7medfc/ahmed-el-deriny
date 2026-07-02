import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { ProductConfigurator } from "@/components/products/ProductConfigurator";
import Image from "next/image";
import { resolveProductImage, resolveProductImageAlt } from "@/lib/product-images";
import { allowedCategoryFilter } from "@/lib/storefront-categories";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();

  const product = await prisma.product.findFirst({
    where: { slug, isActive: true, category: allowedCategoryFilter },
    include: { category: true, options: { orderBy: { sortOrder: "asc" } } },
  });

  if (!product) notFound();

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
  const imageAlt = resolveProductImageAlt(imageInput, locale);

  return (
    <div className="pt-28 pb-20 heritage-section min-h-screen">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10">
          <div>
            <span className="heritage-badge mb-4">{locale === "ar" ? "منذ 1918" : "Since 1918"}</span>
            <p className="text-gold-400 text-sm font-medium mb-2 tracking-wide uppercase">
              {locale === "ar" ? product.category.nameAr : product.category.nameEn}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-heritage-50 mb-4">
              {locale === "ar" ? product.nameAr : product.nameEn}
            </h1>
            <p className="text-heritage-200/65 leading-relaxed mb-8">
              {locale === "ar" ? product.descriptionAr : product.descriptionEn}
            </p>

            <div className="relative h-72 sm:h-96 rounded-sm overflow-hidden border border-gold-500/20 shadow-2xl shadow-black/40">
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
