"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";

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
  priceOnRequestLabel?: string;
}

export function ProductHeroSliderClient({
  products,
  locale,
  badge,
  title,
  subtitle,
  cta,
  fromLabel,
  priceOnRequestLabel,
}: ProductHeroSliderClientProps) {
  const isAr = locale === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;
  const PrevIcon = isAr ? ChevronRight : ChevronLeft;
  const NextIcon = isAr ? ChevronLeft : ChevronRight;

  const n = products.length;
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [radius, setRadius] = useState(420);
  const dragRef = useRef({ active: false, startX: 0, startIndex: 0 });
  const pauseUntil = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);

  const step = n > 0 ? 360 / n : 0;
  const rotation = -index * step;

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 480) setRadius(168);
      else if (w < 768) setRadius(220);
      else if (w < 1100) setRadius(300);
      else setRadius(400);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const goTo = useCallback(
    (next: number) => {
      if (n === 0) return;
      const normalized = ((next % n) + n) % n;
      setIndex(normalized);
      pauseUntil.current = Date.now() + 4500;
    },
    [n]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (n < 2) return;
    const timer = setInterval(() => {
      if (Date.now() < pauseUntil.current) return;
      if (dragRef.current.active) return;
      setIndex((i) => (i + 1) % n);
    }, 3200);
    return () => clearInterval(timer);
  }, [n]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { active: true, startX: e.clientX, startIndex: index };
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.active || n < 2) return;
    const dx = e.clientX - dragRef.current.startX;
    const dir = isAr ? -1 : 1;
    const delta = Math.round((-dx * dir) / 56);
    const nextIndex = dragRef.current.startIndex + delta;
    setIndex(((nextIndex % n) + n) % n);
  };

  const onPointerUp = () => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    setDragging(false);
    pauseUntil.current = Date.now() + 4500;
  };

  const active = products[index];

  const orbitItems = useMemo(() => {
    if (n === 0) return [];
    return products.map((product, i) => {
      const angle = i * step;
      const relative = ((i - index + n) % n);
      const dist = Math.min(relative, n - relative);
      const isActive = i === index;
      return { product, i, angle, dist, isActive };
    });
  }, [products, n, step, index]);

  if (!active) return null;

  return (
    <section className="hero-orbit relative overflow-hidden">
      <div className="hero-orbit__atmosphere" aria-hidden />
      <div className="hero-orbit__rings" aria-hidden />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-10 sm:pb-14">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          <div className={`lg:col-span-5 text-center lg:text-start ${isAr ? "animate-slide-in-rtl" : "animate-slide-in"}`}>
            <span className="hero-badge mb-4">{badge}</span>
            <p className="heritage-story__since mb-3 text-brand-500">{locale === "ar" ? "Est. 1918" : "Est. 1918"}</p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-950 leading-tight mb-3">
              {title}
            </h1>
            <p className="text-brand-600/85 text-base sm:text-lg leading-relaxed mb-6 max-w-md mx-auto lg:mx-0">
              {subtitle}
            </p>

            <div className="hero-orbit__active-card mx-auto lg:mx-0">
              <p className="hero-orbit__cat">{active.categoryName}</p>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-brand-900 mb-2 leading-snug">
                {active.name}
              </h2>
              <p className="text-brand-700/65 text-sm leading-relaxed line-clamp-2 mb-4">
                {active.description}
              </p>
              <p className="text-brand-800 font-semibold text-lg mb-5">
                {active.basePrice > 0 ? (
                  <>
                    {fromLabel} {formatPrice(active.basePrice, locale)}
                    {active.priceUnitLabel && (
                      <span className="text-brand-600/60 text-sm font-normal ms-2">{active.priceUnitLabel}</span>
                    )}
                  </>
                ) : (
                  priceOnRequestLabel || (isAr ? "السعر عند الطلب" : "Price on request")
                )}
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <Link
                  href={`/products/${active.slug}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md text-sm font-semibold text-white gradient-bg shadow-lg shadow-brand-500/20 hover:opacity-90 transition-opacity"
                >
                  {cta}
                  <Arrow className="w-4 h-4" />
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md text-sm font-semibold text-brand-800 border border-brand-200 bg-white/70 hover:bg-brand-50 transition-colors"
                >
                  {isAr ? "كل المنتجات" : "All Products"}
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div
              ref={stageRef}
              className={`hero-orbit__stage ${dragging ? "is-dragging" : ""}`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              role="region"
              aria-roledescription="carousel"
              aria-label={isAr ? "معرض المنتجات الدائري" : "Circular product gallery"}
            >
              <div className="hero-orbit__glow" aria-hidden />
              <div
                className="hero-orbit__wheel"
                style={{
                  transform: `translateZ(-${radius}px) rotateY(${rotation}deg)`,
                  transition: dragging ? "none" : "transform 0.85s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                {orbitItems.map(({ product, i, angle, dist, isActive }) => (
                  <button
                    key={product.slug}
                    type="button"
                    className={`hero-orbit__item ${isActive ? "is-active" : ""} dist-${Math.min(dist, 3)}`}
                    style={{
                      transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                    }}
                    onClick={() => {
                      if (isActive) return;
                      goTo(i);
                    }}
                    aria-label={product.name}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <span className="hero-orbit__frame">
                      <Image
                        src={product.image}
                        alt={product.imageAlt || product.name}
                        fill
                        className="object-contain p-2 sm:p-3"
                        sizes="(max-width: 768px) 160px, 220px"
                        priority={i < 3}
                        draggable={false}
                      />
                    </span>
                  </button>
                ))}
              </div>

              <div className="hero-orbit__controls">
                <button type="button" onClick={prev} className="hero-orbit__nav" aria-label="Previous">
                  <PrevIcon className="w-5 h-5" />
                </button>
                <div className="hero-orbit__dots">
                  {products.map((p, i) => (
                    <button
                      key={p.slug}
                      type="button"
                      onClick={() => goTo(i)}
                      className={`hero-orbit__dot ${i === index ? "is-active" : ""}`}
                      aria-label={p.name}
                    />
                  ))}
                </div>
                <button type="button" onClick={next} className="hero-orbit__nav" aria-label="Next">
                  <NextIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
