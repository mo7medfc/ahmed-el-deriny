"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  DAFATER_PROFIT_TIERS,
  NBB_COVER_PAPERS,
  NBB_FINISHING_TYPES,
  NBB_INK_PAPERS,
  NBB_INK_RATE_KEYS,
  NOTEBOOKS_INVOICES_OFFSET_TYPES,
  PAPER_WEIGHTS,
  STAMP_BANDS,
  STAMP_DEFAULT_SIZES,
  stampDocId,
  stampSerialDocId,
} from "@/lib/pricing/legacy-catalog";
import {
  defaultDafaterCostConfig,
  defaultDafaterSellConfig,
  defaultNBBConfig,
  defaultNotebooksInvoicesCostConfig,
  defaultNotebooksInvoicesSellConfig,
} from "@/lib/pricing/legacy-defaults";
import { fieldsToConfig, getDeepValue } from "@/lib/pricing/config-utils";

type CustomDocs = Record<string, Record<string, Record<string, unknown>>>;

async function patchPricing(
  categoryId: string,
  updates: Array<{ collection: string; docId: string; data: Record<string, unknown> }>
) {
  const res = await fetch(`/api/admin/pricing/${encodeURIComponent(categoryId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ updates }),
  });
  return res.ok;
}

function NumInput({
  label,
  value,
  onChange,
  step = "0.01",
}: {
  label: string;
  value: number | string;
  onChange: (v: string) => void;
  step?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-dark-400 mb-1">{label}</label>
      <input
        type="number"
        step={step}
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm focus:border-brand-500 outline-none"
      />
    </div>
  );
}

function ProfitTiersEditor({
  tiers,
  onChange,
}: {
  tiers: Array<{ min: number | ""; max: number | "" | null; percent: number | "" }>;
  onChange: (tiers: typeof tiers) => void;
}) {
  return (
    <div className="space-y-2">
      {tiers.map((t, i) => (
        <div key={i} className="grid grid-cols-4 gap-2 items-center">
          <input
            type="number"
            placeholder="من"
            value={t.min}
            onChange={(e) => {
              const next = [...tiers];
              next[i] = { ...t, min: e.target.value === "" ? "" : Number(e.target.value) };
              onChange(next);
            }}
            className="bg-dark-800 border border-dark-600 rounded-lg px-2 py-2 text-sm text-white"
          />
          <input
            type="number"
            placeholder="إلى (∞ فارغ)"
            value={t.max ?? ""}
            onChange={(e) => {
              const next = [...tiers];
              next[i] = {
                ...t,
                max: e.target.value === "" ? null : Number(e.target.value),
              };
              onChange(next);
            }}
            className="bg-dark-800 border border-dark-600 rounded-lg px-2 py-2 text-sm text-white"
          />
          <input
            type="number"
            placeholder="%"
            value={t.percent}
            onChange={(e) => {
              const next = [...tiers];
              next[i] = { ...t, percent: e.target.value === "" ? "" : Number(e.target.value) };
              onChange(next);
            }}
            className="bg-dark-800 border border-dark-600 rounded-lg px-2 py-2 text-sm text-brand-400"
          />
          <button
            type="button"
            onClick={() => onChange(tiers.filter((_, idx) => idx !== i))}
            className="text-red-400 text-xs hover:text-red-300"
          >
            حذف
          </button>
        </div>
      ))}
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() =>
          onChange([...tiers, { min: 0, max: null, percent: 0 }])
        }
      >
        + إضافة شريحة
      </Button>
    </div>
  );
}

export function DafaterPricingEditor({
  categoryId,
  customDocs,
  onSaved,
}: {
  categoryId: string;
  customDocs: CustomDocs;
  onSaved: () => void;
}) {
  const [mode, setMode] = useState<"cost" | "sell">("cost");
  const [saving, setSaving] = useState(false);

  const costCfg = useMemo(
    () =>
      (customDocs.dafater_prices_cost?.default as Record<string, unknown>) ||
      defaultDafaterCostConfig(),
    [customDocs]
  );
  const sellCfg = useMemo(
    () =>
      (customDocs.dafater_prices_sell?.default as Record<string, unknown>) ||
      defaultDafaterSellConfig(),
    [customDocs]
  );

  const [costFields, setCostFields] = useState<Record<string, string>>({});
  const [tiers, setTiers] = useState(
    ((sellCfg.profitTiers as Array<{ min: number; max: number | null; percent: number }>) ||
      DAFATER_PROFIT_TIERS).map((t) => ({ ...t }))
  );

  const v = (path: string, fallback: number) =>
    costFields[path] ??
    String(getDeepValue(mode === "cost" ? costCfg : sellCfg, path, fallback));

  const setField = (path: string, raw: string) =>
    setCostFields((prev) => ({ ...prev, [path]: raw }));

  const save = async () => {
    setSaving(true);
    if (mode === "sell") {
      await patchPricing(categoryId, [
        {
          collection: "dafater_prices_sell",
          docId: "default",
          data: { profitTiers: tiers },
        },
      ]);
    } else {
      const cfg = fieldsToConfig(costFields);
      const merged = { ...defaultDafaterCostConfig(), ...cfg, inkjet: { ...defaultDafaterCostConfig().inkjet, ...(cfg.inkjet as object) }, offset: { ...defaultDafaterCostConfig().offset, ...(cfg.offset as object) } };
      await patchPricing(categoryId, [
        { collection: "dafater_prices_cost", docId: "default", data: merged },
      ]);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="glass rounded-2xl p-6 mb-6 space-y-6">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("cost")}
          className={`px-4 py-2 rounded-lg text-sm font-bold ${mode === "cost" ? "bg-brand-500 text-white" : "bg-dark-800 text-dark-300"}`}
        >
          تكلفة الإنتاج
        </button>
        <button
          type="button"
          onClick={() => setMode("sell")}
          className={`px-4 py-2 rounded-lg text-sm font-bold ${mode === "sell" ? "bg-brand-500 text-white" : "bg-dark-800 text-dark-300"}`}
        >
          شرائح الربح
        </button>
      </div>

      {mode === "sell" ? (
        <div>
          <h3 className="font-bold text-white mb-3">شرائح الربح حسب التكلفة</h3>
          <ProfitTiersEditor tiers={tiers} onChange={setTiers} />
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            <NumInput label="طباعة لون واحد / ورقة" value={v("inkjet.printingOneColor", 0.15)} onChange={(x) => setField("inkjet.printingOneColor", x)} />
            <NumInput label="طباعة ألوان / ورقة (مكربن)" value={v("inkjet.printingFullColor", 0.25)} onChange={(x) => setField("inkjet.printingFullColor", x)} />
            <NumInput label="تجليد أساس 20×30" value={v("inkjet.bindingBase20x30", 0)} onChange={(x) => setField("inkjet.bindingBase20x30", x)} />
            <NumInput label="نمرة / 1000 ورقة" value={v("inkjet.serialPer1000", 100)} onChange={(x) => setField("inkjet.serialPer1000", x)} step="1" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-brand-400 mb-2">أسعار ورق إنك جيت (21×30)</h4>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {PAPER_WEIGHTS.map((p) => (
                <NumInput
                  key={p.id}
                  label={p.nameAr}
                  value={v(`inkjet.paperPrices.${p.id}`, 0)}
                  onChange={(x) => setField(`inkjet.paperPrices.${p.id}`, x)}
                />
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <NumInput label="زنجات أوفست" value={v("offset.platesCost", 0)} onChange={(x) => setField("offset.platesCost", x)} />
            <NumInput label="تشغيل ماكينة / فرخ 70×100" value={v("offset.machineRunPerSheet", 0)} onChange={(x) => setField("offset.machineRunPerSheet", x)} />
            <NumInput label="تجليد أوفست أساس 20×30" value={v("offset.bindingBase20x30", 0)} onChange={(x) => setField("offset.bindingBase20x30", x)} />
            <NumInput label="دشت (هدر)" value={v("offset.spoilage", 3)} onChange={(x) => setField("offset.spoilage", x)} step="1" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-brand-400 mb-2">أسعار فرخ أوفست 70×100</h4>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {PAPER_WEIGHTS.map((p) => (
                <NumInput
                  key={p.id}
                  label={p.nameAr}
                  value={v(`offset.sheetPrices.${p.id}`, 0)}
                  onChange={(x) => setField(`offset.sheetPrices.${p.id}`, x)}
                />
              ))}
            </div>
          </div>
        </>
      )}

      <Button onClick={save} disabled={saving}>
        {saving ? "جاري الحفظ..." : "حفظ إعدادات الدفاتر"}
      </Button>
    </div>
  );
}

export function NotebooksInvoicesPricingEditor({
  categoryId,
  customDocs,
  onSaved,
}: {
  categoryId: string;
  customDocs: CustomDocs;
  onSaved: () => void;
}) {
  const [mode, setMode] = useState<"sell" | "cost">("sell");
  const [saving, setSaving] = useState(false);
  const sellCfg =
    (customDocs.notebooks_sell_prices?.default as Record<string, unknown>) ||
    defaultNotebooksInvoicesSellConfig();
  const costCfg =
    (customDocs.notebooks_cost_prices?.default as Record<string, unknown>) ||
    defaultNotebooksInvoicesCostConfig();
  const cfg = mode === "sell" ? sellCfg : costCfg;
  const [fields, setFields] = useState<Record<string, string>>({});

  const v = (path: string, fallback: number) =>
    fields[path] ?? String(getDeepValue(cfg, path, fallback));
  const setF = (path: string, raw: string) =>
    setFields((p) => ({ ...p, [path]: raw }));

  const save = async () => {
    setSaving(true);
    const merged = { ...cfg, ...fieldsToConfig(fields) };
    await patchPricing(categoryId, [
      {
        collection: mode === "sell" ? "notebooks_sell_prices" : "notebooks_cost_prices",
        docId: "default",
        data: merged,
      },
    ]);
    setSaving(false);
    onSaved();
  };

  return (
    <div className="glass rounded-2xl p-6 mb-6 space-y-4">
      <div className="flex gap-2 mb-4">
        <button type="button" onClick={() => setMode("sell")} className={`px-4 py-2 rounded-lg text-sm font-bold ${mode === "sell" ? "bg-brand-500 text-white" : "bg-dark-800 text-dark-300"}`}>أسعار البيع</button>
        <button type="button" onClick={() => setMode("cost")} className={`px-4 py-2 rounded-lg text-sm font-bold ${mode === "cost" ? "bg-brand-500 text-white" : "bg-dark-800 text-dark-300"}`}>التكلفة</button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <NumInput label="سعر فرخ 70×100" value={v("pricePerParentSheet", 100)} onChange={(x) => setF("pricePerParentSheet", x)} />
        <NumInput label="تجليد أساس 20×30" value={v("bindingRef20x30", 15)} onChange={(x) => setF("bindingRef20x30", x)} />
        <NumInput label="طباعة لون / ورقة" value={v("printingOneColor", 0.15)} onChange={(x) => setF("printingOneColor", x)} />
        <NumInput label="طباعة ألوان / ورقة" value={v("printingFullColor", 0.25)} onChange={(x) => setF("printingFullColor", x)} />
        <NumInput label="نمرة / 1000 ورقة" value={v("serialPer1000", 100)} onChange={(x) => setF("serialPer1000", x)} step="1" />
      </div>
      <h4 className="text-sm font-bold text-brand-400">أسعار الأوفست (لكل 100 ورقة)</h4>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
        {NOTEBOOKS_INVOICES_OFFSET_TYPES.map((p) => (
          <NumInput
            key={p.id}
            label={p.nameAr}
            value={v(`offsetPricePer100.${p.id}`, 0)}
            onChange={(x) => setF(`offsetPricePer100.${p.id}`, x)}
          />
        ))}
      </div>
      <Button onClick={save} disabled={saving}>{saving ? "..." : "حفظ دفاتر/فواتير"}</Button>
    </div>
  );
}

export function NBBPricingEditor({
  categoryId,
  customDocs,
  onSaved,
}: {
  categoryId: string;
  customDocs: CustomDocs;
  onSaved: () => void;
}) {
  const cfg =
    (customDocs.notebooks_books_booklets_prices?.default as Record<string, unknown>) ||
    defaultNBBConfig();
  const [fields, setFields] = useState<Record<string, string>>({});
  const [tiers, setTiers] = useState(
    ((cfg.profitTiers as Array<{ min: number; max: number | null; percent: number }>) || []).map(
      (t) => ({ ...t })
    )
  );
  const [saving, setSaving] = useState(false);

  const v = (path: string) => fields[path] ?? String(getDeepValue(cfg, path, 0));
  const setF = (path: string, raw: string) => setFields((p) => ({ ...p, [path]: raw }));

  const save = async () => {
    setSaving(true);
    const merged = { ...cfg, ...fieldsToConfig(fields), profitTiers: tiers };
    await patchPricing(categoryId, [
      { collection: "notebooks_books_booklets_prices", docId: "default", data: merged },
    ]);
    setSaving(false);
    onSaved();
  };

  return (
    <div className="glass rounded-2xl p-6 mb-6 space-y-6">
      <h3 className="font-bold text-white">نوت بوك / كتب / ملازم — جداول التسعير</h3>

      <div>
        <h4 className="text-sm text-brand-400 mb-2">أسعار الغلاف ديجيتال 32×47 (وجه / وجهين)</h4>
        <div className="space-y-2">
          {NBB_COVER_PAPERS.map((p) => (
            <div key={p.id} className="grid grid-cols-3 gap-2 items-center">
              <span className="text-sm text-dark-300">{p.nameAr}</span>
              <NumInput label="وجه" value={v(`coverDigitalSheetPrices.${p.id}.single`)} onChange={(x) => setF(`coverDigitalSheetPrices.${p.id}.single`, x)} />
              <NumInput label="وجهين" value={v(`coverDigitalSheetPrices.${p.id}.double`)} onChange={(x) => setF(`coverDigitalSheetPrices.${p.id}.double`, x)} />
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <NumInput label="لامينيشن وجه" value={v("coverLaminationPrices.one_side")} onChange={(x) => setF("coverLaminationPrices.one_side", x)} />
        <NumInput label="لامينيشن وجهين" value={v("coverLaminationPrices.double_side")} onChange={(x) => setF("coverLaminationPrices.double_side", x)} />
      </div>

      <div>
        <h4 className="text-sm text-brand-400 mb-2">أسعار الداخلي ديجيتال 32×47 (وجه / وجهين)</h4>
        <div className="space-y-2">
          {NBB_COVER_PAPERS.map((p) => (
            <div key={p.id} className="grid grid-cols-3 gap-2 items-center">
              <span className="text-sm text-dark-300">{p.nameAr}</span>
              <NumInput label="وجه" value={v(`innerDigitalSheetPrices.${p.id}.single`)} onChange={(x) => setF(`innerDigitalSheetPrices.${p.id}.single`, x)} />
              <NumInput label="وجهين" value={v(`innerDigitalSheetPrices.${p.id}.double`)} onChange={(x) => setF(`innerDigitalSheetPrices.${p.id}.double`, x)} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm text-brand-400 mb-2">أسعار ورق إنك 70×100</h4>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {NBB_INK_PAPERS.map((p) => (
            <NumInput
              key={p.id}
              label={p.nameAr}
              value={v(`inkPaperSheetPrices70x100.${p.id}`)}
              onChange={(x) => setF(`inkPaperSheetPrices70x100.${p.id}`, x)}
            />
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm text-brand-400 mb-2">التشطيب / السلك (أساس 20×30)</h4>
        <div className="grid sm:grid-cols-2 gap-3">
          {NBB_FINISHING_TYPES.map((f) => (
            <NumInput
              key={f.id}
              label={f.nameAr}
              value={v(`finishingBasePrices20x30.${f.id}`)}
              onChange={(x) => setF(`finishingBasePrices20x30.${f.id}`, x)}
            />
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm text-brand-400 mb-2">طباعة إنك 70×100</h4>
        <div className="grid sm:grid-cols-2 gap-3">
          {NBB_INK_RATE_KEYS.map((k) => (
            <NumInput key={k.id} label={k.nameAr} value={v(`inkPrintingRates.${k.id}`)} onChange={(x) => setF(`inkPrintingRates.${k.id}`, x)} />
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm text-brand-400 mb-2">تكلفة الكرتون (هارد كافر — لكل نوت)</h4>
        <div className="grid sm:grid-cols-3 gap-3">
          <NumInput label="20×30" value={v("cartonCostPerNotebook.20x30")} onChange={(x) => setF("cartonCostPerNotebook.20x30", x)} />
          <NumInput label="15×20" value={v("cartonCostPerNotebook.15x20")} onChange={(x) => setF("cartonCostPerNotebook.15x20", x)} />
          <NumInput label="10×15" value={v("cartonCostPerNotebook.10x15")} onChange={(x) => setF("cartonCostPerNotebook.10x15", x)} />
        </div>
      </div>

      <div>
        <h4 className="text-sm text-brand-400 mb-2">شرائح الربح (حسب الكمية)</h4>
        <ProfitTiersEditor tiers={tiers} onChange={setTiers} />
      </div>

      <Button onClick={save} disabled={saving}>{saving ? "..." : "حفظ كتب/كتيبات"}</Button>
    </div>
  );
}

export function StampsPricingEditor({
  categoryId,
  sellMap,
  costMap,
  onSaved,
}: {
  categoryId: string;
  sellMap: Record<string, Record<string, unknown>>;
  costMap: Record<string, Record<string, unknown>>;
  onSaved: () => void;
}) {
  const [mode, setMode] = useState<"sell" | "cost">("sell");
  const [band, setBand] = useState("automatic_machine");
  const [saving, setSaving] = useState(false);
  const map = mode === "sell" ? sellMap : costMap;
  const isMachine = band === "automatic_machine";
  const isSell = mode === "sell";

  const [rows, setRows] = useState<Record<string, Record<string, number | "">>>({});
  const [serialAddon, setSerialAddon] = useState<string>("");

  const sizes = STAMP_DEFAULT_SIZES[band] || [];
  const rowKey = (sizeId: string) => `${band}_${sizeId}`;

  const getSerialAddon = () => {
    if (serialAddon !== "") return serialAddon;
    const doc = map[stampSerialDocId(band)] || {};
    return String(
      isSell ? doc.sellSerialAddonPrice ?? 0 : doc.costSerialAddonPrice ?? 0
    );
  };

  const getVal = (sizeId: string, field: string, fallback = 0) => {
    const k = `${rowKey(sizeId)}.${field}`;
    if (rows[k] !== undefined && rows[k][field] !== undefined) return rows[k][field];
    const doc = map[stampDocId(band, sizeId)] || {};
    if (field === "a") {
      return isMachine
        ? Number(isSell ? doc.sellPriceMachineOnly : doc.costPriceMachineOnly) || fallback
        : Number(isSell ? doc.sellPriceHandleOnly : doc.costPriceHandleOnly) || fallback;
    }
    if (field === "b") {
      return isMachine
        ? Number(isSell ? doc.sellPriceMachineStamp : doc.costPriceMachineStamp) || fallback
        : Number(isSell ? doc.sellPriceHandleStamp : doc.costPriceHandleStamp) || fallback;
    }
    const ink = (isSell ? doc.sellInkPrices : doc.costInkPrices) as Record<string, number> | undefined;
    return Number(ink?.[field] ?? fallback);
  };

  const setVal = (sizeId: string, field: string, raw: string) => {
    const k = rowKey(sizeId);
    setRows((prev) => ({
      ...prev,
      [k]: { ...(prev[k] || {}), [field]: raw === "" ? "" : Number(raw) },
    }));
  };

  const saveBand = async () => {
    setSaving(true);
    const updates: Array<{ collection: string; docId: string; data: Record<string, unknown> }> = [];

    for (const size of sizes) {
      const docId = stampDocId(band, size.sizeId);
      const a = getVal(size.sizeId, "a");
      const b = getVal(size.sizeId, "b");
      const base = {
        categoryId: "Stamps",
        band,
        sizeId: size.sizeId,
        productName: size.productName,
        productNameAr: size.productNameAr,
        currency: "EGP",
      };
      if (isSell) {
        updates.push({
          collection: "product_prices_sell",
          docId,
          data: isMachine
            ? {
                ...base,
                sellPriceMachineOnly: a,
                sellPriceMachineStamp: b,
                sellInkPrices: {
                  black: getVal(size.sizeId, "black"),
                  red: getVal(size.sizeId, "red"),
                  green: getVal(size.sizeId, "green"),
                },
              }
            : { ...base, sellPriceHandleOnly: a, sellPriceHandleStamp: b },
        });
      } else {
        updates.push({
          collection: "product_prices_cost",
          docId,
          data: isMachine
            ? {
                ...base,
                costPriceMachineOnly: a,
                costPriceMachineStamp: b,
                costInkPrices: {
                  black: getVal(size.sizeId, "black"),
                  red: getVal(size.sizeId, "red"),
                  green: getVal(size.sizeId, "green"),
                },
              }
            : { ...base, costPriceHandleOnly: a, costPriceHandleStamp: b },
        });
      }
    }

    if (band !== "cliche_only") {
      updates.push({
        collection: isSell ? "product_prices_sell" : "product_prices_cost",
        docId: stampSerialDocId(band),
        data: {
          categoryId: "Stamps",
          band,
          type: "serial_addon",
          currency: "EGP",
          ...(isSell
            ? { sellSerialAddonPrice: Number(getSerialAddon()) || 0 }
            : { costSerialAddonPrice: Number(getSerialAddon()) || 0 }),
        },
      });
    }

    await patchPricing(categoryId, updates);
    setSaving(false);
    onSaved();
  };

  if (band === "cliche_only") {
    const doc = map.Stamps_cliche || {};
    const perCm2 = isSell
      ? Number(doc.sellPricePerCm2 ?? 0.015)
      : Number(doc.costPricePerCm2 ?? 0.015);
    return (
      <div className="glass rounded-2xl p-6 mb-6">
        <NumInput
          label="سعر الكليشيه / سم²"
          value={perCm2}
          onChange={async (raw) => {
            await patchPricing(categoryId, [
              {
                collection: isSell ? "product_prices_sell" : "product_prices_cost",
                docId: "Stamps_cliche",
                data: {
                  categoryId: "Stamps",
                  band: "cliche_only",
                  ...(isSell ? { sellPricePerCm2: Number(raw) || 0 } : { costPricePerCm2: Number(raw) || 0 }),
                },
              },
            ]);
            onSaved();
          }}
        />
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 mb-6 space-y-4">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setMode("sell")} className={`px-3 py-1.5 rounded-lg text-sm ${mode === "sell" ? "bg-green-600 text-white" : "bg-dark-800 text-dark-300"}`}>بيع</button>
        <button type="button" onClick={() => setMode("cost")} className={`px-3 py-1.5 rounded-lg text-sm ${mode === "cost" ? "bg-red-600 text-white" : "bg-dark-800 text-dark-300"}`}>تكلفة</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {STAMP_BANDS.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => {
              setBand(b.id);
              setSerialAddon("");
              setRows({});
            }}
            className={`px-3 py-1.5 rounded-lg text-sm ${band === b.id ? "bg-brand-500 text-white" : "bg-dark-800 text-dark-300"}`}
          >
            {b.nameAr}
          </button>
        ))}
      </div>

      {band !== "cliche_only" && (
        <NumInput
          label="إضافة النمرة (Serial Add-on)"
          value={getSerialAddon()}
          onChange={setSerialAddon}
        />
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-dark-400 border-b border-dark-700">
              <th className="text-start py-2 px-2">المقاس</th>
              <th className="text-start py-2 px-2">{isMachine ? "ماكينة فقط" : "مقبض فقط"}</th>
              <th className="text-start py-2 px-2">{isMachine ? "ماكينة + ختم" : "مقبض + ختم"}</th>
              {isMachine && <th className="text-start py-2 px-2">حبر (أسود/أحمر/أخضر)</th>}
            </tr>
          </thead>
          <tbody>
            {sizes.map((s) => (
              <tr key={s.sizeId} className="border-b border-dark-800">
                <td className="py-2 px-2 text-white">{s.productNameAr}</td>
                <td className="py-2 px-2">
                  <input type="number" step="0.01" value={getVal(s.sizeId, "a")} onChange={(e) => setVal(s.sizeId, "a", e.target.value)} className="w-24 bg-dark-800 border border-dark-600 rounded px-2 py-1 text-brand-400" />
                </td>
                <td className="py-2 px-2">
                  <input type="number" step="0.01" value={getVal(s.sizeId, "b")} onChange={(e) => setVal(s.sizeId, "b", e.target.value)} className="w-24 bg-dark-800 border border-dark-600 rounded px-2 py-1 text-brand-400" />
                </td>
                {isMachine && (
                  <td className="py-2 px-2">
                    <div className="flex gap-1">
                      {(["black", "red", "green"] as const).map((c) => (
                        <input
                          key={c}
                          type="number"
                          step="0.01"
                          value={getVal(s.sizeId, c)}
                          onChange={(e) => setVal(s.sizeId, c, e.target.value)}
                          className="w-16 bg-dark-800 border border-dark-600 rounded px-1 py-1 text-xs text-white"
                          placeholder={c}
                        />
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button onClick={saveBand} disabled={saving}>{saving ? "..." : `حفظ ${STAMP_BANDS.find((b) => b.id === band)?.nameAr}`}</Button>
    </div>
  );
}
