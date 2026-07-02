import { NOTEBOOKS_INVOICES_OFFSET_TYPES } from "./legacy-catalog";

export const NI_BANDS = [
  { id: "carbon", nameAr: "مكربن", nameEn: "Carbon" },
  { id: "original_only", nameAr: "أصل فقط", nameEn: "Original only" },
  { id: "prescription", nameAr: "روشتة", nameEn: "Prescription" },
  { id: "offset", nameAr: "دفتر (أوفست)", nameEn: "Offset" },
] as const;

export const NI_CARBON_TYPES = [
  { id: "1copy", nameAr: "أصل + نسخة واحدة", multiplier: 2 },
  { id: "2copies", nameAr: "أصل + نسختين", multiplier: 3 },
];

export type NiBand = (typeof NI_BANDS)[number]["id"];

function n(v: unknown) {
  const x = parseFloat(String(v));
  return Number.isFinite(x) ? x : 0;
}

function i(v: unknown, d = 0) {
  const x = parseInt(String(v), 10);
  return Number.isFinite(x) ? x : d;
}

export function isNiOffsetSize(widthCm: number, heightCm: number) {
  return widthCm > 30 || heightCm > 21;
}

function getPiecesPerParentSheet(widthCm: number, heightCm: number) {
  const w = n(widthCm);
  const h = n(heightCm);
  if (w <= 0 || h <= 0) return 0;
  const a = Math.floor(70 / w) * Math.floor(100 / h);
  const b = Math.floor(70 / h) * Math.floor(100 / w);
  return Math.max(a, b, 1);
}

function getBindingPriceForSize(widthCm: number, heightCm: number, bindingRef: number) {
  const area = n(widthCm) * n(heightCm);
  if (area <= 0) return bindingRef;
  return (bindingRef * area) / (20 * 30);
}

function calcSerialCost(printedSheets: number, serialEnabled: boolean, serialPer1000: number) {
  if (!serialEnabled) return 0;
  const sheets = i(printedSheets);
  if (sheets <= 0) return serialPer1000;
  return Math.ceil(sheets / 1000) * serialPer1000;
}

export function calculateNotebooksInvoices(params: {
  band: NiBand;
  widthCm: number;
  heightCm: number;
  notebooks: number;
  internalPages?: number;
  paperType?: string;
  colorOption?: "one" | "full";
  serialEnabled?: boolean;
  offsetPaperTypeId?: string;
  sellCfg: Record<string, unknown>;
}) {
  const w = n(params.widthCm);
  const h = n(params.heightCm);
  const notebooks = Math.max(1, i(params.notebooks, 1));
  const internalPages = Math.max(1, i(params.internalPages, 50));
  if (w <= 0 || h <= 0) return null;

  const cfg = params.sellCfg;
  const bindingRef = n(cfg.bindingRef20x30 ?? 15);
  const pricePerParentSheet = n(cfg.pricePerParentSheet ?? 100);
  const printingOneColor = n(cfg.printingOneColor ?? 0.15);
  const printingFullColor = n(cfg.printingFullColor ?? 0.25);
  const serialPer1000 = n(cfg.serialPer1000 ?? 100);
  const offsetPricePer100 =
    (cfg.offsetPricePer100 as Record<string, number>) || {};

  const band =
    params.band === "offset" || isNiOffsetSize(w, h) ? "offset" : params.band;

  const piecesPerParent = getPiecesPerParentSheet(w, h);
  if (piecesPerParent <= 0) return null;

  const bindingPerNotebook = getBindingPriceForSize(w, h, bindingRef);
  const totalInternalSheets = notebooks * internalPages;
  const requiredParent = Math.ceil(totalInternalSheets / piecesPerParent);
  const totalParentSheets = requiredParent + 3;

  if (band === "offset") {
    const offsetPaperTypeId = params.offsetPaperTypeId || "1";
    const pricePer100 = n(offsetPricePer100[offsetPaperTypeId] ?? 0);
    const paperCost = (totalParentSheets / 100) * pricePer100;
    const bindingCost = notebooks * bindingPerNotebook;
    const serialCost = calcSerialCost(totalParentSheets, !!params.serialEnabled, serialPer1000);
    const total = paperCost + bindingCost + serialCost;
    const typeOption = NOTEBOOKS_INVOICES_OFFSET_TYPES.find((t) => t.id === offsetPaperTypeId);
    return {
      band,
      total,
      bindingCost,
      paperCost,
      serialCost,
      bandNameAr: NI_BANDS.find((b) => b.id === "offset")?.nameAr,
      typeNameAr: typeOption?.nameAr,
    };
  }

  const paperCost = totalParentSheets * pricePerParentSheet;
  const printablePieces = totalParentSheets * 11;
  const copyMult =
    band === "carbon"
      ? NI_CARBON_TYPES.find((p) => p.id === params.paperType)?.multiplier ?? 2
      : 1;
  const printedSheets = Math.round(printablePieces * copyMult);
  const printingCost =
    printedSheets *
    (params.colorOption === "full" ? printingFullColor : printingOneColor);
  const bindingCost = notebooks * bindingPerNotebook;
  const serialCost = calcSerialCost(printedSheets, !!params.serialEnabled, serialPer1000);
  const total = paperCost + printingCost + bindingCost + serialCost;

  return {
    band,
    total,
    paperCost,
    printingCost,
    bindingCost,
    serialCost,
    bandNameAr: NI_BANDS.find((b) => b.id === band)?.nameAr,
  };
}

export function resolveNiBand(widthCm: number, heightCm: number, selected: NiBand): NiBand {
  if (selected === "offset" || isNiOffsetSize(widthCm, heightCm)) return "offset";
  return selected;
}

export function formatNiSummary(
  locale: string,
  params: {
    band: NiBand;
    widthCm: number;
    heightCm: number;
    notebooks: number;
    internalPages: number;
  }
) {
  const isAr = locale === "ar";
  const bandLabel = NI_BANDS.find((b) => b.id === params.band);
  return `${isAr ? bandLabel?.nameAr : bandLabel?.nameEn} · ${params.widthCm}×${params.heightCm} · ${params.notebooks} ${isAr ? "دفتر" : "books"} · ${params.internalPages} ${isAr ? "ورقة" : "pages"}`;
}
