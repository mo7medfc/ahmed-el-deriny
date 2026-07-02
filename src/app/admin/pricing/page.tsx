"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sun,
  Home,
  LayoutGrid,
  Stamp,
  CreditCard,
  Package,
  DollarSign,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PricingCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  editorType: string;
  productCount: number;
  pricingRecords: number;
  sortOrder: number;
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  sun: Sun,
  home: Home,
  layout: LayoutGrid,
  stamp: Stamp,
  "credit-card": CreditCard,
  package: Package,
  dollar: DollarSign,
};

const GRADIENTS = [
  "from-orange-500/20 to-amber-500/10 border-orange-500/30 hover:border-orange-400",
  "from-purple-500/20 to-pink-500/10 border-purple-500/30 hover:border-purple-400",
  "from-cyan-500/20 to-sky-500/10 border-cyan-500/30 hover:border-cyan-400",
  "from-rose-500/20 to-pink-500/10 border-rose-500/30 hover:border-rose-400",
  "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 hover:border-emerald-400",
  "from-indigo-500/20 to-violet-500/10 border-indigo-500/30 hover:border-indigo-400",
];

export default function AdminPricingPage() {
  const [categories, setCategories] = useState<PricingCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCategories = () => {
    setLoading(true);
    setError("");
    fetch("/api/admin/pricing")
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) throw new Error("انتهت الجلسة — سجّل الدخول مرة أخرى");
          throw new Error(`فشل تحميل التسعير (${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("استجابة غير صالحة من السيرفر");
        setCategories(data);
      })
      .catch((err: Error) => {
        setError(err.message || "حدث خطأ أثناء التحميل");
        setCategories([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">إدارة التسعير</h1>
          <p className="text-dark-400">
            نفس نظام التسعير من الموقع القديم — {categories.length} فئة · مستورد من Firebase
          </p>
        </div>
        {!loading && (
          <Button variant="outline" onClick={loadCategories} className="gap-2 shrink-0">
            <RefreshCw className="w-4 h-4" />
            تحديث
          </Button>
        )}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-dark-400 text-sm">جاري تحميل الفئات...</p>
        </div>
      )}

      {!loading && error && (
        <div className="glass rounded-2xl border border-red-500/30 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={loadCategories}>إعادة المحاولة</Button>
        </div>
      )}

      {!loading && !error && categories.length === 0 && (
        <div className="glass rounded-2xl p-8 text-center text-dark-400">
          <p className="mb-4">لا توجد فئات — شغّل استيراد البيانات أولاً:</p>
          <code className="text-brand-400 text-sm bg-dark-800 px-3 py-2 rounded-lg">npm run db:import</code>
        </div>
      )}

      {!loading && !error && categories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat, i) => {
            const Icon = ICONS[cat.icon] || Package;
            const gradient = GRADIENTS[i % GRADIENTS.length];
            return (
              <Link
                key={cat.id}
                href={`/admin/pricing/${encodeURIComponent(cat.id)}`}
                className={`group glass rounded-2xl border p-6 transition-all hover:shadow-lg hover:shadow-brand-500/10 bg-gradient-to-br ${gradient}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-dark-800/60 group-hover:bg-brand-500/20 transition-colors">
                    <Icon className="w-7 h-7 text-brand-400" />
                  </div>
                  <span className="text-xs text-dark-400 bg-dark-800/50 px-2 py-1 rounded-full">
                    {cat.productCount} منتج
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{cat.nameAr}</h3>
                <p className="text-sm text-dark-400">{cat.nameEn}</p>
                {cat.pricingRecords > 0 && (
                  <p className="text-xs text-brand-400 mt-3">{cat.pricingRecords} سجل تسعير</p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
