"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { publicPath } from "@/lib/public-path";

export interface SliderProduct {
  slug: string;
  name: string;
  categoryName: string;
  description: string;
  basePrice: number;
  priceUnitLabel?: string;
  image: string;
  imageAlt: string;
}

interface ProductHeroSliderClientProps {
  products: SliderProduct[];
  locale: string;
  badge: string;
  title: string;
  subtitle: string;
  cta: string;
  fromLabel: string;
}

const HERO_VIDEO = publicPath("/videos/hero-intro.mp4");

export function ProductHeroSliderClient({
  products,
  locale,
  badge,
  subtitle,
  cta,
  fromLabel,
}: ProductHeroSliderClientProps) {
  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isRtl = locale === "ar";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  const goTo = useCallback(
    (index: number) => {
      setCurrent((index + products.length) % products.length);
      setAnimKey((k) => k + 1);
    },
    [products.length]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.play().catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  if (products.length === 0) return null;

  const product = products[current];

  return (
    <section className="relative w-full h-[92vh] min-h-[580px] max-h-[900px] overflow-hidden">
      {/* Hero intro video — full width background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        poster={publicPath("/logo/logo.png")}
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>

      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-brand-950/75 via-brand-900/45 to-brand-900/15" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-brand-950/80 via-brand-950/30 to-transparent" />

      <button
        onClick={prev}
        className="absolute start-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full border border-white/30 bg-white/10 backdrop-blur text-white hover:bg-brand-500/30 transition-all hidden sm:flex"
        aria-label="Previous"
      >
        <PrevIcon className="w-6 h-6" />
      </button>
      <button
        onClick={next}
        className="absolute end-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full border border-white/30 bg-white/10 backdrop-blur text-white hover:bg-brand-500/30 transition-all hidden sm:flex"
        aria-label="Next"
      >
        <NextIcon className="w-6 h-6" />
      </button>

      <div className="relative z-10 h-full flex flex-col justify-end">
        <div className="w-full px-4 sm:px-8 lg:px-12 pb-4">
          <div
            key={`text-${animKey}`}
            className={`max-w-3xl ${isRtl ? "animate-slide-in-rtl" : "animate-slide-in"}`}
          >
            <span className="hero-badge mb-4">{badge}</span>
            <p className="text-white/70 text-xs font-display tracking-[0.25em] uppercase mb-2">
              {product.categoryName}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.1] mb-3">
              {product.name}
            </h1>
            <p className="text-white/80 text-base sm:text-lg leading-relaxed mb-5 max-w-xl line-clamp-2">
              {product.description}
            </p>
            <p className="text-white font-semibold text-xl sm:text-2xl mb-6">
              {fromLabel} {formatPrice(product.basePrice, locale)}
              {product.priceUnitLabel && (
                <span className="text-white/70 text-sm font-normal ms-2">{product.priceUnitLabel}</span>
              )}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/products/${product.slug}`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-md text-base font-semibold text-brand-800 bg-white hover:bg-brand-50 transition-colors shadow-md"
              >
                {cta}
                <Arrow className="w-5 h-5" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-md text-base font-semibold text-white border border-white/40 bg-white/10 backdrop-blur hover:bg-white/20 transition-all"
              >
                {locale === "ar" ? "كل المنتجات" : "All Products"}
              </Link>
            </div>
          </div>
        </div>

        {/* Product scroll — click opens product page */}
        <div className="w-full border-t border-white/10 bg-black/40 backdrop-blur-md">
          <div className="px-4 sm:px-8 lg:px-12 py-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {products.map((slide, i) => (
                <Link
                  key={slide.slug}
                  href={`/products/${slide.slug}`}
                  onMouseEnter={() => goTo(i)}
                  onFocus={() => goTo(i)}
                  className={`relative shrink-0 group transition-all duration-300 ${
                    i === current ? "scale-105" : "opacity-70 hover:opacity-100"
                  }`}
                  aria-label={slide.name}
                >
                  <div
                    className={`relative w-28 h-20 sm:w-36 sm:h-24 rounded-lg overflow-hidden border-2 transition-all ${
                      i === current
                        ? "border-white/90 shadow-md"
                        : "border-white/20 group-hover:border-white/50"
                    }`}
                  >
                    <Image
                      src={slide.image}
                      alt={slide.name}
                      fill
                      className="object-cover"
                      sizes="150px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-900/85 to-transparent" />
                    <p className="absolute bottom-1 inset-x-1 text-[9px] sm:text-[10px] font-semibold text-white truncate text-center">
                      {slide.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex items-center justify-between mt-3">
              <p className="text-white/50 text-xs hidden sm:block">{subtitle}</p>
              <div className="flex items-center gap-2 ms-auto">
                {products.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i === current
                        ? "w-10 bg-white"
                        : "w-1.5 bg-white/30 hover:bg-white/50"
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
                <span className="text-white/60 text-xs font-mono ms-2">
                  {String(current + 1).padStart(2, "0")}/{String(products.length).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
