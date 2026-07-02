"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { Input } from "@/components/ui/Input";
import { useCartStore } from "@/store/cart";
import {
  calculateDafater,
  DAFATER_CARBON_COPIES,
  DAFATER_TYPES,
  formatDafaterSummary,
  PAPER_WEIGHTS,
  type DafaterType,
} from "@/lib/pricing/dafater-calculator";
import { DAFATER_PROFIT_TIERS } from "@/lib/pricing/legacy-catalog";
import {
  ConfiguratorShell,
  OrderExtras,
  selectClassName,
  sectionTitle,
  useDesignUpload,
} from "./OrderExtras";
import { getPricingFetchUrl } from "@/lib/pricing-url";

export function DafaterConfigurator({
  product,
}: {
  product: { id: string; slug: string; nameAr: string; nameEn: string; minQuantity: number };
}) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const addItem = useCartStore((s) => s.addItem);
  const { designFile, designFileName, uploading, handleUpload } = useDesignUpload(isAr);

  const [loading, setLoading] = useState(true);
  const [costCfg, setCostCfg] = useState<Record<string, unknown>>({});
  const [profitTiers, setProfitTiers] = useState(DAFATER_PROFIT_TIERS);
  const [type, setType] = useState<DafaterType>("carbon");
  const [width, setWidth] = useState(21);
  const [height, setHeight] = useState(30);
  const [quantity, setQuantity] = useState(1);
  const [sheets, setSheets] = useState(50);
  const [totalCopies, setTotalCopies] = useState(2);
  const [color, setColor] = useState<"one" | "full">("one");
  const [paperWeight, setPaperWeight] = useState("60");
  const [offsetCopies, setOffsetCopies] = useState(1);
  const [serialEnabled, setSerialEnabled] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetch(getPricingFetchUrl("dafater"))
      .then((r) => r.json())
      .then((d) => {
        setCostCfg(d.costConfig?.default || d.costConfig || {});
        const tiers = d.sellConfig?.default?.profitTiers;
        if (Array.isArray(tiers) && tiers.length) setProfitTiers(tiers);
      })
      .finally(() => setLoading(false));
  }, []);

  const result = useMemo(
    () =>
      calculateDafater({
        type,
        widthCm: width,
        heightCm: height,
        quantity,
        internalSheets: sheets,
        totalCopies,
        color,
        paperWeight,
        copies: offsetCopies,
        serialEnabled: type !== "offset" && serialEnabled,
        costCfg,
        profitTiers,
      }),
    [type, width, height, quantity, sheets, totalCopies, color, paperWeight, offsetCopies, serialEnabled, costCfg, profitTiers]
  );

  const addToCart = () => {
    if (!result) return;
    const summary = formatDafaterSummary(locale, { type, widthCm: width, heightCm: height, quantity, internalSheets: sheets });
    addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: isAr ? product.nameAr : product.nameEn,
      quantity,
      selectedOptions: [],
      unitPrice: result.sellingPrice / quantity,
      totalPrice: result.sellingPrice,
      designFile: designFile || undefined,
      designFileName: designFileName || undefined,
      notes: notes || undefined,
      configuration: { type: "dafater", notebookType: type, widthCm: width, heightCm: height, internalSheets: sheets, summary },
    });
  };

  if (loading) {
    return (
      <div className="heritage-card rounded-sm p-8 flex justify-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ConfiguratorShell title={isAr ? "تخصيص الطلب" : "Configure order"}>
      <div>
        <label className="block text-sm font-medium text-dark-200 mb-2">{isAr ? "نوع الدفتر" : "Notebook type"}</label>
        <div className="grid grid-cols-2 gap-2">
          {DAFATER_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setType(t.id)}
              className={`p-3 rounded-lg border text-sm font-bold transition ${type === t.id ? "border-gold-500 bg-gold-500/20 text-gold-300" : "border-dark-600 text-dark-300"}`}
            >
              {isAr ? t.nameAr : t.nameEn}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Input label={isAr ? "العرض (سم)" : "Width"} type="number" step="0.1" value={width} onChange={(e) => setWidth(Number(e.target.value))} />
        <Input label={isAr ? "الطول (سم)" : "Height"} type="number" step="0.1" value={height} onChange={(e) => setHeight(Number(e.target.value))} />
        <Input label={isAr ? "عدد الدفاتر" : "Qty"} type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label={isAr ? "عدد الورق الداخلي" : "Inner sheets"} type="number" min={1} value={sheets} onChange={(e) => setSheets(Number(e.target.value))} />
        {type === "offset" && (
          <Input label={isAr ? "عدد النسخ" : "Copies"} type="number" min={1} value={offsetCopies} onChange={(e) => setOffsetCopies(Number(e.target.value))} />
        )}
      </div>

      {type === "carbon" && (
        <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-heritage-900/50 border border-gold-500/10">
          {sectionTitle(isAr ? "إعدادات المكربن" : "Carbon settings")}
          <select value={totalCopies} onChange={(e) => setTotalCopies(Number(e.target.value))} className={selectClassName()}>
            {DAFATER_CARBON_COPIES.map((c) => (
              <option key={c.totalCopies} value={c.totalCopies}>{c.nameAr}</option>
            ))}
          </select>
          <select value={color} onChange={(e) => setColor(e.target.value as "one" | "full")} className={selectClassName()}>
            <option value="one">{isAr ? "لون واحد" : "One color"}</option>
            <option value="full">{isAr ? "ألوان" : "Full color"}</option>
          </select>
        </div>
      )}

      {(type === "normal" || type === "rashta") && (
        <div className="p-4 rounded-lg bg-heritage-900/50 border border-gold-500/10 space-y-2">
          {sectionTitle(isAr ? "نوع الورق" : "Paper weight")}
          <select value={paperWeight} onChange={(e) => setPaperWeight(e.target.value)} className={selectClassName()}>
            {PAPER_WEIGHTS.map((p) => (
              <option key={p.id} value={p.id}>{p.nameAr}</option>
            ))}
          </select>
        </div>
      )}

      {type === "offset" && (
        <div className="p-4 rounded-lg bg-heritage-900/50 border border-gold-500/10 space-y-2">
          {sectionTitle(isAr ? "ورق أوفست 70×100" : "Offset paper")}
          <select value={paperWeight} onChange={(e) => setPaperWeight(e.target.value)} className={selectClassName()}>
            {PAPER_WEIGHTS.map((p) => (
              <option key={p.id} value={p.id}>{p.nameAr}</option>
            ))}
          </select>
        </div>
      )}

      {type !== "offset" && (
        <label className="flex items-center gap-2 text-sm text-heritage-100">
          <input type="checkbox" checked={serialEnabled} onChange={(e) => setSerialEnabled(e.target.checked)} className="accent-gold-500" />
          {isAr ? "تفعيل النمرة (سيريال)" : "Serial numbering"}
        </label>
      )}

      {result && (
        <div className="text-sm space-y-1 p-4 rounded-lg bg-heritage-900/60 border border-gold-500/15 text-heritage-200">
          <div className="flex justify-between"><span>{isAr ? "التكلفة" : "Cost"}</span><span>{result.totalCost.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>{isAr ? "نسبة الربح" : "Profit"}</span><span>{result.percent.toFixed(1)}%</span></div>
        </div>
      )}

      <OrderExtras
        locale={locale}
        notes={notes}
        onNotesChange={setNotes}
        designFile={designFile}
        designFileName={designFileName}
        uploading={uploading}
        onUpload={handleUpload}
        totalPrice={result?.sellingPrice ?? 0}
        onAddToCart={addToCart}
        disabled={!result}
      />
    </ConfiguratorShell>
  );
}
