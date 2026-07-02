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
} from "./legacy-catalog";
import {
  ENVELOPE_PLATE_PRICE_DEFAULT,
  ENVELOPE_PRODUCTS,
  ENVELOPE_QUANTITY_TIERS,
} from "./envelope-catalog";

function emptyPaperMap(ids: string[]) {
  return Object.fromEntries(ids.map((id) => [id, 0]));
}

function nbbSheetPriceMap(papers: Array<{ id: string }>, double = false) {
  const out: Record<string, { single: number; double: number } | number> = {};
  for (const p of papers) {
    out[p.id] = double ? { single: 0, double: 0 } : 0;
  }
  return out;
}

export function defaultDafaterCostConfig() {
  return {
    inkjet: {
      printingOneColor: 0.15,
      printingFullColor: 0.25,
      bindingBase20x30: 0,
      serialPer1000: 100,
      paperPrices: emptyPaperMap(PAPER_WEIGHTS.map((p) => p.id)),
    },
    offset: {
      platesCost: 0,
      machineRunPerSheet: 0,
      bindingBase20x30: 0,
      spoilage: 3,
      sheetPrices: emptyPaperMap(PAPER_WEIGHTS.map((p) => p.id)),
    },
  };
}

export function defaultDafaterSellConfig() {
  return { profitTiers: DAFATER_PROFIT_TIERS.map((t) => ({ ...t })) };
}

export function defaultNotebooksInvoicesSellConfig() {
  return {
    pricePerParentSheet: 100,
    bindingRef20x30: 15,
    printingOneColor: 0.15,
    printingFullColor: 0.25,
    serialPer1000: 100,
    offsetPricePer100: emptyPaperMap(NOTEBOOKS_INVOICES_OFFSET_TYPES.map((p) => p.id)),
  };
}

export function defaultNotebooksInvoicesCostConfig() {
  return {
    pricePerParentSheet: 0,
    bindingRef20x30: 0,
    printingOneColor: 0,
    printingFullColor: 0,
    serialPer1000: 0,
    offsetPricePer100: emptyPaperMap(NOTEBOOKS_INVOICES_OFFSET_TYPES.map((p) => p.id)),
  };
}

export function defaultNBBConfig() {
  return {
    coverDigitalSheetPrices: nbbSheetPriceMap(NBB_COVER_PAPERS, true) as Record<
      string,
      { single: number; double: number }
    >,
    innerDigitalSheetPrices: nbbSheetPriceMap(NBB_COVER_PAPERS, true) as Record<
      string,
      { single: number; double: number }
    >,
    coverLaminationPrices: { one_side: 0, double_side: 0 },
    inkPaperSheetPrices70x100: nbbSheetPriceMap(NBB_INK_PAPERS) as Record<string, number>,
    inkPrintingRates: Object.fromEntries(NBB_INK_RATE_KEYS.map((k) => [k.id, 0])),
    finishingBasePrices20x30: Object.fromEntries(
      NBB_FINISHING_TYPES.map((f) => [f.id, 0])
    ),
    cartonCostPerNotebook: { "20x30": 0, "15x20": 0, "10x15": 0 },
    profitTiers: [
      { min: 0, max: 50, percent: 35 },
      { min: 50, max: 200, percent: 30 },
      { min: 200, max: 500, percent: 25 },
      { min: 500, max: null, percent: 20 },
    ],
  };
}

/** Seed docs for Stamps sell/cost collections (all default sizes). */
export function buildDefaultStampPricingDocs(mode: "sell" | "cost") {
  const docs: Array<{ docId: string; data: Record<string, unknown> }> = [];

  docs.push({
    docId: "Stamps_cliche",
    data: {
      categoryId: "Stamps",
      band: "cliche_only",
      ...(mode === "sell"
        ? { sellPricePerCm2: 0.015 }
        : { costPricePerCm2: 0.015 }),
      currency: "EGP",
    },
  });

  for (const band of STAMP_BANDS) {
    if (band.id === "cliche_only") continue;

    docs.push({
      docId: stampSerialDocId(band.id),
      data: {
        categoryId: "Stamps",
        band: band.id,
        type: "serial_addon",
        ...(mode === "sell"
          ? { sellSerialAddonPrice: 0 }
          : { costSerialAddonPrice: 0 }),
        currency: "EGP",
      },
    });

    for (const size of STAMP_DEFAULT_SIZES[band.id] || []) {
      const base = {
        categoryId: "Stamps",
        band: band.id,
        sizeId: size.sizeId,
        productName: size.productName,
        productNameAr: size.productNameAr,
        currency: "EGP",
      };
      if (band.id === "automatic_machine") {
        docs.push({
          docId: stampDocId(band.id, size.sizeId),
          data: {
            ...base,
            ...(mode === "sell"
              ? {
                  sellPriceMachineOnly: 0,
                  sellPriceMachineStamp: 0,
                  sellInkPrices: { black: 0, red: 0, green: 0 },
                }
              : {
                  costPriceMachineOnly: 0,
                  costPriceMachineStamp: 0,
                  costInkPrices: { black: 0, red: 0, green: 0 },
                }),
          },
        });
      } else {
        docs.push({
          docId: stampDocId(band.id, size.sizeId),
          data: {
            ...base,
            ...(mode === "sell"
              ? { sellPriceHandleOnly: 0, sellPriceHandleStamp: 0 }
              : { costPriceHandleOnly: 0, costPriceHandleStamp: 0 }),
          },
        });
      }
    }
  }

  return docs;
}

export const LEGACY_DEFAULT_CONFIGS: Array<{
  collection: string;
  docId: string;
  categoryId: string;
  data: Record<string, unknown>;
}> = [
  {
    collection: "dafater_prices_cost",
    docId: "default",
    categoryId: "dafater",
    data: defaultDafaterCostConfig(),
  },
  {
    collection: "dafater_prices_sell",
    docId: "default",
    categoryId: "dafater",
    data: defaultDafaterSellConfig(),
  },
  {
    collection: "notebooks_sell_prices",
    docId: "default",
    categoryId: "notebooks_invoices",
    data: defaultNotebooksInvoicesSellConfig(),
  },
  {
    collection: "notebooks_cost_prices",
    docId: "default",
    categoryId: "notebooks_invoices",
    data: defaultNotebooksInvoicesCostConfig(),
  },
  {
    collection: "notebooks_books_booklets_prices",
    docId: "default",
    categoryId: "notebooks_books_booklets",
    data: defaultNBBConfig(),
  },
  ...buildDefaultStampPricingDocs("sell").map((d) => ({
    collection: "product_prices_sell",
    categoryId: "Stamps",
    ...d,
  })),
  ...buildDefaultStampPricingDocs("cost").map((d) => ({
    collection: "product_prices_cost",
    categoryId: "Stamps",
    ...d,
  })),
  ...ENVELOPE_PRODUCTS.map((p) => ({
    collection: "envelopes_prices_sell",
    docId: p.id,
    categoryId: "envelopes",
    data: {
      productId: p.id,
      quantityTiers: Object.fromEntries(ENVELOPE_QUANTITY_TIERS.map((t) => [String(t), 0])),
      platePricePerColor: ENVELOPE_PLATE_PRICE_DEFAULT,
      inkjetPricePerSheetOneColor: 0,
      inkjetPricePerSheetFullColor: 0,
      currency: "EGP",
    },
  })),
];
