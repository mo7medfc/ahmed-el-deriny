import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  slug: string;
  name: string;
  categoryName: string;
  description: string;
  basePrice: number;
  image?: string | null;
  imageAlt?: string;
  locale: string;
  fromLabel: string;
  priceUnitLabel?: string;
  configureLabel?: string;
  priceOnRequestLabel?: string;
  variant?: "default" | "featured";
}

export function ProductCard({
  slug,
  name,
  categoryName,
  description,
  basePrice,
  image,
  imageAlt,
  locale,
  fromLabel,
  priceUnitLabel,
  configureLabel,
  priceOnRequestLabel,
  variant = "default",
}: ProductCardProps) {
  const imageHeight = variant === "featured" ? "h-52" : "h-48";

  return (
    <Link
      href={`/products/${slug}`}
      className="heritage-card rounded-2xl overflow-hidden card-hover group block"
    >
      <div className={`relative ${imageHeight} overflow-hidden`}>
        {image ? (
          <Image
            src={image}
            alt={imageAlt || name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
            <span className="text-5xl opacity-40">🖨️</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900/75 via-brand-900/15 to-transparent" />
        <div className="absolute bottom-3 start-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white bg-brand-700/80 backdrop-blur px-2 py-1 rounded border border-white/20">
            {categoryName}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-display font-semibold text-brand-900 mb-2 group-hover:text-brand-600 transition-colors">
          {name}
        </h3>
        <p className="text-brand-700/55 text-sm line-clamp-2 mb-4 leading-relaxed">{description}</p>
        <div className="flex items-end justify-between gap-3 pt-4 border-t border-brand-100">
          <div>
            {basePrice > 0 ? (
              <>
                <p className="text-[11px] uppercase tracking-[0.16em] text-brand-500 mb-0.5">{fromLabel}</p>
                <p className="text-xl sm:text-2xl font-display font-bold text-brand-800 leading-none">
                  {formatPrice(basePrice, locale)}
                </p>
                {priceUnitLabel && (
                  <p className="text-[11px] text-brand-600/70 mt-1">{priceUnitLabel}</p>
                )}
              </>
            ) : (
              <p className="text-sm font-medium text-brand-600">
                {priceOnRequestLabel || configureLabel || fromLabel}
              </p>
            )}
          </div>
          {configureLabel && basePrice > 0 && (
            <span className="text-xs font-medium text-brand-500 group-hover:text-brand-700 transition-colors shrink-0 pb-0.5">
              {configureLabel}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
