"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { publicPath } from "@/lib/public-path";

export function HeritageStory() {
  const t = useTranslations("heritageStory");
  const locale = useLocale();
  const isAr = locale === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          videoRef.current?.play().catch(() => {});
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="heritage-story relative overflow-hidden border-t border-brand-100"
      aria-labelledby="heritage-story-title"
    >
      <div className="heritage-story__atmosphere" aria-hidden />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <header
          className={`heritage-story__header text-center max-w-3xl mx-auto mb-12 sm:mb-16 ${
            visible ? "is-visible" : ""
          }`}
        >
          <p className="heritage-story__since">{t("since")}</p>
          <h2
            id="heritage-story-title"
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-950 leading-tight mt-4 mb-4"
          >
            {t("title")}
          </h2>
          <p className="heritage-story__subtitle text-lg sm:text-xl text-brand-600/90 leading-relaxed">
            {t("subtitle")}
          </p>
        </header>

        <div
          className={`heritage-story__grid grid lg:grid-cols-12 gap-10 lg:gap-14 items-center ${
            visible ? "is-visible" : ""
          }`}
        >
          <div className="lg:col-span-7 heritage-story__media">
            <div className="heritage-story__frame">
              <video
                ref={videoRef}
                className="heritage-story__video"
                muted
                loop
                playsInline
                autoPlay
                poster={publicPath("/logo/logo.png")}
                aria-label={t("videoLabel")}
              >
                <source src={publicPath("/videos/hero-intro.mp4")} type="video/mp4" />
              </video>
              <div className="heritage-story__shine" aria-hidden />
              <div className="heritage-story__caption">
                <span>{t("videoLabel")}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 heritage-story__copy">
            <span className="heritage-badge mb-5">{t("badge")}</span>
            <p className="text-brand-800/85 text-base sm:text-lg leading-relaxed mb-5">
              {t("p1")}
            </p>
            <p className="text-brand-700/70 text-base leading-relaxed mb-8">
              {t("p2")}
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-md text-sm font-semibold text-white gradient-bg shadow-lg shadow-brand-500/20 hover:opacity-90 transition-opacity"
            >
              {t("cta")}
              <Arrow className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
