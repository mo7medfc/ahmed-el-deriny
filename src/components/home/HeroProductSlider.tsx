import { prisma } from "@/lib/prisma";
import { getLocale, getTranslations } from "next-intl/server";
import { resolveSliderHeroImage } from "@/lib/slider-images";
import { resolveProductImageAlt } from "@/lib/product-images";
import { allowedProductFilter } from "@/lib/storefront-categories";
import { getPriceUnitLabel } from "@/lib/price-unit";
import { ProductHeroSliderClient } from "./ProductHeroSliderClient";
import { HeroBrand } from "./HeroBrand";

/** Visually strong, diverse picks for the circular hero orbit. */
const HERO_ORBIT_SLUGS = [
  "desksets-black-grained",
  "wooddesksets-dark-brown",
  "certificates-ribbon",
  "nameplates-acrylic-gold",
  "nameplates-acrylic-white",
  "stamps-wood-hand",
  "outdoor-banner-380g",
  "dtf-6-pass",
  "certificates-wood",
  "nameplates-acrylic-clear-print",
  "nameplates-acrylic-silver",
  "desksets-brown-grained",
] as const;

export async function HeroProductSlider() {
  const locale = await getLocale();
  const t = await getTranslations("slider");
  const tProducts = await getTranslations("products");
  const tHero = await getTranslations("hero");

  const preferred = await prisma.product.findMany({
    where: {
      ...allowedProductFilter,
      slug: { in: [...HERO_ORBIT_SLUGS] },
    },
    include: { category: true },
  });

  const featuredFill = await prisma.product.findMany({
    where: {
      ...allowedProductFilter,
      featured: true,
      slug: { notIn: preferred.map((p) => p.slug) },
    },
    orderBy: { sortOrder: "asc" },
    take: 12,
    include: { category: true },
  });

  const bySlug = new Map(preferred.map((p) => [p.slug, p]));
  const orderedPreferred = HERO_ORBIT_SLUGS.map((slug) => bySlug.get(slug)).filter(
    (p): p is (typeof preferred)[number] => Boolean(p)
  );
  const ordered = [...orderedPreferred, ...featuredFill].slice(0, 12);

  if (ordered.length === 0) return <HeroBrand />;

  const slides = ordered.map((product) => {
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
      categoryName:
        locale === "ar" ? product.category.nameAr : product.category.nameEn,
      description:
        locale === "ar" ? product.descriptionAr : product.descriptionEn,
      basePrice: product.basePrice,
      priceUnitLabel: getPriceUnitLabel(product.unit, locale),
      image: resolveSliderHeroImage(imageInput),
      imageAlt: resolveProductImageAlt(imageInput, locale),
    };
  });

  return (
    <ProductHeroSliderClient
      products={slides}
      locale={locale}
      badge={t("badge")}
      title={tHero("title")}
      subtitle={t("subtitle")}
      cta={t("cta")}
      fromLabel={tProducts("from")}
      priceOnRequestLabel={tProducts("priceOnRequest")}
    />
  );
}
