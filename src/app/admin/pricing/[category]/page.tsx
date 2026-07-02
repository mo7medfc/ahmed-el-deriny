import { PRICING_CATEGORY_META } from "@/lib/pricing/categories";
import PricingCategoryClient from "./PricingCategoryClient";

export function generateStaticParams() {
  return Object.keys(PRICING_CATEGORY_META).map((category) => ({ category }));
}

export default function PricingCategoryPage() {
  return <PricingCategoryClient />;
}
