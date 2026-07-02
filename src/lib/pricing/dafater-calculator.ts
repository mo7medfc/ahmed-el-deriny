import { DAFATER_PROFIT_TIERS, PAPER_WEIGHTS } from "./legacy-catalog";

export const DAFATER_TYPES = [
  { id: "carbon", nameAr: "مكربن", nameEn: "Carbon" },
  { id: "normal", nameAr: "عادي", nameEn: "Normal" },
  { id: "rashta", nameAr: "روشتة", nameEn: "Prescription" },
  { id: "offset", nameAr: "دفتر (أوفست)", nameEn: "Offset notebook" },
] as const;

export const DAFATER_CARBON_COPIES = Array.from({ length: 8 }, (_, i) => ({
  totalCopies: i + 2,
  nameAr: i === 0 ? "أصل + صورة" : `أصل + ${i + 1} صور`,
}));

export type DafaterType = (typeof DAFATER_TYPES)[number]["id"];
export type DafaterCostConfig = Record<string, unknown>;

function n(v: unknown) {
  const x = parseFloat(String(v));
  return Number.isFinite(x) ? x : 0;
}

function i(v: unknown, d = 0) {
  const x = parseInt(String(v), 10);
  return Number.isFinite(x) ? x : d;
}

function getBindingPrice(w: number, h: number, basePrice: number) {
  const base = n(basePrice);
  if (base <= 0) return 0;
  const area = w * h;
  const refArea = 20 * 30;
  if (area <= 0) return base;
  return (base * area) / refArea;
}

function getPiecesPerParentSheet(w: number, h: number) {
  const pw = 70;
  const ph = 100;
  if (w <= 0 || h <= 0) return 1;
  const a = Math.floor(pw / w) * Math.floor(ph / h);
  const b = Math.floor(pw / h) * Math.floor(ph / w);
  return Math.max(a, b, 1);
}

export function getProfitTier(
  cost: number,
  tiers: Array<{ min: number; max: number | null; percent: number }>
) {
  const c = n(cost);
  const arr = tiers.length ? tiers : DAFATER_PROFIT_TIERS;
  const match = arr.find((t) => {
    const min = n(t.min);
    const max = t.max === null || t.max === undefined ? null : n(t.max);
    if (c < min) return false;
    if (max === null) return true;
    return c < max;
  });
  return match || arr[arr.length - 1] || { percent: 0, min: 0, max: null };
}

export function applyDafaterProfit(
  totalCost: number,
  profitTiers: Array<{ min: number; max: number | null; percent: number }>
) {
  const tier = getProfitTier(totalCost, profitTiers);
  const percent = n(tier.percent);
  const profitValue = n(totalCost) * (percent / 100);
  return { percent, profitValue, sellingPrice: n(totalCost) + profitValue, tier };
}

function inkCfg(costCfg: DafaterCostConfig) {
  return (costCfg.inkjet as Record<string, unknown>) || costCfg;
}

function offCfg(costCfg: DafaterCostConfig) {
  return (costCfg.offset as Record<string, unknown>) || costCfg;
}

export function calculateDafater(params: {
  type: DafaterType;
  widthCm: number;
  heightCm: number;
  quantity: number;
  internalSheets: number;
  totalCopies?: number;
  color?: "one" | "full";
  paperWeight?: string;
  copies?: number;
  serialEnabled?: boolean;
  costCfg: DafaterCostConfig;
  profitTiers?: Array<{ min: number; max: number | null; percent: number }>;
}) {
  const w = n(params.widthCm);
  const h = n(params.heightCm);
  const qty = Math.max(1, i(params.quantity, 1));
  const sheets = Math.max(1, i(params.internalSheets, 50));
  if (w <= 0 || h <= 0) return null;

  const costCfg = params.costCfg;
  let totalCost = 0;

  if (params.type === "carbon") {
    const ink = inkCfg(costCfg);
    const copies = Math.max(2, Math.min(9, i(params.totalCopies, 2)));
    const totalSheetsBase = qty * sheets;
    const actualSheets = totalSheetsBase * copies;
    const printRate =
      params.color === "full"
        ? n(ink.printingFullColor ?? 0.25)
        : n(ink.printingOneColor ?? 0.15);
    const printingCost = actualSheets * printRate;
    const bindingPerNotebook = getBindingPrice(w, h, n(ink.bindingBase20x30));
    const bindingCost = bindingPerNotebook * qty;
    const serialPer1000 = n(ink.serialPer1000 ?? 100);
    const serialCost = params.serialEnabled
      ? Math.ceil(actualSheets / 1000) * serialPer1000
      : 0;
    totalCost = printingCost + bindingCost + serialCost;
  } else if (params.type === "normal" || params.type === "rashta") {
    const ink = inkCfg(costCfg);
    const totalSheets = qty * sheets;
    const paperPrices = (ink.paperPrices as Record<string, number>) || {};
    const paperCost = totalSheets * n(paperPrices[params.paperWeight || "60"]);
    const printingCost = totalSheets * n(ink.printingOneColor ?? 0.15);
    const bindingPerNotebook = getBindingPrice(w, h, n(ink.bindingBase20x30));
    const bindingCost = bindingPerNotebook * qty;
    const serialPer1000 = n(ink.serialPer1000 ?? 100);
    const serialCost = params.serialEnabled
      ? Math.ceil(totalSheets / 1000) * serialPer1000
      : 0;
    totalCost = paperCost + printingCost + bindingCost + serialCost;
  } else if (params.type === "offset") {
    const off = offCfg(costCfg);
    const copiesCount = Math.max(1, i(params.copies, 1));
    const totalSheets = qty * sheets * copiesCount;
    const piecesPerParent = getPiecesPerParentSheet(w, h);
    const spoilage = Math.max(0, i(off.spoilage ?? 3, 3));
    const requiredParentSheets = Math.ceil(totalSheets / piecesPerParent);
    const totalParentSheets = requiredParentSheets + spoilage;
    const sheetPrices = (off.sheetPrices as Record<string, number>) || {};
    const paperCost = totalParentSheets * n(sheetPrices[params.paperWeight || "60"]);
    const printingCost =
      n(off.platesCost) + totalParentSheets * n(off.machineRunPerSheet);
    const bindingPerNotebook = getBindingPrice(w, h, n(off.bindingBase20x30));
    const bindingCost = bindingPerNotebook * qty;
    totalCost = paperCost + printingCost + bindingCost;
  } else {
    return null;
  }

  const profit = applyDafaterProfit(
    totalCost,
    params.profitTiers || DAFATER_PROFIT_TIERS
  );

  return { totalCost, ...profit, quantity: qty };
}

export function formatDafaterSummary(
  locale: string,
  params: {
    type: DafaterType;
    widthCm: number;
    heightCm: number;
    quantity: number;
    internalSheets: number;
  }
) {
  const isAr = locale === "ar";
  const typeLabel = DAFATER_TYPES.find((t) => t.id === params.type);
  const name = isAr ? typeLabel?.nameAr : typeLabel?.nameEn;
  return `${name} · ${params.widthCm}×${params.heightCm} ${isAr ? "سم" : "cm"} · ${params.quantity} ${isAr ? "دفتر" : "books"} · ${params.internalSheets} ${isAr ? "ورقة" : "sheets"}`;
}

export { PAPER_WEIGHTS };
