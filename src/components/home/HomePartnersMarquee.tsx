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
  const loop = [...HOME_PARTNERS, ...HOME_PARTNERS, ...HOME_PARTNERS, ...HOME_PARTNERS];

  return (
    <section className="home-partners-strip w-full overflow-hidden">
      <div className="home-partners-strip__inner text-center px-4 pt-12 pb-8 sm:pt-16 sm:pb-10">
        <p className="home-partners-kicker mb-3">{subtitle}</p>
        <h2 className="home-partners-title">{title}</h2>
      </div>

      <div className="partners-marquee partners-marquee--edge relative bg-white border-y border-brand-200/80">
        <div className="partners-marquee-track flex w-max items-center">
          {loop.map((p, i) => (
            <div
              key={`${p.id}-${i}`}
              className="home-partner-tile shrink-0 flex items-center justify-center"
              title={p.nameAr}
            >
              <Image
                src={publicPath(`/images/home-partners/${p.id}.png`)}
                alt={p.nameAr}
                width={200}
                height={80}
                className="home-partner-logo"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
