"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Upload, Calculator, Award, Truck } from "lucide-react";
import { useLocale } from "next-intl";
import { useRef, useEffect } from "react";
import { publicPath } from "@/lib/public-path";

export function HeroSection() {
  const t = useTranslations("hero");
  const locale = useLocale();
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {});
    }
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        poster={publicPath("/logo/logo.png")}
      >
        <source src={publicPath("/videos/intro.mp4")} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-heritage-950/85 via-heritage-900/75 to-heritage-950/95" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(6,14,24,0.6)_100%)]" />
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-60" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-start">
            <span className="heritage-badge mb-6">{t("badge")}</span>
            <p className="text-gold-400/80 text-sm font-display tracking-[0.25em] uppercase mb-3">
              {t("since")}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-heritage-50 leading-tight mb-4">
              {t("title")}
            </h1>
            <div className="heritage-divider text-xs mb-5 max-w-md mx-auto lg:mx-0">
              <span>{t("heritageLine")}</span>
            </div>
            <p className="text-gold-300/90 text-xl font-medium mb-4 font-arabic">{t("subtitle")}</p>
            <p className="text-heritage-200/70 text-lg leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              {t("description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-sm text-base font-semibold text-heritage-950 gradient-bg shadow-xl shadow-gold-500/20 hover:opacity-90 transition-opacity border border-gold-400/30"
              >
                {t("cta")}
                <Arrow className="w-5 h-5" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-sm text-base font-semibold text-gold-300 border border-gold-500/35 hover:bg-gold-500/10 transition-all"
              >
                <Calculator className="w-5 h-5" />
                {t("ctaSecondary")}
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-12 pt-8 border-t border-gold-500/15">
              {[
                { value: "5000+", label: t("stats.clients") },
                { value: "50+", label: t("stats.products") },
                { value: "1918", label: t("stats.since") },
                { value: "100K+", label: t("stats.orders") },
              ].map((stat) => (
                <div key={stat.label} className="text-center lg:text-start">
                  <p className="text-2xl font-display font-bold gradient-text">{stat.value}</p>
                  <p className="text-xs text-heritage-200/50 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative animate-float">
              <div className="absolute -inset-6 border border-gold-500/20 rounded-sm rotate-3" />
              <div className="absolute -inset-3 border border-gold-500/10 rounded-sm -rotate-2" />
              <div className="relative p-6 bg-heritage-950/60 backdrop-blur border border-gold-500/25 rounded-sm shadow-2xl shadow-black/50">
                <Image
                  src={publicPath("/logo/logo.png")}
                  alt="Ahmed El-Deriny Logo"
                  width={380}
                  height={380}
                  className="relative w-64 h-64 sm:w-80 sm:h-80 object-contain drop-shadow-2xl"
                  priority
                />
                <p className="text-center text-gold-400/70 text-xs tracking-[0.3em] uppercase mt-4 font-display">
                  Est. 1918
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  const t = useTranslations("features");
  const features = [
    { icon: Upload, key: "upload" as const },
    { icon: Calculator, key: "calculator" as const },
    { icon: Award, key: "quality" as const },
    { icon: Truck, key: "delivery" as const },
  ];

  return (
    <section className="py-24 heritage-section bg-heritage-900/50 border-y border-gold-500/10">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="heritage-badge mb-4">{t("badge")}</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-heritage-50 mb-4">{t("title")}</h2>
          <p className="text-heritage-200/60 text-lg max-w-2xl mx-auto">{t("subtitle")}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, key }) => (
            <div key={key} className="heritage-card rounded-sm p-6 card-hover text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-sm gradient-bg flex items-center justify-center shadow-lg shadow-gold-500/15 border border-gold-400/20">
                <Icon className="w-7 h-7 text-heritage-950" />
              </div>
              <h3 className="text-lg font-display font-semibold text-heritage-50 mb-2">{t(`${key}.title`)}</h3>
              <p className="text-heritage-200/55 text-sm leading-relaxed">{t(`${key}.desc`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
