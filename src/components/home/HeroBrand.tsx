import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, ArrowRight, Phone } from "lucide-react";
import { publicPath } from "@/lib/public-path";

/** Homepage hero used when no products are published yet. */
export async function HeroBrand() {
  const locale = await getLocale();
  const t = await getTranslations("hero");
  const isRtl = locale === "ar";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section className="relative w-full h-[88vh] min-h-[560px] max-h-[860px] overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        poster={publicPath("/logo/logo.png")}
      >
        <source src={publicPath("/videos/hero-intro.mp4")} type="video/mp4" />
      </video>

      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-brand-950/80 via-brand-900/50 to-brand-900/20" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-brand-950/85 via-brand-950/30 to-transparent" />

      <div className="relative z-10 h-full flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          <div className={`max-w-3xl ${isRtl ? "animate-slide-in-rtl" : "animate-slide-in"}`}>
            <span className="hero-badge mb-4">{t("badge")}</span>
            <p className="text-white/70 text-xs font-display tracking-[0.25em] uppercase mb-3">
              {t("since")}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.1] mb-4">
              {t("title")}
            </h1>
            <p className="text-white/85 text-lg sm:text-2xl font-display mb-3">{t("heritageLine")}</p>
            <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
              {t("description")}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-md text-base font-semibold text-brand-800 bg-white hover:bg-brand-50 transition-colors shadow-md"
              >
                <Phone className="w-5 h-5" />
                {locale === "ar" ? "اطلب عرض سعر" : "Request a Quote"}
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-md text-base font-semibold text-white border border-white/40 bg-white/10 backdrop-blur hover:bg-white/20 transition-all"
              >
                {locale === "ar" ? "تعرف علينا" : "About Us"}
                <Arrow className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
