"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tContact = useTranslations("contact");
  const locale = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gold-500/15 bg-heritage-950 relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <Image src="/logo/logo.png" alt="Logo" width={64} height={64} className="w-16 h-16 object-contain" />
            </Link>
            <p className="text-gold-400 text-sm font-display font-medium mb-1">{t("tagline")}</p>
            <p className="text-gold-500/60 text-xs tracking-[0.2em] uppercase mb-3">{t("since")}</p>
            <p className="text-heritage-200/50 text-sm leading-relaxed">
              {locale === "ar"
                ? "مطابع أحمد الدريني — تراث طباعة مصري منذ 1918"
                : "Ahmed El-Deriny Printing — Egyptian printing heritage since 1918"}
            </p>
          </div>

          <div>
            <h3 className="text-heritage-50 font-display font-semibold mb-4">{t("quickLinks")}</h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: tNav("home") },
                { href: "/products", label: tNav("products") },
                { href: "/about", label: tNav("about") },
                { href: "/contact", label: tNav("contact") },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-heritage-200/55 hover:text-gold-300 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-heritage-50 font-display font-semibold mb-4">{t("contactUs")}</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-heritage-200/55 text-sm">
                <Phone className="w-4 h-4 text-gold-500 shrink-0" />
                <span dir="ltr">+20 100 000 0000</span>
              </li>
              <li className="flex items-center gap-2 text-heritage-200/55 text-sm">
                <Mail className="w-4 h-4 text-gold-500 shrink-0" />
                info@ahmedderiny.com
              </li>
              <li className="flex items-start gap-2 text-heritage-200/55 text-sm">
                <MapPin className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                {locale === "ar" ? "القاهرة، مصر" : "Cairo, Egypt"}
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-heritage-50 font-display font-semibold mb-4">{tContact("hours")}</h3>
            <p className="text-heritage-200/55 text-sm">{tContact("hoursValue")}</p>
          </div>
        </div>

        <div className="heritage-divider text-[10px] tracking-[0.3em] uppercase my-10 opacity-40">
          <span>1918 — {year}</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-heritage-200/40 text-sm">
            © {year} {locale === "ar" ? "مطابع أحمد الدريني" : "Ahmed El-Deriny Printing"}. {t("rights")}.
          </p>
        </div>
      </div>
    </footer>
  );
}
