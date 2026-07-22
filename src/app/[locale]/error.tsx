"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const locale = (params?.locale as string) || "ar";
  const isAr = locale === "ar";

  useEffect(() => {
    console.error("[locale error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="mb-3 text-2xl font-bold text-heritage-900">
        {isAr ? "تعذّر تحميل الصفحة" : "Page failed to load"}
      </h1>
      <p className="mb-8 max-w-md text-brand-600">
        {isAr
          ? "حدث خطأ مؤقت. جرّب إعادة المحاولة أو العودة للرئيسية."
          : "A temporary error occurred. Try again or return home."}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-brand-500 px-5 py-2.5 text-white transition hover:bg-brand-600"
        >
          {isAr ? "إعادة المحاولة" : "Try again"}
        </button>
        <Link
          href={`/${locale}`}
          className="rounded-lg border border-heritage-200 px-5 py-2.5 text-heritage-900 transition hover:bg-heritage-50"
        >
          {isAr ? "الرئيسية" : "Home"}
        </Link>
      </div>
    </div>
  );
}
