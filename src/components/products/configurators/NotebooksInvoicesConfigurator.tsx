"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { Input } from "@/components/ui/Input";
import { useCartStore } from "@/store/cart";
import {
  calculateNotebooksInvoices,
  formatNiSummary,
  isNiOffsetSize,
  NI_BANDS,
  NI_CARBON_TYPES,
  resolveNiBand,
  type NiBand,
} from "@/lib/pricing/notebooks-invoices-calculator";
import { NOTEBOOKS_INVOICES_OFFSET_TYPES } from "@/lib/pricing/legacy-catalog";
import {
  ConfiguratorShell,
  OrderExtras,
  selectClassName,
  sectionTitle,
  useDesignUpload,
} from "./OrderExtras";
import { getPricingFetchUrl } from "@/lib/pricing-url";

export function NotebooksInvoicesConfigurator({
  product,
}: {
  product: { id: string; slug: string; nameAr: string; nameEn: string };
}) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const addItem = useCartStore((s) => s.addItem);
  const { designFile, designFileName, uploading, handleUpload, setDesignFromUrl } = useDesignUpload(isAr);

  const [sellCfg, setSellCfg] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [band, setBand] = useState<NiBand>("carbon");
  const [width, setWidth] = useState(21);
  const [height, setHeight] = useState(30);
  const [notebooks, setNotebooks] = useState(1);
  const [internalPages, setInternalPages] = useState(50);
  const [paperType, setPaperType] = useState("1copy");
  const [colorOption, setColorOption] = useState<"one" | "full">("one");
  const [offsetPaperTypeId, setOffsetPaperTypeId] = useState("1");
  const [serialEnabled, setSerialEnabled] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetch(getPricingFetchUrl("notebooks_invoices"))
      .then((r) => r.json())
      .then((d) => setSellCfg(d.sellConfig?.default || d.sellConfig || {}))
      .finally(() => setLoading(false));
  }, []);

  const effectiveBand = resolveNiBand(width, height, band);
  const isOffset = effectiveBand === "offset";

  const result = useMemo(
    () =>
      calculateNotebooksInvoices({
        band: effectiveBand,
        widthCm: width,
        heightCm: height,
        notebooks,
        internalPages,
        paperType,
        colorOption,
        serialEnabled,
        offsetPaperTypeId,
        sellCfg,
      }),
    [effectiveBand, width, height, notebooks, internalPages, paperType, colorOption, serialEnabled, offsetPaperTypeId, sellCfg]
  );

  const addToCart = () => {
    if (!result) return;
    const summary = formatNiSummary(locale, { band: effectiveBand, widthCm: width, heightCm: height, notebooks, internalPages });
    addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: isAr ? product.nameAr : product.nameEn,
      quantity: notebooks,
      selectedOptions: [],
      unitPrice: result.total / notebooks,
      totalPrice: result.total,
      designFile: designFile || undefined,
      designFileName: designFileName || undefined,
      notes: notes || undefined,
      configuration: { type: "notebooks_invoices", band: effectiveBand, widthCm: width, heightCm: height, internalPages, summary },
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
        <label className="block text-sm font-medium text-dark-200 mb-1">{isAr ? "النوع" : "Band"}</label>
        <select
          value={band}
          onChange={(e) => setBand(e.target.value as NiBand)}
          className={selectClassName()}
          disabled={isNiOffsetSize(width, height) && band !== "offset"}
        >
          {NI_BANDS.map((b) => (
            <option key={b.id} value={b.id}>{isAr ? b.nameAr : b.nameEn}</option>
          ))}
        </select>
        {isOffset && band !== "offset" && (
          <p className="text-xs text-amber-400 mt-1">{isAr ? "المقاس أكبر من 30×21 — يُحسب أوفست تلقائياً" : "Size > 30×21 — offset pricing applies"}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label={isAr ? "العرض (سم)" : "Width"} type="number" step="0.1" value={width} onChange={(e) => setWidth(Number(e.target.value))} />
        <Input label={isAr ? "الطول (سم)" : "Height"} type="number" step="0.1" value={height} onChange={(e) => setHeight(Number(e.target.value))} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label={isAr ? "عدد الدفاتر" : "Notebooks"} type="number" min={1} value={notebooks} onChange={(e) => setNotebooks(Number(e.target.value))} />
        <Input label={isAr ? "عدد الصفحات الداخلية" : "Inner pages"} type="number" min={1} value={internalPages} onChange={(e) => setInternalPages(Number(e.target.value))} />
      </div>

      {!isOffset && effectiveBand === "carbon" && (
        <div className="space-y-2">
          {sectionTitle(isAr ? "نوع المكربن" : "Carbon type")}
          <select value={paperType} onChange={(e) => setPaperType(e.target.value)} className={selectClassName()}>
            {NI_CARBON_TYPES.map((p) => (
              <option key={p.id} value={p.id}>{p.nameAr}</option>
            ))}
          </select>
        </div>
      )}

      {!isOffset && effectiveBand !== "prescription" && (
        <div className="space-y-2">
          {sectionTitle(isAr ? "الطباعة" : "Printing")}
          <select value={colorOption} onChange={(e) => setColorOption(e.target.value as "one" | "full")} className={selectClassName()}>
            <option value="one">{isAr ? "لون واحد" : "One color"}</option>
            <option value="full">{isAr ? "ألوان" : "Full color"}</option>
          </select>
        </div>
      )}

      {isOffset && (
        <div className="space-y-2">
          {sectionTitle(isAr ? "نوع الورق (أوفست)" : "Offset paper type")}
          <select value={offsetPaperTypeId} onChange={(e) => setOffsetPaperTypeId(e.target.value)} className={selectClassName()}>
            {NOTEBOOKS_INVOICES_OFFSET_TYPES.map((p) => (
              <option key={p.id} value={p.id}>{p.nameAr}</option>
            ))}
          </select>
        </div>
      )}

      <label className="flex items-center gap-2 text-sm text-heritage-100">
        <input type="checkbox" checked={serialEnabled} onChange={(e) => setSerialEnabled(e.target.checked)} className="accent-gold-500" />
        {isAr ? "تفعيل النمرة" : "Serial numbering"}
      </label>

      {result && (
        <div className="text-sm space-y-1 p-3 rounded-lg bg-heritage-900/60 text-heritage-200">
          <div className="flex justify-between"><span>{isAr ? "ورق" : "Paper"}</span><span>{result.paperCost.toFixed(2)}</span></div>
          {"printingCost" in result && (
            <div className="flex justify-between"><span>{isAr ? "طباعة" : "Print"}</span><span>{(result.printingCost ?? 0).toFixed(2)}</span></div>
          )}
          <div className="flex justify-between"><span>{isAr ? "تجليد" : "Binding"}</span><span>{result.bindingCost.toFixed(2)}</span></div>
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
        totalPrice={result?.total ?? 0}
        onAddToCart={addToCart}
        disabled={!result}
        productName={isAr ? product.nameAr : product.nameEn}
        productSlug={product.slug}
        pricingCategory="notebooks_invoices"
        configurationSummary={result ? formatNiSummary(locale, { band: effectiveBand, widthCm: width, heightCm: height, notebooks, internalPages }) : undefined}
        configurationState={result ? {
          widthCm: width,
          heightCm: height,
          quantity: notebooks,
          band: effectiveBand,
          bandLabel: NI_BANDS.find((b) => b.id === effectiveBand)?.nameAr,
          variantLabel: `${internalPages} ${isAr ? "صفحة" : "pages"}`,
        } : undefined}
        onDesignFromAi={setDesignFromUrl}
      />
    </ConfiguratorShell>
  );
}
