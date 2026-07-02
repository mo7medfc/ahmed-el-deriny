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
  configureLabel?: string;
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
  configureLabel,
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
          <div className="absolute inset-0 bg-gradient-to-br from-heritage-800 to-heritage-950 flex items-center justify-center">
            <span className="text-5xl opacity-40">🖨️</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-heritage-950/90 via-heritage-950/20 to-transparent" />
        <div className="absolute bottom-3 start-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gold-300 bg-heritage-950/70 backdrop-blur px-2 py-1 rounded border border-gold-500/20">
            {categoryName}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-display font-semibold text-heritage-50 mb-2 group-hover:text-gold-300 transition-colors">
          {name}
        </h3>
        <p className="text-dark-300 text-sm line-clamp-2 mb-4 leading-relaxed">{description}</p>
        <div className="flex items-center justify-between pt-3 border-t border-gold-500/10">
          <span className="text-gold-400 font-semibold">
            {fromLabel} {formatPrice(basePrice, locale)}
          </span>
          {configureLabel && (
            <span className="text-xs text-gold-500/70 group-hover:text-gold-400 transition-colors">
              {configureLabel} →
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
