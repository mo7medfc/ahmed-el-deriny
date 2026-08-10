/**
 * Regenerates prisma/catalog-export.json and the selling prices inside
 * prisma/firestore-export.json from scripts/catalog-source.mjs.
 *
 * Shared pricing_config documents are preserved; every product price
 * collection is rewritten so the price list stays the single source of truth.
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { CATEGORIES } from "./catalog-source.mjs";

const root = process.cwd();
const catalogPath = join(root, "prisma", "catalog-export.json");
const firestorePath = join(root, "prisma", "firestore-export.json");

const PRICE_FIELD = {
  sqm: "pricePerSquareMeter",
  meter: "pricePerMeter",
  piece: "sellingPrice",
};

const now = new Date().toISOString();

const catalog = {
  categories: CATEGORIES.map((cat) => ({
    categoryId: cat.categoryId,
    slug: cat.slug,
    nameAr: cat.nameAr,
    nameEn: cat.nameEn,
    priceUnit: cat.priceUnit,
    pricingType: cat.pricingType,
    priceNoteAr: cat.priceNoteAr ?? null,
    priceNoteEn: cat.priceNoteEn ?? null,
    products: cat.products.map((p) => ({
      id: p.id,
      nameAr: p.nameAr,
      nameEn: p.nameEn,
      descriptionAr: p.descriptionAr ?? null,
      descriptionEn: p.descriptionEn ?? null,
      image: p.image ?? null,
      groupId: p.groupId ?? null,
      subCategoryId: null,
      hasLamination: false,
      widthCm: p.widthCm ?? null,
      heightCm: p.heightCm ?? null,
      featured: p.featured ?? false,
    })),
    groups: cat.groups.map((g) => ({
      ...g,
      products: cat.products.filter((p) => p.groupId === g.id).map((p) => p.id),
    })),
    addons: {},
    defaults: {},
  })),
};

const existing = JSON.parse(readFileSync(firestorePath, "utf8"));

const sellDocs = [];
for (const cat of CATEGORIES) {
  const field = PRICE_FIELD[cat.priceUnit] || "sellingPrice";
  for (const p of cat.products) {
    sellDocs.push({
      docId: `${cat.categoryId}_${p.id}`,
      data: {
        categoryId: cat.categoryId,
        productId: p.id,
        [field]: p.price,
        currency: "EGP",
        updatedAt: now,
      },
    });
  }
}

const firestore = {
  collections: {
    ...Object.fromEntries(Object.keys(existing.collections).map((name) => [name, []])),
    pricing_config: existing.collections.pricing_config || [],
    product_prices_sell: sellDocs,
    product_prices_cost: [],
  },
};

writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + "\n", "utf8");
writeFileSync(firestorePath, JSON.stringify(firestore, null, 2) + "\n", "utf8");

const productCount = CATEGORIES.reduce((sum, c) => sum + c.products.length, 0);
console.log(`✓ Catalog rebuilt — ${CATEGORIES.length} categories, ${productCount} products`);
