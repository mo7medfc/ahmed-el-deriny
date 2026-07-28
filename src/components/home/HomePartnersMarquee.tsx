"use client";

import Image from "next/image";
import { publicPath } from "@/lib/public-path";

const HOME_PARTNERS = [
  { id: "aqarmap", nameAr: "عقارماب", nameEn: "Aqarmap" },
  { id: "city-stars", nameAr: "سيتي ستارز", nameEn: "City Stars" },
  { id: "majid-al-futtaim", nameAr: "مجموعات ماجد الفطيم", nameEn: "Majid Al Futtaim" },
  { id: "intercontinental", nameAr: "فندق إنتركونتيننتال", nameEn: "InterContinental" },
  { id: "banque-misr", nameAr: "بنك مصر", nameEn: "Banque Misr" },
  { id: "water-holding", nameAr: "شركة مياه الشرب والصرف الصحي", nameEn: "Water & Wastewater" },
  { id: "health-ministry", nameAr: "وزارة الصحة", nameEn: "Ministry of Health" },
  { id: "defense-ministry", nameAr: "وزارة الدفاع المصرية", nameEn: "Ministry of Defense" },
] as const;

export function HomePartnersMarquee({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const loop = [...HOME_PARTNERS, ...HOME_PARTNERS, ...HOME_PARTNERS];

  return (
    <section className="home-partners-strip py-12 sm:py-16 overflow-hidden">
      <div className="text-center mb-8 sm:mb-10 px-4">
        <p className="font-arabic text-brand-600 text-base sm:text-lg tracking-wide mb-2">
          {subtitle}
        </p>
        <h2 className="font-arabic text-3xl sm:text-4xl md:text-5xl font-bold text-brand-900 leading-tight">
          {title}
        </h2>
        <div className="mx-auto mt-4 h-px w-24 bg-gradient-to-l from-transparent via-brand-500 to-transparent" />
      </div>

      <div className="partners-marquee partners-marquee--fullbleed relative w-full">
        <div className="partners-marquee-track flex w-max items-center gap-0">
          {loop.map((p, i) => (
            <div
              key={`${p.id}-${i}`}
              className="home-partner-tile shrink-0 flex items-center justify-center px-6 sm:px-8 h-20 sm:h-24 border-s border-brand-200/70"
              title={p.nameAr}
            >
              <Image
                src={publicPath(`/images/home-partners/${p.id}.png`)}
                alt={p.nameAr}
                width={180}
                height={72}
                className="max-h-14 sm:max-h-16 w-auto max-w-[160px] sm:max-w-[180px] object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
