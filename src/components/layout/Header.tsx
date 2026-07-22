"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/store/cart";
import { Menu, X, ShoppingCart, Globe } from "lucide-react";
import { useState } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { publicPath } from "@/lib/public-path";

export function Header() {
  const t = useTranslations("nav");
  const [mobileOpen, setMobileOpen] = useState(false);
  const itemCount = useCartStore((s) => s.getItemCount());
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/", label: t("home") },
    { href: "/products", label: t("products") },
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") },
  ];

  const toggleLocale = () => {
    router.replace(pathname, { locale: locale === "ar" ? "en" : "ar" });
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 glass border-b border-brand-200">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-200/80 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <Image
              src={publicPath("/logo/logo.png")}
              alt="Ahmed El-Deriny"
              width={52}
              height={52}
              className="w-13 h-13 object-contain group-hover:scale-105 transition-transform"
              priority
            />
            <div className="hidden sm:block">
              <p className="text-sm font-display font-bold text-brand-900 leading-tight">
                {locale === "ar" ? "مطابع أحمد الدريني" : "Ahmed El-Deriny"}
              </p>
              <p className="text-[10px] text-brand-500 tracking-[0.15em] uppercase">
                {locale === "ar" ? "منذ 1918" : "Since 1918"}
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-brand-800 hover:text-brand-600 transition-colors tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleLocale}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-brand-700 hover:text-brand-600 hover:bg-brand-50 border border-transparent hover:border-brand-200 transition-all"
              aria-label="Toggle language"
            >
              <Globe className="w-4 h-4" />
              {locale === "ar" ? "EN" : "عربي"}
            </button>

            <Link
              href="/cart"
              className="relative p-2.5 rounded-md text-brand-700 hover:text-brand-600 hover:bg-brand-50 transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -end-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white gradient-bg rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>

            <Link
              href="/products"
              className="hidden sm:inline-flex items-center px-5 py-2.5 rounded-md text-sm font-semibold text-white gradient-bg hover:opacity-90 transition-opacity"
            >
              {t("orderNow")}
            </Link>

            <button
              className="lg:hidden p-2 text-brand-800"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <div className={cn("lg:hidden border-t border-brand-100 bg-white/98", mobileOpen ? "block" : "hidden")}>
        <nav className="px-4 py-4 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-md text-brand-800 hover:bg-brand-50 hover:text-brand-600 transition-all"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
