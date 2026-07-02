import { HeroSection, FeaturesSection } from "@/components/home/HeroSection";
import { CategoriesSection, FeaturedProducts } from "@/components/home/CategoriesSection";
import { setRequestLocale } from "next-intl/server";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <CategoriesSection />
      <FeaturedProducts />
    </>
  );
}
