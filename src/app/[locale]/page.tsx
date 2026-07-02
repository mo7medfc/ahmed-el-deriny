import { HeroSection, FeaturesSection } from "@/components/home/HeroSection";
import { CategoriesSection, FeaturedProducts } from "@/components/home/CategoriesSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <CategoriesSection />
      <FeaturedProducts />
    </>
  );
}
