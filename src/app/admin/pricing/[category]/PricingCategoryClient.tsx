"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  DafaterPricingEditor,
  NBBPricingEditor,
  NotebooksInvoicesPricingEditor,
  StampsPricingEditor,
} from "@/components/admin/pricing/SpecialPricingEditors";
import { ChevronLeft, Save, RefreshCw } from "lucide-react";

interface PricingData {
  categoryId: string;
  meta: { nameAr: string; nameEn: string; editorType: string };
  catalog: {
    products: Array<{ id: string; nameAr: string; nameEn: string; groupId?: string | null }>;
    groups: Array<{ id: string; nameAr: string; products?: string[] }>;
    addons: Record<string, Array<{ id: string; nameAr: string; unit?: string }>>;
  } | null;
  sellMap: Record<string, Record<string, unknown>>;
  costMap: Record<string, Record<string, unknown>>;
  configMap: Record<string, Record<string, unknown>>;
  customDocs: Record<string, Record<string, Record<string, unknown>>>;
  businessCardRecords: Array<{ docId: string; data: Record<string, unknown> }>;
  products: Array<{ id: string; legacyId: string | null; nameAr: string; basePrice: number; costPrice: number }>;
}

const SPECIAL_EDITOR_TYPES = new Set(["config", "notebooks_invoices", "nbb", "stamps"]);

type PriceField = { docId: string; productId: string; label: string; sell: number; cost: number; field: string };

export default function CategoryPricingPage() {
  const params = useParams();
  const categoryId = decodeURIComponent(params.category as string);
  const [data, setData] = useState<PricingData | null>(null);
  const [fields, setFields] = useState<PriceField[]>([]);
  const [standConfig, setStandConfig] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetch(`/api/admin/pricing/${encodeURIComponent(categoryId)}`)
      .then(async (r) => {
        if (!r.ok) {
          if (r.status === 401) throw new Error("انتهت الجلسة — سجّل الدخول مرة أخرى");
          throw new Error(`فشل تحميل الفئة (${r.status})`);
        }
        return r.json();
      })
      .then((d: PricingData) => {
        if (!d.meta) throw new Error("بيانات الفئة غير متاحة");
        setData(d);
        buildFields(d);
        if (d.configMap?.stand_pricing) setStandConfig(d.configMap.stand_pricing);
      })
      .catch((err: Error) => {
        setError(err.message || "حدث خطأ");
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [categoryId]);

  function buildFields(d: PricingData) {
    const editorType = d.meta.editorType;
    const result: PriceField[] = [];

    if (editorType === "sqm_groups" && d.catalog) {
      for (const p of d.catalog.products) {
        const docId = `${d.categoryId}_${p.id}`;
        const sell = d.sellMap[docId] || {};
        const cost = d.costMap[docId] || {};
        result.push({
          docId,
          productId: p.id,
          label: p.nameAr,
          sell: Number(sell.pricePerSquareMeter ?? sell.sellingPrice ?? 0),
          cost: Number(cost.costPerSquareMeter ?? cost.costPrice ?? 0),
          field: "pricePerSquareMeter",
        });
      }
    } else if (editorType === "unit" && d.catalog?.products.length) {
      for (const p of d.catalog.products) {
        const docId = `${d.categoryId}_${p.id}`;
        const sell = d.sellMap[docId] || {};
        const cost = d.costMap[docId] || {};
        result.push({
          docId,
          productId: p.id,
          label: p.nameAr,
          sell: Number(sell.sellingPrice ?? sell.price ?? 0),
          cost: Number(cost.costPrice ?? 0),
          field: "sellingPrice",
        });
      }
    } else if (d.products.length) {
      for (const p of d.products) {
        const docId = `${d.categoryId}_${p.legacyId || p.id}`;
        const sell = d.sellMap[docId] || {};
        result.push({
          docId,
          productId: p.legacyId || p.id,
          label: p.nameAr,
          sell: p.basePrice || Number(sell.sellingPrice ?? sell.pricePerSquareMeter ?? 0),
          cost: p.costPrice || Number(d.costMap[docId]?.costPrice ?? 0),
          field: "sellingPrice",
        });
      }
    }

    setFields(result);
  }

  useEffect(() => { load(); }, [load]);

  const updateField = (index: number, key: "sell" | "cost", value: number) => {
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, [key]: value } : f)));
  };

  const save = async () => {
    if (!data) return;
    setSaving(true);
    setMessage("");

    const updates = fields.map((f) => {
      const sellData: Record<string, unknown> = {
        productId: f.productId,
        currency: "EGP",
        categoryId: data.categoryId,
      };
      const costData: Record<string, unknown> = {
        productId: f.productId,
        currency: "EGP",
        categoryId: data.categoryId,
      };

      if (f.field === "pricePerSquareMeter") {
        sellData.pricePerSquareMeter = f.sell;
        costData.costPerSquareMeter = f.cost;
      } else {
        sellData.sellingPrice = f.sell;
        costData.costPrice = f.cost;
      }

      return [
        { collection: "product_prices_sell", docId: f.docId, data: sellData, productId: f.productId, basePrice: f.sell, costPrice: f.cost },
        { collection: "product_prices_cost", docId: f.docId, data: costData },
      ];
    }).flat();

    if (data.meta.editorType === "stands" && Object.keys(standConfig).length) {
      updates.push({
        collection: "pricing_config",
        docId: "stand_pricing",
        data: standConfig,
      });
    }

    if (data.meta.editorType === "dtf") {
      updates.push({
        collection: "pricing_config",
        docId: "dtf_pricing",
        data: {
          pricePerMeter: {
            price: fields[0]?.sell ?? 135,
            productionCost: fields[0]?.cost ?? 0,
          },
        },
      });
    }

    const res = await fetch(`/api/admin/pricing/${encodeURIComponent(categoryId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });

    setSaving(false);
    if (res.ok) {
      setMessage("✅ تم حفظ الأسعار بنجاح");
      load();
    } else {
      setMessage("❌ حدث خطأ أثناء الحفظ");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-dark-400 text-sm">جاري تحميل التسعير...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <p className="text-red-400 mb-4">{error || "تعذر تحميل البيانات"}</p>
        <div className="flex gap-3 justify-center">
          <Link href="/admin/pricing">
            <Button variant="outline">رجوع</Button>
          </Link>
          <Button onClick={load}>إعادة المحاولة</Button>
        </div>
      </div>
    );
  }

  const isSqm = data.meta.editorType === "sqm_groups";
  const isSpecialEditor = SPECIAL_EDITOR_TYPES.has(data.meta.editorType);
  const customDocs = data.customDocs || {};

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/pricing" className="p-2 rounded-xl hover:bg-dark-800 text-dark-300">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{data.meta.nameAr}</h1>
          <p className="text-dark-400 text-sm">
            {data.meta.nameEn}
            {!isSpecialEditor ? ` · ${fields.length} عنصر تسعير` : " · جداول تسعير متقدمة"}
          </p>
        </div>
        <Button onClick={load} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          تحديث
        </Button>
        {!isSpecialEditor && (
          <Button onClick={save} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? "جاري الحفظ..." : "حفظ الكل"}
          </Button>
        )}
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl text-sm ${message.startsWith("✅") ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
          {message}
        </div>
      )}

      {data.meta.editorType === "business_cards" && (
        <BusinessCardsSection records={data.businessCardRecords} categoryId={categoryId} onSaved={load} />
      )}

      {data.meta.editorType === "stands" && (
        <StandsSection config={standConfig} onChange={setStandConfig} />
      )}

      {data.meta.editorType === "config" && (
        <DafaterPricingEditor categoryId={categoryId} customDocs={customDocs} onSaved={load} />
      )}

      {data.meta.editorType === "notebooks_invoices" && (
        <NotebooksInvoicesPricingEditor categoryId={categoryId} customDocs={customDocs} onSaved={load} />
      )}

      {data.meta.editorType === "nbb" && (
        <NBBPricingEditor categoryId={categoryId} customDocs={customDocs} onSaved={load} />
      )}

      {data.meta.editorType === "stamps" && (
        <StampsPricingEditor
          categoryId={categoryId}
          sellMap={data.sellMap}
          costMap={data.costMap}
          onSaved={load}
        />
      )}

      {!isSpecialEditor && fields.length > 0 && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-dark-700/50 flex items-center justify-between">
            <h2 className="font-bold text-white">أسعار البيع والتكلفة</h2>
            <span className="text-xs text-dark-400">{isSqm ? "ج.م / م²" : "ج.م"}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-dark-400 border-b border-dark-700/50">
                  <th className="text-start py-3 px-4">المنتج</th>
                  <th className="text-start py-3 px-4">سعر البيع</th>
                  <th className="text-start py-3 px-4">سعر التكلفة</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((f, i) => (
                  <tr key={f.docId} className="border-b border-dark-800/50 hover:bg-dark-800/30">
                    <td className="py-3 px-4 text-white">{f.label}</td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={f.sell}
                        onChange={(e) => updateField(i, "sell", parseFloat(e.target.value) || 0)}
                        className="w-32 bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-brand-400 focus:border-brand-500 outline-none"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={f.cost}
                        onChange={(e) => updateField(i, "cost", parseFloat(e.target.value) || 0)}
                        className="w-32 bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-dark-300 focus:border-brand-500 outline-none"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.meta.editorType === "sqm_groups" && data.catalog?.groups.length ? (
        <GroupAddonsSection
          categoryId={categoryId}
          groups={data.catalog.groups}
          addons={data.catalog.addons}
          sellMap={data.sellMap}
          onSaved={load}
        />
      ) : null}
    </div>
  );
}

function StandsSection({
  config,
  onChange,
}: {
  config: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  const sizes = ["80x200", "85x200", "100x200", "120x200", "150x200"];
  const types = [
    { key: "rollUpBannerEmpty", label: "رول أب بانر — فاضي" },
    { key: "rollUpBannerPrinted", label: "رول أب بانر — مطبوع" },
    { key: "rollUpGlossyEmpty", label: "رول أب لامع — فاضي" },
    { key: "rollUpGlossyPrinted", label: "رول أب لامع — مطبوع" },
  ];

  const getPrice = (typeKey: string, size: string) => {
    const typeData = config[typeKey] as Record<string, number> | undefined;
    return typeData?.[size] ?? 0;
  };

  const setPrice = (typeKey: string, size: string, value: number) => {
    const typeData = { ...(config[typeKey] as Record<string, number> || {}), [size]: value };
    onChange({ ...config, [typeKey]: typeData });
  };

  return (
    <div className="glass rounded-2xl p-6 mb-6">
      <h2 className="font-bold text-white mb-4">تسعير الاستندات (Roll Up)</h2>
      <div className="space-y-6">
        {types.map(({ key, label }) => (
          <div key={key}>
            <h3 className="text-sm font-medium text-brand-400 mb-3">{label}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {sizes.map((size) => (
                <div key={size}>
                  <label className="text-xs text-dark-400 block mb-1">{size.replace("x", "×")} سم</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={getPrice(key, size)}
                    onChange={(e) => setPrice(key, size, parseFloat(e.target.value) || 0)}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-500 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BusinessCardsSection({
  records,
  categoryId,
  onSaved,
}: {
  records: Array<{ docId: string; data: Record<string, unknown> }>;
  categoryId: string;
  onSaved: () => void;
}) {
  const [localRecords, setLocalRecords] = useState(records);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setLocalRecords(records); }, [records]);

  const save = async () => {
    setSaving(true);
    const updates = localRecords.map((r) => ({
      collection: "business_cards_prices_sell",
      docId: r.docId,
      data: r.data,
    }));
    await fetch(`/api/admin/pricing/${encodeURIComponent(categoryId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });
    setSaving(false);
    onSaved();
  };

  if (!localRecords.length) {
    return (
      <div className="glass rounded-2xl p-6 mb-6 text-dark-400 text-sm">
        لا توجد أسعار كروت مستوردة بعد — يمكن إضافتها من لوحة التسعير القديمة أو يدوياً.
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-dark-700/50 flex justify-between items-center">
        <h2 className="font-bold text-white">أسعار الكروت الشخصية ({localRecords.length})</h2>
        <Button onClick={save} disabled={saving} size="sm">{saving ? "..." : "حفظ الكروت"}</Button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-dark-900">
            <tr className="text-dark-400 border-b border-dark-700/50">
              <th className="text-start py-2 px-4">الورق</th>
              <th className="text-start py-2 px-4">الكمية</th>
              <th className="text-start py-2 px-4">الوجه</th>
              <th className="text-start py-2 px-4">السعر</th>
            </tr>
          </thead>
          <tbody>
            {localRecords.slice(0, 50).map((r, i) => (
              <tr key={r.docId} className="border-b border-dark-800/50">
                <td className="py-2 px-4 text-dark-300">{String(r.data.paperTypeId || "")}</td>
                <td className="py-2 px-4 text-dark-300">{String(r.data.quantity || "")}</td>
                <td className="py-2 px-4 text-dark-300">{String(r.data.sides || "")}</td>
                <td className="py-2 px-4">
                  <input
                    type="number"
                    value={Number(r.data.price || 0)}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setLocalRecords((prev) =>
                        prev.map((rec, idx) =>
                          idx === i ? { ...rec, data: { ...rec.data, price: val } } : rec
                        )
                      );
                    }}
                    className="w-24 bg-dark-800 border border-dark-600 rounded px-2 py-1 text-brand-400 text-sm"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {localRecords.length > 50 && (
          <p className="text-center text-dark-500 text-xs py-3">+ {localRecords.length - 50} سجل إضافي</p>
        )}
      </div>
    </div>
  );
}

function GroupAddonsSection({
  categoryId,
  groups,
  addons,
  sellMap,
  onSaved,
}: {
  categoryId: string;
  groups: Array<{ id: string; nameAr: string }>;
  addons: Record<string, Array<{ id: string; nameAr: string; unit?: string }>>;
  sellMap: Record<string, Record<string, unknown>>;
  onSaved: () => void;
}) {
  const [addonPrices, setAddonPrices] = useState<Record<string, Record<string, number>>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const initial: Record<string, Record<string, number>> = {};
    for (const group of groups) {
      const docId = `${categoryId}_Group_${group.id}`;
      const data = sellMap[docId] || {};
      const prices = (data.addonsPrices as Record<string, number>) || {};
      initial[group.id] = prices;
    }
    setAddonPrices(initial);
  }, [categoryId, groups, sellMap]);

  const save = async () => {
    setSaving(true);
    const updates = groups.flatMap((group) => {
      const docId = `${categoryId}_Group_${group.id}`;
      return [{
        collection: "product_prices_sell",
        docId,
        data: {
          categoryId,
          groupId: group.id,
          currency: "EGP",
          addonsPrices: addonPrices[group.id] || {},
        },
      }];
    });
    await fetch(`/api/admin/pricing/${encodeURIComponent(categoryId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });
    setSaving(false);
    onSaved();
  };

  return (
    <div className="glass rounded-2xl p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-white">إضافات المجموعات</h2>
        <Button onClick={save} disabled={saving} size="sm">{saving ? "..." : "حفظ الإضافات"}</Button>
      </div>
      <div className="space-y-6">
        {groups.filter((g) => addons[g.id]?.length).map((group) => (
          <div key={group.id}>
            <h3 className="text-sm font-medium text-brand-400 mb-3">{group.nameAr}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(addons[group.id] || []).map((addon) => (
                <div key={addon.id} className="bg-dark-800/50 rounded-xl p-3">
                  <label className="text-xs text-dark-400 block mb-1">{addon.nameAr}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={addonPrices[group.id]?.[addon.id] ?? 0}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setAddonPrices((prev) => ({
                        ...prev,
                        [group.id]: { ...(prev[group.id] || {}), [addon.id]: val },
                      }));
                    }}
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm"
                  />
                  <span className="text-xs text-dark-500 mt-1 block">
                    {addon.unit === "perSquareMeter" ? "ج.م/م²" : addon.unit === "perMeter" ? "ج.م/م" : "ج.م"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
