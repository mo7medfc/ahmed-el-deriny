"use client";

import { useEffect } from "react";
import { routing } from "@/i18n/routing";

export function RootRedirect() {
  useEffect(() => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    window.location.replace(`${basePath}/${routing.defaultLocale}/`);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-heritage-950 text-heritage-100">
      <p>Loading…</p>
    </div>
  );
}
