"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { publicPath } from "@/lib/public-path";
import { cn } from "@/lib/utils";

const MACHINES = [
  {
    key: "indoor" as const,
    href: "/products?category=indoor",
    image: "/images/home/indoor-machine.webp",
    side: "start" as const,
  },
  {
    key: "dtf" as const,
    href: "/products?category=dtf",
    image: "/images/home/dtf-machine.webp",
    side: "end" as const,
  },
];

export function MachinesShowcase() {
  const t = useTranslations("machines");
  const locale = useLocale();
  const isAr = locale === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="machines-showcase relative overflow-hidden border-t border-brand-100"
      aria-labelledby="machines-title"
    >
      <div className="machines-showcase__atmosphere" aria-hidden />
      <div className="machines-showcase__grid" aria-hidden />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div
          className={cn(
            "text-center max-w-2xl mx-auto mb-12 lg:mb-16 transition-all duration-700",
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          )}
        >
          <span className="heritage-badge mb-4">{t("badge")}</span>
          <h2
            id="machines-title"
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-950 mb-4"
          >
            {t("title")}
          </h2>
          <p className="text-brand-700/65 text-base sm:text-lg leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        <div className="relative grid lg:grid-cols-[1fr_minmax(0,0.9fr)_1fr] gap-8 lg:gap-4 items-center">
          {MACHINES.map((machine, index) => (
            <MachinePanel
              key={machine.key}
              machine={machine}
              title={t(`${machine.key}.title`)}
              label={t(`${machine.key}.label`)}
              desc={t(`${machine.key}.desc`)}
              cta={t("cta")}
              Arrow={Arrow}
              visible={visible}
              delayMs={index * 160}
              orderClass={
                machine.side === "start"
                  ? "order-1 lg:order-1"
                  : "order-3 lg:order-3"
              }
            />
          ))}

          <div
            className={cn(
              "order-2 text-center lg:px-6 transition-all duration-700 delay-150",
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <p className="font-display text-xl sm:text-2xl text-brand-900 font-semibold leading-snug mb-3">
              {t("centerLine")}
            </p>
            <p className="text-sm text-brand-600/70 leading-relaxed max-w-sm mx-auto mb-6">
              {t("centerDesc")}
            </p>
            <div className="machines-showcase__pulse mx-auto" aria-hidden />
          </div>
        </div>
      </div>
    </section>
  );
}

function MachinePanel({
  machine,
  title,
  label,
  desc,
  cta,
  Arrow,
  visible,
  delayMs,
  orderClass,
}: {
  machine: (typeof MACHINES)[number];
  title: string;
  label: string;
  desc: string;
  cta: string;
  Arrow: typeof ArrowRight;
  visible: boolean;
  delayMs: number;
  orderClass: string;
}) {
  const fromSide =
    machine.side === "start"
      ? "lg:-translate-x-10"
      : "lg:translate-x-10";

  return (
    <Link
      href={machine.href}
      className={cn(
        "machines-panel group relative block",
        orderClass,
        "transition-all duration-1000 ease-out",
        visible
          ? "opacity-100 translate-x-0 translate-y-0"
          : cn("opacity-0 translate-y-10", fromSide)
      )}
      style={{ transitionDelay: visible ? `${delayMs}ms` : "0ms" }}
    >
      <div className="machines-panel__frame">
        <div className="machines-panel__scan" aria-hidden />
        <div className="machines-panel__float">
          <Image
            src={publicPath(machine.image)}
            alt={title}
            width={900}
            height={675}
            className="machines-panel__image"
            sizes="(max-width: 1024px) 90vw, 34vw"
          />
        </div>
        <div className="machines-panel__glow" aria-hidden />
      </div>

      <div className="machines-panel__copy">
        <p className="machines-panel__label">{label}</p>
        <h3 className="machines-panel__title">{title}</h3>
        <p className="machines-panel__desc">{desc}</p>
        <span className="machines-panel__cta">
          {cta}
          <Arrow className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
