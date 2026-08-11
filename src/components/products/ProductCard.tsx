"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { formatPrice, cn } from "@/lib/utils";

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
  index?: number;
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
  index = 0,
}: ProductCardProps) {
  const isAr = locale === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;
  const imageHeight = variant === "featured" ? "h-56" : "h-52";

  return (
    <Link
      href={`/products/${slug}`}
      className="product-card group block"
      style={{ animationDelay: `${Math.min(index, 11) * 60}ms` }}
    >
      <div className="product-card__shell">
        <div className={cn("product-card__media", imageHeight)}>
          <div className="product-card__media-glow" aria-hidden />
          <div className="product-card__shine" aria-hidden />

          {image ? (
            <Image
              src={image}
              alt={imageAlt || name}
              fill
              className="product-card__image"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-brand-300 text-4xl font-display">
              AD
            </div>
          )}

          <div className="product-card__badge">
            <span>{categoryName}</span>
          </div>
        </div>

        <div className="product-card__body">
          <h3 className="product-card__title">{name}</h3>
          <p className="product-card__desc">{description}</p>

          <div className="product-card__footer">
            <div className="min-w-0">
              {basePrice > 0 ? (
                <>
                  <p className="product-card__from">{fromLabel}</p>
                  <p className="product-card__price">{formatPrice(basePrice, locale)}</p>
                  {priceUnitLabel && (
                    <p className="product-card__unit">{priceUnitLabel}</p>
                  )}
                </>
              ) : (
                <p className="product-card__request">
                  {priceOnRequestLabel || configureLabel || fromLabel}
                </p>
              )}
            </div>

            <span className="product-card__cta">
              <span className="product-card__cta-label">
                {configureLabel || (isAr ? "اطلب" : "Order")}
              </span>
              <span className="product-card__cta-icon">
                <Arrow className="w-3.5 h-3.5" />
              </span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
