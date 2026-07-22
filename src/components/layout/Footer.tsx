"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";
import { publicPath } from "@/lib/public-path";

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tContact = useTranslations("contact");
  const locale = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-brand-100 bg-brand-50 relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-300/60 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <Image src={publicPath("/logo/logo.png")} alt="Logo" width={64} height={64} className="w-16 h-16 object-contain" />
            </Link>
            <p className="text-brand-600 text-sm font-display font-medium mb-1">{t("tagline")}</p>
            <p className="text-brand-500/70 text-xs tracking-[0.2em] uppercase mb-3">{t("since")}</p>
            <p className="text-brand-700 text-sm leading-relaxed">
              {locale === "ar"
                ? "مطابع أحمد الدريني — تراث طباعة مصري منذ 1918"
                : "Ahmed El-Deriny Printing — Egyptian printing heritage since 1918"}
            </p>
          </div>

          <div>
            <h3 className="text-brand-900 font-display font-semibold mb-4">{t("quickLinks")}</h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: tNav("home") },
                { href: "/products", label: tNav("products") },
                { href: "/about", label: tNav("about") },
                { href: "/contact", label: tNav("contact") },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-brand-700 hover:text-brand-600 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-brand-900 font-display font-semibold mb-4">{t("contactUs")}</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-brand-700 text-sm">
                <Phone className="w-4 h-4 text-brand-500 shrink-0" />
                <span dir="ltr">+20 100 000 0000</span>
              </li>
              <li className="flex items-center gap-2 text-brand-700 text-sm">
                <Mail className="w-4 h-4 text-brand-500 shrink-0" />
                info@ahmedderiny.com
              </li>
              <li className="flex items-start gap-2 text-brand-700 text-sm">
                <MapPin className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                {locale === "ar" ? "القاهرة، مصر" : "Cairo, Egypt"}
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-brand-900 font-display font-semibold mb-4">{tContact("hours")}</h3>
            <p className="text-brand-700 text-sm">{tContact("hoursValue")}</p>
          </div>
        </div>

        <div className="heritage-divider text-[10px] tracking-[0.3em] uppercase my-10 opacity-50">
          <span>1918 — {year}</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-brand-700/45 text-sm">
            © {year} {locale === "ar" ? "مطابع أحمد الدريني" : "Ahmed El-Deriny Printing"}. {t("rights")}.
          </p>
        </div>
      </div>
    </footer>
  );
}
