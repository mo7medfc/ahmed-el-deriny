/** Firestore collection names per category (legacy abdo gded). */
export const CATEGORY_PRICING_COLLECTIONS: Record<
  string,
  { sell?: string; cost?: string; config?: string }
> = {
  dafater: {
    sell: "dafater_prices_sell",
    cost: "dafater_prices_cost",
  },
  notebooks_invoices: {
    sell: "notebooks_sell_prices",
    cost: "notebooks_cost_prices",
  },
  notebooks_books_booklets: {
    config: "notebooks_books_booklets_prices",
  },
  envelopes: {
    sell: "envelopes_prices_sell",
    cost: "envelopes_prices_cost",
  },
  Stamps: {
    sell: "product_prices_sell",
    cost: "product_prices_cost",
  },
};

/** Map collection → category when doc has no categoryId (e.g. doc "default"). */
export const COLLECTION_TO_CATEGORY: Record<string, string> = {
  dafater_prices_sell: "dafater",
  dafater_prices_cost: "dafater",
  notebooks_sell_prices: "notebooks_invoices",
  notebooks_cost_prices: "notebooks_invoices",
  notebooks_books_booklets_prices: "notebooks_books_booklets",
  envelopes_prices_sell: "envelopes",
  envelopes_prices_cost: "envelopes",
};

export function resolvePricingCategoryId(
  collection: string,
  docId: string,
  data: Record<string, unknown>
): string | null {
  if (typeof data.categoryId === "string" && data.categoryId) {
    return data.categoryId;
  }
  if (COLLECTION_TO_CATEGORY[collection]) {
    return COLLECTION_TO_CATEGORY[collection];
  }
  const prefix = docId.split("_")[0];
  if (prefix === "Stamps") return "Stamps";
  return null;
}
