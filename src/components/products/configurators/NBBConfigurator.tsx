"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cart";
import {
  calculateNBB,
  formatNbbSummary,
  NBB_COVER_PAPERS,
  NBB_COVER_TYPES,
  NBB_FINISHING_TYPES,
  NBB_INK_PAPERS,
  NBB_MAIN_TYPES,
  type NbbInnerEntry,
} from "@/lib/pricing/nbb-calculator";
import {
  ConfiguratorShell,
  OrderExtras,
  selectClassName,
  sectionTitle,
  useDesignUpload,
} from "./OrderExtras";

export function NBBConfigurator({
  product,
}: {
  product: { id: string; slug: string; nameAr: string; nameEn: string };
}) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const addItem = useCartStore((s) => s.addItem);
  const { designFile, designFileName, uploading, handleUpload } = useDesignUpload(isAr);

  const [pricing, setPricing] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [mainType, setMainType] = useState("notebook");
  const [coverType, setCoverType] = useState<"soft" | "hard">("soft");
  const [width, setWidth] = useState(20);
  const [height, setHeight] = useState(30);
  const [quantity, setQuantity] = useState(100);
  const [coverPaper, setCoverPaper] = useState("coated_150");
  const [coverSide, setCoverSide] = useState<"single" | "double">("single");
  const [lamination, setLamination] = useState<"none" | "one" | "double">("none");
  const [finishing, setFinishing] = useState("wire_top");
  const [innerEntries, setInnerEntries] = useState<NbbInnerEntry[]>([
    { sheetsPerNotebook: 50, paperTypeId: "60g", printType: "ink", inkColor: "one", sides: "single", designMode: "fixed" },
  ]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetch("/api/pricing/notebooks_books_booklets")
      .then((r) => r.json())
      .then((d) => setPricing(d.config?.default || d.config || {}))
      .finally(() => setLoading(false));
  }, []);

  const calc = useMemo(
    () =>
      calculateNBB({
        mainType,
        coverType,
        widthCm: width,
        heightCm: height,
        quantity,
        cover: {
          paperTypeId: coverPaper,
          printingSide: coverSide,
          lamination,
        },
        innerEntries,
        finishingType: finishing,
        pricing,
      }),
    [mainType, coverType, width, height, quantity, coverPaper, coverSide, lamination, innerEntries, finishing, pricing]
  );

  const updateInner = (idx: number, patch: Partial<NbbInnerEntry>) => {
    setInnerEntries((prev) => prev.map((e, i) => (i === idx ? { ...e, ...patch } : e)));
  };

  const addToCart = () => {
    if (!calc) return;
    const summary = formatNbbSummary(locale, { mainType, coverType, widthCm: width, heightCm: height, quantity, finishingType: finishing });
    addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: isAr ? product.nameAr : product.nameEn,
      quantity,
      selectedOptions: [],
      unitPrice: calc.totals.sellingPrice / quantity,
      totalPrice: calc.totals.sellingPrice,
      designFile: designFile || undefined,
      designFileName: designFileName || undefined,
      notes: notes || undefined,
      configuration: { type: "nbb", mainType, coverType, widthCm: width, heightCm: height, finishing, summary },
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
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-dark-400 mb-1">{isAr ? "النوع" : "Type"}</label>
          <select value={mainType} onChange={(e) => setMainType(e.target.value)} className={selectClassName()}>
            {NBB_MAIN_TYPES.map((t) => (
              <option key={t.id} value={t.id}>{isAr ? t.nameAr : t.nameEn}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-dark-400 mb-1">{isAr ? "الغلاف" : "Cover"}</label>
          <select value={coverType} onChange={(e) => setCoverType(e.target.value as "soft" | "hard")} className={selectClassName()}>
            {NBB_COVER_TYPES.map((t) => (
              <option key={t.id} value={t.id}>{isAr ? t.nameAr : t.nameEn}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Input label={isAr ? "العرض" : "Width"} type="number" step="0.1" value={width} onChange={(e) => setWidth(Number(e.target.value))} />
        <Input label={isAr ? "الطول" : "Height"} type="number" step="0.1" value={height} onChange={(e) => setHeight(Number(e.target.value))} />
        <Input label={isAr ? "الكمية" : "Qty"} type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
      </div>

      <div className="space-y-2 p-4 rounded-lg border border-gold-500/10 bg-heritage-900/40">
        {sectionTitle(isAr ? "الغلاف (ديجيتال 32×47)" : "Cover")}
        <div className="grid sm:grid-cols-3 gap-2">
          {coverType === "soft" && (
            <select value={coverPaper} onChange={(e) => setCoverPaper(e.target.value)} className={selectClassName()}>
              {NBB_COVER_PAPERS.map((p) => (
                <option key={p.id} value={p.id}>{p.nameAr}</option>
              ))}
            </select>
          )}
          <select value={coverSide} onChange={(e) => setCoverSide(e.target.value as "single" | "double")} className={selectClassName()}>
            <option value="single">{isAr ? "وجه واحد" : "Single"}</option>
            <option value="double">{isAr ? "وجهين" : "Double"}</option>
          </select>
          <select value={lamination} onChange={(e) => setLamination(e.target.value as "none" | "one" | "double")} className={selectClassName()}>
            <option value="none">{isAr ? "بدون لامينيشن" : "No lamination"}</option>
            <option value="one">{isAr ? "لامينيشن وجه" : "One-side lam."}</option>
            <option value="double">{isAr ? "لامينيشن وجهين" : "Both sides"}</option>
          </select>
        </div>
      </div>

      <div className="space-y-3 p-4 rounded-lg border border-gold-500/10 bg-heritage-900/40">
        <div className="flex justify-between items-center">
          {sectionTitle(isAr ? "الداخلي" : "Inner")}
          <Button type="button" size="sm" variant="outline" onClick={() => setInnerEntries((p) => [...p, { sheetsPerNotebook: 50, paperTypeId: "60g", printType: "ink", inkColor: "one", sides: "single", designMode: "fixed" }])}>
            +
          </Button>
        </div>
        {innerEntries.map((entry, idx) => (
          <div key={idx} className="grid sm:grid-cols-2 gap-2 p-2 rounded border border-dark-700">
            <Input label={isAr ? "عدد الأوراق" : "Sheets"} type="number" min={1} value={entry.sheetsPerNotebook} onChange={(e) => updateInner(idx, { sheetsPerNotebook: Number(e.target.value) })} />
            <select value={entry.printType} onChange={(e) => updateInner(idx, { printType: e.target.value as "ink" | "digital" })} className={selectClassName()}>
              <option value="ink">{isAr ? "إنك 70×100" : "Ink 70×100"}</option>
              <option value="digital">{isAr ? "ديجيتال 32×47" : "Digital 32×47"}</option>
            </select>
            <select value={entry.paperTypeId} onChange={(e) => updateInner(idx, { paperTypeId: e.target.value })} className={selectClassName()}>
              {(entry.printType === "digital" ? NBB_COVER_PAPERS : NBB_INK_PAPERS).map((p) => (
                <option key={p.id} value={p.id}>{p.nameAr}</option>
              ))}
            </select>
            {entry.printType === "ink" ? (
              <select value={entry.inkColor} onChange={(e) => updateInner(idx, { inkColor: e.target.value as "one" | "full" })} className={selectClassName()}>
                <option value="one">{isAr ? "لون واحد" : "One color"}</option>
                <option value="full">{isAr ? "ألوان" : "Full color"}</option>
              </select>
            ) : (
              <select value={entry.printingSide} onChange={(e) => updateInner(idx, { printingSide: e.target.value as "single" | "double" })} className={selectClassName()}>
                <option value="single">{isAr ? "وجه" : "Single"}</option>
                <option value="double">{isAr ? "وجهين" : "Double"}</option>
              </select>
            )}
          </div>
        ))}
      </div>

      <div>
        <label className="block text-xs text-dark-400 mb-1">{isAr ? "التشطيب" : "Finishing"}</label>
        <select value={finishing} onChange={(e) => setFinishing(e.target.value)} className={selectClassName()}>
          {NBB_FINISHING_TYPES.map((f) => (
            <option key={f.id} value={f.id}>{f.nameAr}</option>
          ))}
        </select>
      </div>

      {calc && (
        <div className="text-sm space-y-1 p-3 rounded-lg bg-heritage-900/60 text-heritage-200">
          <div className="flex justify-between"><span>{isAr ? "غلاف" : "Cover"}</span><span>{calc.totals.coverCost.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>{isAr ? "داخلي" : "Inner"}</span><span>{calc.totals.innerCost.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>{isAr ? "تشطيب" : "Finish"}</span><span>{calc.totals.finishingCost.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold text-gold-400"><span>{isAr ? "ربح" : "Profit"}</span><span>{calc.totals.profitPercent.toFixed(1)}%</span></div>
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
        totalPrice={calc?.totals.sellingPrice ?? 0}
        onAddToCart={addToCart}
        disabled={!calc}
      />
    </ConfiguratorShell>
  );
}
