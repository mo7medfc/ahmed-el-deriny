/**
 * Merge PDF selling prices into prisma/firestore-export.json (sell only).
 * Does not touch cost collections.
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { PDF_SELL_PRICES, SQM_CATEGORIES } from "./pdf-sell-prices.mjs";

const root = process.cwd();
const path = join(root, "prisma", "firestore-export.json");
const data = JSON.parse(readFileSync(path, "utf8"));

if (!data.collections) data.collections = {};
if (!Array.isArray(data.collections.product_prices_sell)) {
  data.collections.product_prices_sell = [];
}

const sell = data.collections.product_prices_sell;
const byId = new Map(sell.map((d) => [d.docId, d]));
const now = new Date().toISOString();
let updated = 0;
let created = 0;

for (const [docId, price] of Object.entries(PDF_SELL_PRICES)) {
  const categoryId = docId.includes("_") ? docId.slice(0, docId.indexOf("_")) : docId;
  const productId = docId.includes("_") ? docId.slice(docId.indexOf("_") + 1) : "config";
  const isSqm = SQM_CATEGORIES.has(categoryId);

  const payload = {
    categoryId,
    productId: productId === "config" ? undefined : productId,
    currency: "EGP",
    updatedAt: now,
    ...(isSqm
      ? { pricePerSquareMeter: price, sellingPrice: price }
      : { sellingPrice: price }),
  };

  // clean undefined
  Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

  const existing = byId.get(docId);
  if (existing) {
    existing.data = {
      ...existing.data,
      ...payload,
      // never copy cost fields into sell
    };
    delete existing.data.costPrice;
    delete existing.data.costPerSquareMeter;
    delete existing.data.productionCost;
    updated++;
  } else {
    const doc = { docId, data: payload };
    sell.push(doc);
    byId.set(docId, doc);
    created++;
  }
}

writeFileSync(path, JSON.stringify(data, null, 2), "utf8");
console.log(`✓ PDF sell prices merged — updated ${updated}, created ${created}`);
console.log(`✓ Total sell docs: ${sell.length}`);
