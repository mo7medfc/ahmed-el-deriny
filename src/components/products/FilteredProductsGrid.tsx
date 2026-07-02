"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ProductsGrid, type ProductItem } from "@/components/products/ProductsGrid";

interface FilteredProductsGridProps {
  products: ProductItem[];
  locale: string;
  fromLabel: string;
  configureLabel: string;
  showAllLabel: string;
  showLessLabel: string;
}

export function FilteredProductsGrid(props: FilteredProductsGridProps) {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? undefined;
  const query = (searchParams.get("q") ?? "").trim().toLowerCase();

  const filtered = useMemo(() => {
    return props.products.filter((product) => {
      if (category && product.categorySlug !== category) return false;
      if (!query) return true;

      return (
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.categoryName.toLowerCase().includes(query)
      );
    });
  }, [props.products, category, query]);

  return (
    <ProductsGrid
      {...props}
      products={filtered}
      initialCount={query ? filtered.length : category ? filtered.length : 12}
    />
  );
}
