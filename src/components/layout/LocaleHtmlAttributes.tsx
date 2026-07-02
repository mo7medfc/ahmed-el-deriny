"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { localeDirection } from "@/i18n/config";

export function LocaleHtmlAttributes({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const dir = localeDirection[locale as "ar" | "en"];

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  return <>{children}</>;
}
