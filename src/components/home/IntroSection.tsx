"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLocale } from "next-intl";

export function IntroSection() {
  const t = useTranslations("intro");
  const locale = useLocale();
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;

  return (
    <section className="relative py-20 overflow-hidden bg-white border-y border-brand-100">
      <div className="absolute inset-0 hero-glow-light opacity-80" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-start">
            <span className="heritage-badge mb-4">{t("badge")}</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-brand-900 mb-3">{t("title")}</h2>
            <p className="text-brand-700/70 text-lg mb-6">{t("subtitle")}</p>

            <p className="heritage-story__since mb-3">{t("since")}</p>
            <h3 className="font-display text-2xl font-bold text-brand-800 leading-tight mb-4">
              {t("heritageLine")}
            </h3>
            <div className="heritage-divider text-xs mb-5 max-w-md mx-auto lg:mx-0">
              <span>{t("tagline")}</span>
            </div>
            <p className="text-brand-700/65 text-base leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
              {t("description")}
            </p>

            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-md text-sm font-semibold text-white gradient-bg shadow-lg shadow-brand-500/20 hover:opacity-90 transition-opacity"
            >
              {t("cta")}
              <Arrow className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "5000+", label: t("stats.clients") },
              { value: "1918", label: t("stats.since") },
              { value: "50+", label: t("stats.products") },
              { value: "100K+", label: t("stats.orders") },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center p-5 rounded-xl border border-brand-100 bg-brand-50/80 shadow-sm"
              >
                <p className="text-2xl font-display font-bold gradient-text">{stat.value}</p>
                <p className="text-xs text-brand-600/55 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
