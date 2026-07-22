"use client";

import { useTranslations } from "next-intl";
import { Upload, Calculator, Award, Truck } from "lucide-react";

export function FeaturesSection() {
  const t = useTranslations("features");
  const features = [
    { icon: Upload, key: "upload" as const },
    { icon: Calculator, key: "calculator" as const },
    { icon: Award, key: "quality" as const },
    { icon: Truck, key: "delivery" as const },
  ];

  return (
    <section className="py-24 heritage-section bg-brand-50/50 border-y border-brand-100">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="heritage-badge mb-4">{t("badge")}</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-brand-900 mb-4">{t("title")}</h2>
          <p className="text-brand-700/60 text-lg max-w-2xl mx-auto">{t("subtitle")}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, key }) => (
            <div key={key} className="heritage-card rounded-xl p-6 card-hover text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl gradient-bg flex items-center justify-center shadow-md shadow-brand-500/20">
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-display font-semibold text-brand-900 mb-2">{t(`${key}.title`)}</h3>
              <p className="text-brand-700/55 text-sm leading-relaxed">{t(`${key}.desc`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
