import { getTranslations, getLocale } from "next-intl/server";
import Image from "next/image";

export default async function AboutPage() {
  const t = await getTranslations("about");
  const locale = await getLocale();

  return (
    <div className="pt-28 pb-20 heritage-section min-h-screen">
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="heritage-badge mb-4">{locale === "ar" ? "منذ 1918" : "Since 1918"}</span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-heritage-50 mb-4">{t("title")}</h1>
          <div className="heritage-divider text-xs max-w-sm mx-auto mb-4">
            <span>{t("subtitle")}</span>
          </div>
        </div>

        <div className="flex justify-center mb-10">
          <div className="p-4 border border-gold-500/20 bg-heritage-950/50 rounded-sm">
            <Image src="/logo/logo.png" alt="Logo" width={200} height={200} className="w-40 h-40 object-contain" />
          </div>
        </div>

        <div className="heritage-card rounded-sm p-8 space-y-6">
          <p className="text-heritage-100 leading-relaxed text-lg font-arabic">{t("p1")}</p>
          <p className="text-heritage-200/65 leading-relaxed">{t("p2")}</p>
          <p className="text-heritage-200/65 leading-relaxed">{t("p3")}</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mt-10">
          {[
            { value: "1918", label: locale === "ar" ? "سنة التأسيس" : "Founded" },
            { value: "5000+", label: locale === "ar" ? "عميل" : "Clients" },
            { value: "50+", label: locale === "ar" ? "منتج" : "Products" },
          ].map((stat) => (
            <div key={stat.label} className="heritage-card rounded-sm p-6 text-center">
              <p className="text-3xl font-display font-bold gradient-text">{stat.value}</p>
              <p className="text-heritage-200/45 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
