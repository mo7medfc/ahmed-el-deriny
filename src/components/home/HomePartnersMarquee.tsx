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
  const loop = [...HOME_PARTNERS, ...HOME_PARTNERS];

  return (
    <section className="py-10 sm:py-12 bg-brand-50/40 border-y border-brand-100 overflow-hidden">
      <div className="text-center mb-5 px-4">
        <p className="text-[11px] tracking-[0.28em] uppercase text-brand-500 font-display mb-1">
          {subtitle}
        </p>
        <h2 className="font-display text-lg sm:text-xl font-bold text-brand-900">{title}</h2>
      </div>

      <div className="partners-marquee relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-16 z-10 bg-gradient-to-r from-brand-50 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-16 z-10 bg-gradient-to-l from-brand-50 to-transparent" />

        <div className="partners-marquee-track flex w-max gap-3 sm:gap-4 px-2">
          {loop.map((p, i) => (
            <div
              key={`${p.id}-${i}`}
              className="shrink-0 flex items-center justify-center bg-white border border-brand-100/80 rounded-lg shadow-sm px-3 py-2 h-14 w-[118px] sm:w-[130px]"
              title={p.nameAr}
            >
              <Image
                src={publicPath(`/images/home-partners/${p.id}.png`)}
                alt={p.nameAr}
                width={110}
                height={48}
                className="max-h-10 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
