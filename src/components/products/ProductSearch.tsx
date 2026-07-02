"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
}

interface ProductSearchProps {
  categories: Category[];
}

export function ProductSearch({ categories }: ProductSearchProps) {
  const t = useTranslations("products");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") ?? undefined;
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const setCategory = (slug?: string) => {
    const params = new URLSearchParams();
    if (slug) params.set("category", slug);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (query) params.set("q", query);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search")}
          className="w-full ps-12 pe-4 py-3 rounded-sm bg-heritage-900 border border-gold-500/15 text-heritage-50 placeholder:text-heritage-200/30 focus:border-gold-500/40 transition-all"
        />
      </form>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategory()}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all",
            !activeCategory
              ? "gradient-bg text-heritage-950"
              : "bg-heritage-900 text-heritage-200/60 hover:text-gold-300 border border-gold-500/10"
          )}
        >
          {t("all")}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.slug)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              activeCategory === cat.slug
                ? "gradient-bg text-heritage-950"
                : "bg-heritage-900 text-heritage-200/60 hover:text-gold-300 border border-gold-500/10"
            )}
          >
            {locale === "ar" ? cat.nameAr : cat.nameEn}
          </button>
        ))}
      </div>
    </div>
  );
}
