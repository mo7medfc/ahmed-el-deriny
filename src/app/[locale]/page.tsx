import { FeaturesSection } from "@/components/home/HeroSection";
import { HeroProductSlider } from "@/components/home/HeroProductSlider";
import { IntroSection } from "@/components/home/IntroSection";
import { CategoriesSection, FeaturedProducts } from "@/components/home/CategoriesSection";
import { HomePartnersMarquee } from "@/components/home/HomePartnersMarquee";
import { MachinesShowcase } from "@/components/home/MachinesShowcase";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("homePartners");

  return (
    <>
      <HeroProductSlider />
      <CategoriesSection />
      <HomePartnersMarquee title={t("title")} subtitle={t("subtitle")} />
      <FeaturedProducts />
      <IntroSection />
      <FeaturesSection />
      <MachinesShowcase />
    </>
  );
}
