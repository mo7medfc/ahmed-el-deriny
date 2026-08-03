"use client";

import { useState } from "react";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/Button";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface ProductItem {
  id: string;
  slug: string;
  name: string;
  categoryName: string;
  categorySlug: string;
  description: string;
  basePrice: number;
  priceUnitLabel?: string;
  image: string;
  imageAlt: string;
}

interface ProductsGridProps {
  products: ProductItem[];
  locale: string;
  fromLabel: string;
  configureLabel: string;
  showAllLabel: string;
  showLessLabel: string;
  initialCount?: number;
}

const DEFAULT_INITIAL = 12;

export function ProductsGrid({
  products,
  locale,
  fromLabel,
  configureLabel,
  showAllLabel,
  showLessLabel,
  initialCount = DEFAULT_INITIAL,
}: ProductsGridProps) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = products.length > initialCount;
  const visible = expanded ? products : products.slice(0, initialCount);

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {visible.map((product) => (
          <ProductCard
            key={product.id}
            slug={product.slug}
            name={product.name}
            categoryName={product.categoryName}
            description={product.description}
            basePrice={product.basePrice}
            priceUnitLabel={product.priceUnitLabel}
            image={product.image}
            imageAlt={product.imageAlt}
            locale={locale}
            fromLabel={fromLabel}
            configureLabel={configureLabel}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-10">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setExpanded((v) => !v)}
            className="gap-2 min-w-[200px]"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                {showLessLabel}
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                {showAllLabel} ({products.length})
              </>
            )}
          </Button>
        </div>
      )}
    </>
  );
}
