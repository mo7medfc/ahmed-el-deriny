import {
  NBB_COVER_PAPERS,
  NBB_FINISHING_TYPES,
  NBB_INK_PAPERS,
} from "./legacy-catalog";

export type NbbInnerEntry = {
  sheetsPerNotebook: number;
  paperTypeId: string;
  printType: "ink" | "digital";
  inkColor?: "one" | "full";
  sides?: "single" | "double";
  designMode?: "fixed" | "variable";
  printingSide?: "single" | "double";
};

function norm(v: unknown) {
  const n = parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

function getPiecesPerSheet(parentW: number, parentH: number, pieceW: number, pieceH: number) {
  const w = norm(pieceW);
  const h = norm(pieceH);
  if (w <= 0 || h <= 0) return 0;
  const a = Math.floor(parentW / w) * Math.floor(parentH / h);
  const b = Math.floor(parentW / h) * Math.floor(parentH / w);
  return Math.max(a, b, 1);
}

function pickProfitTier(
  quantity: number,
  tiers: Array<{ min: number; max: number | null; percent: number }>
) {
  const qty = norm(quantity);
  const match = tiers.find((t) => {
    const min = norm(t.min);
    const max = t.max === null || t.max === undefined ? null : norm(t.max);
    if (qty < min) return false;
    if (max === null) return true;
    return qty <= max;
  });
  return match || null;
}

function finishingPriceForSize(w: number, h: number, base20x30: number) {
  const base = norm(base20x30);
  const area = w * h;
  const ref = 20 * 30;
  if (area <= 0 || ref <= 0) return base;
  return (base * area) / ref;
}

function cartonCostForSize(w: number, h: number, table: Record<string, number>) {
  const area = w * h;
  const refs = [
    { key: "20x30", w: 20, h: 30 },
    { key: "15x20", w: 15, h: 20 },
    { key: "10x15", w: 10, h: 15 },
  ].filter((r) => table[r.key] !== undefined);
  if (!refs.length) return 0;
  let best = refs[0];
  let bestDiff = Math.abs(area - best.w * best.h);
  for (const r of refs) {
    const diff = Math.abs(area - r.w * r.h);
    if (diff < bestDiff) {
      best = r;
      bestDiff = diff;
    }
  }
  return norm(table[best.key]);
}

export function calculateNBB(params: {
  mainType?: string;
  coverType: "soft" | "hard";
  widthCm: number;
  heightCm: number;
  quantity: number;
  cover: {
    paperTypeId: string;
    printingSide: "single" | "double";
    lamination: "none" | "one" | "double";
  };
  innerEntries: NbbInnerEntry[];
  finishingType: string;
  pricing: Record<string, unknown>;
}) {
  const w = norm(params.widthCm);
  const h = norm(params.heightCm);
  const qty = Math.max(1, parseInt(String(params.quantity), 10) || 1);
  if (w <= 0 || h <= 0) return null;

  const cfg = params.pricing;
  const coverParent = { width: 32, height: 47 };
  const inkParent = { width: 70, height: 100 };

  const coverPaperId =
    params.coverType === "hard" ? "coated_150" : params.cover.paperTypeId || "coated_150";
  const piecesPerCoverSheet = getPiecesPerSheet(coverParent.width, coverParent.height, w, h);
  const coverSheetsNeeded = Math.ceil((qty * 2) / piecesPerCoverSheet);

  const coverDigitalPrices =
    (cfg.coverDigitalSheetPrices as Record<string, Record<string, number>>) || {};
  const coverPaperPrices = coverDigitalPrices[coverPaperId] || {};
  const coverSheetPrice =
    params.cover.printingSide === "double"
      ? norm(coverPaperPrices.double)
      : norm(coverPaperPrices.single);

  const laminationPrices =
    (cfg.coverLaminationPrices as Record<string, number>) || {};
  let coverLaminationCost = 0;
  if (params.cover.lamination === "one")
    coverLaminationCost = coverSheetsNeeded * norm(laminationPrices.one_side);
  if (params.cover.lamination === "double")
    coverLaminationCost = coverSheetsNeeded * norm(laminationPrices.double_side);

  const coverCost = coverSheetsNeeded * coverSheetPrice + coverLaminationCost;

  const digitalInnerPrices =
    (cfg.innerDigitalSheetPrices as Record<string, Record<string, number>>) || {};
  const inkPaperSheetPrices =
    (cfg.inkPaperSheetPrices70x100 as Record<string, number>) || {};
  const inkPrintRates = (cfg.inkPrintingRates as Record<string, number>) || {};

  let innerCost = 0;
  for (const entry of params.innerEntries) {
    const sheetsPerNotebook = Math.max(0, parseInt(String(entry.sheetsPerNotebook), 10) || 0);
    if (sheetsPerNotebook <= 0 || !entry.paperTypeId) continue;

    if (entry.printType === "digital") {
      const piecesPerSheet = getPiecesPerSheet(coverParent.width, coverParent.height, w, h);
      const totalPieces = qty * sheetsPerNotebook;
      const sheetsNeeded = Math.ceil(totalPieces / piecesPerSheet);
      const paperPrices = digitalInnerPrices[entry.paperTypeId] || {};
      const sheetPrice =
        entry.printingSide === "double"
          ? norm(paperPrices.double)
          : norm(paperPrices.single);
      innerCost += sheetsNeeded * sheetPrice;
    } else {
      const piecesPerSheet = getPiecesPerSheet(inkParent.width, inkParent.height, w, h);
      const totalPieces = qty * sheetsPerNotebook;
      const requiredParentSheets = Math.ceil(totalPieces / piecesPerSheet);
      const parentSheetsTotal = requiredParentSheets + 3;
      const paperCost = parentSheetsTotal * norm(inkPaperSheetPrices[entry.paperTypeId]);
      const sidesMult = entry.sides === "double" ? 2 : 1;
      const rateKey = `${entry.inkColor || "one"}_${entry.designMode || "fixed"}`;
      const ratePerSide = norm(inkPrintRates[rateKey]);
      innerCost += paperCost + parentSheetsTotal * ratePerSide * sidesMult;
    }
  }

  const finishingPrices =
    (cfg.finishingBasePrices20x30 as Record<string, number>) || {};
  const finishingBase = norm(finishingPrices[params.finishingType]);
  const finishingPerNotebook = finishingPriceForSize(w, h, finishingBase);
  const finishingCost = finishingPerNotebook * qty;

  let cartonCost = 0;
  if (params.coverType === "hard") {
    cartonCost =
      cartonCostForSize(
        w,
        h,
        (cfg.cartonCostPerNotebook as Record<string, number>) || {}
      ) * qty;
  }

  const totalCost = coverCost + innerCost + finishingCost + cartonCost;
  const tiers = (cfg.profitTiers as Array<{ min: number; max: number | null; percent: number }>) || [];
  const tier = pickProfitTier(qty, tiers);
  const profitPercent = tier ? norm(tier.percent) : 0;
  const sellingPrice = totalCost + totalCost * (profitPercent / 100);

  return {
    totals: {
      coverCost,
      innerCost,
      finishingCost,
      cartonCost,
      totalCost,
      profitPercent,
      sellingPrice,
    },
  };
}

export function formatNbbSummary(
  locale: string,
  params: {
    mainType: string;
    coverType: string;
    widthCm: number;
    heightCm: number;
    quantity: number;
    finishingType: string;
  }
) {
  const isAr = locale === "ar";
  const main =
    params.mainType === "book"
      ? isAr
        ? "كتب"
        : "Books"
      : params.mainType === "booklet"
        ? isAr
          ? "ملازم"
          : "Booklets"
        : isAr
          ? "نوت بوك"
          : "Notebook";
  const cover =
    params.coverType === "hard" ? (isAr ? "هارد كافر" : "Hard cover") : isAr ? "سوفت كافر" : "Soft cover";
  const finish = NBB_FINISHING_TYPES.find((f) => f.id === params.finishingType);
  const finishLabel = finish?.nameAr;
  return `${main} · ${cover} · ${params.widthCm}×${params.heightCm} · ${params.quantity} ${isAr ? "قطعة" : "pcs"} · ${finishLabel}`;
}

export { NBB_COVER_PAPERS, NBB_FINISHING_TYPES, NBB_INK_PAPERS };

export const NBB_MAIN_TYPES = [
  { id: "notebook", nameAr: "نوت بوك", nameEn: "Notebook" },
  { id: "book", nameAr: "كتب", nameEn: "Books" },
  { id: "booklet", nameAr: "ملازم", nameEn: "Booklets" },
];

export const NBB_COVER_TYPES = [
  { id: "soft", nameAr: "سوفت كافر", nameEn: "Soft cover" },
  { id: "hard", nameAr: "هارد كافر", nameEn: "Hard cover" },
];
