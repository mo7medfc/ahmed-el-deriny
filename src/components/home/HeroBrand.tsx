import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, ArrowRight, Phone } from "lucide-react";

/** Homepage hero used when no products are published yet. */
export async function HeroBrand() {
  const locale = await getLocale();
  const t = await getTranslations("hero");
  const isRtl = locale === "ar";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section className="hero-orbit relative overflow-hidden min-h-[70vh] flex items-center">
      <div className="hero-orbit__atmosphere" aria-hidden />
      <div className="hero-orbit__rings" aria-hidden />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-28">
        <div className={`max-w-3xl ${isRtl ? "animate-slide-in-rtl" : "animate-slide-in"}`}>
          <span className="hero-badge mb-4">{t("badge")}</span>
          <p className="heritage-story__since mb-3 text-brand-500">{t("since")}</p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-950 leading-[1.1] mb-4">
            {t("title")}
          </h1>
          <p className="text-brand-700 text-lg sm:text-2xl font-display mb-3">{t("heritageLine")}</p>
          <p className="text-brand-700/70 text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
            {t("description")}
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-md text-base font-semibold text-white gradient-bg shadow-lg shadow-brand-500/20 hover:opacity-90 transition-opacity"
            >
              <Phone className="w-5 h-5" />
              {locale === "ar" ? "اطلب عرض سعر" : "Request a Quote"}
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-md text-base font-semibold text-brand-800 border border-brand-200 bg-white/80 hover:bg-brand-50 transition-colors"
            >
              {locale === "ar" ? "تعرف علينا" : "About Us"}
              <Arrow className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
