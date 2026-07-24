"use client";

import Image from "next/image";
import { publicPath } from "@/lib/public-path";

const PARTNERS = [
  { id: "total-air", name: "Total Air" },
  { id: "police-academy", name: "Police Academy" },
  { id: "ebda", name: "Ebda" },
  { id: "gbs", name: "GBS" },
  { id: "new-alamein", name: "New Alamein Festival" },
  { id: "mostaqbal-watan", name: "Mostaqbal Watan" },
  { id: "water-holding", name: "Water Holding" },
  { id: "health-ministry", name: "Ministry of Health" },
  { id: "aqarmap", name: "Aqarmap" },
  { id: "al-wazzan", name: "Al Wazzan" },
  { id: "2b", name: "2B" },
  { id: "gourmet", name: "Gourmet" },
  { id: "oraimo", name: "Oraimo" },
  { id: "air-gym", name: "Air Gym" },
  { id: "banque-misr", name: "Banque Misr" },
  { id: "wazin", name: "Wazin" },
  { id: "october6-uni", name: "October 6 University" },
  { id: "golden-pyramids", name: "Golden Pyramids Plaza" },
] as const;

function PartnerTile({ id, name }: { id: string; name: string }) {
  return (
    <div className="partners-marquee-item shrink-0 flex items-center justify-center bg-white border border-brand-100 rounded-xl shadow-sm px-3 py-2 h-16 w-[120px] sm:w-[132px]">
      <Image
        src={publicPath(`/images/about/partners/${id}.png`)}
        alt={name}
        width={110}
        height={52}
        className="max-h-12 w-auto object-contain"
      />
    </div>
  );
}

export function PartnersMarquee({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const loop = [...PARTNERS, ...PARTNERS];

  return (
    <section className="mt-14 overflow-hidden">
      <div className="text-center mb-6 px-4">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-brand-900">{title}</h2>
        <p className="text-brand-600/70 text-sm mt-2">{subtitle}</p>
      </div>

      <div className="partners-marquee relative py-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-20 z-10 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-20 z-10 bg-gradient-to-l from-white to-transparent" />

        <div className="partners-marquee-track flex w-max gap-3 sm:gap-4">
          {loop.map((p, i) => (
            <PartnerTile key={`${p.id}-${i}`} id={p.id} name={p.name} />
          ))}
        </div>
      </div>
    </section>
  );
}
