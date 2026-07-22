import { prisma } from "@/lib/prisma";
import { getLocale, getTranslations } from "next-intl/server";
import { resolveSliderHeroImage } from "@/lib/slider-images";
import { resolveProductImageAlt } from "@/lib/product-images";
import { allowedProductFilter } from "@/lib/storefront-categories";
import { ProductHeroSliderClient } from "./ProductHeroSliderClient";

export async function HeroProductSlider() {
  const locale = await getLocale();
  const t = await getTranslations("slider");
  const tProducts = await getTranslations("products");

  const products = await prisma.product.findMany({
    where: { ...allowedProductFilter, featured: true },
    orderBy: { sortOrder: "asc" },
    take: 8,
    include: { category: true },
  });

  if (products.length === 0) return null;

  const slides = products.map((product) => {
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
      slug: product.slug,
      name: locale === "ar" ? product.nameAr : product.nameEn,
      categoryName: locale === "ar" ? product.category.nameAr : product.category.nameEn,
      description: locale === "ar" ? product.descriptionAr : product.descriptionEn,
      basePrice: product.basePrice,
      image: resolveSliderHeroImage(imageInput),
      imageAlt: resolveProductImageAlt(imageInput, locale),
    };
  });

  return (
    <ProductHeroSliderClient
      products={slides}
      locale={locale}
      badge={t("badge")}
      title={t("title")}
      subtitle={t("subtitle")}
      cta={t("cta")}
      fromLabel={tProducts("from")}
    />
  );
}
