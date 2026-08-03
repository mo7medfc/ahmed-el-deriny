import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { join } from "path";
import {
  getCategoryMeta,
  getCostPriceFromData,
  getSellPriceFromData,
  inferPricingType,
  slugify,
} from "../src/lib/pricing/categories";
import { resolvePricingCategoryId } from "../src/lib/pricing/collections";
import { LEGACY_DEFAULT_CONFIGS } from "../src/lib/pricing/legacy-defaults";
import {
  ALLOWED_STOREFRONT_CATEGORIES,
  filterAllowedCatalogCategories,
} from "../src/lib/storefront-categories";

const prisma = new PrismaClient();

type CatalogExport = {
  categories: Array<{
    categoryId: string;
    slug: string;
    nameAr?: string | null;
    nameEn?: string | null;
    priceUnit?: string | null;
    pricingType?: string | null;
    products: Array<{
      id: string;
      nameAr: string;
      nameEn: string;
      descriptionAr?: string | null;
      descriptionEn?: string | null;
      groupId?: string | null;
      subCategoryId?: string | null;
      hasLamination?: boolean;
      widthCm?: number | null;
      heightCm?: number | null;
      featured?: boolean;
    }>;
    groups: Array<{ id: string; nameAr: string; nameEn: string; products?: string[] }>;
    addons: Record<string, unknown>;
    defaults: Record<string, unknown>;
  }>;
};

type FirestoreExport = {
  collections: Record<string, Array<{ docId: string; data: Record<string, unknown> }>>;
};

function loadJson<T>(file: string): T {
  return JSON.parse(readFileSync(join(process.cwd(), "prisma", file), "utf8")) as T;
}

function buildSellPriceMap(exportData: FirestoreExport) {
  const map = new Map<string, Record<string, unknown>>();
  for (const doc of exportData.collections.product_prices_sell || []) {
    map.set(doc.docId, doc.data);
  }
  return map;
}

function buildCostPriceMap(exportData: FirestoreExport) {
  const map = new Map<string, Record<string, unknown>>();
  for (const doc of exportData.collections.product_prices_cost || []) {
    map.set(doc.docId, doc.data);
  }
  return map;
}

async function main() {
  console.log("🌱 Importing full catalog + Firestore pricing...\n");

  const catalog = loadJson<CatalogExport>("catalog-export.json");
  const allowedCatalog = filterAllowedCatalogCategories(catalog.categories);
  const firestore = loadJson<FirestoreExport>("firestore-export.json");
  const sellMap = buildSellPriceMap(firestore);
  const costMap = buildCostPriceMap(firestore);

  const adminEmail = process.env.ADMIN_EMAIL || "admin@ahmedderiny.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";

  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      name: process.env.ADMIN_NAME || "مدير النظام",
    },
  });

  // Fresh import
  await prisma.productOption.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.pricingRecord.deleteMany();
  await prisma.category.deleteMany();

  const categoryIdToDbId = new Map<string, string>();
  let sortOrder = 0;

  for (const cat of allowedCatalog) {
    const meta = getCategoryMeta(cat.categoryId);
    sortOrder++;
    const created = await prisma.category.create({
      data: {
        slug: cat.slug || slugify(cat.categoryId),
        legacyId: cat.categoryId,
        nameAr: cat.nameAr || meta.nameAr,
        nameEn: cat.nameEn || meta.nameEn,
        icon: meta.icon,
        sortOrder: meta.sortOrder || sortOrder,
        pricingType: cat.pricingType || inferPricingType(cat.categoryId, meta.editorType),
      },
    });
    categoryIdToDbId.set(cat.categoryId, created.id);
  }

  // Import pricing records (allowed categories + shared config like stand_pricing)
  let pricingCount = 0;
  const allowedSet = new Set<string>(ALLOWED_STOREFRONT_CATEGORIES);
  const importedKeys = new Set<string>();

  for (const [collection, docs] of Object.entries(firestore.collections)) {
    for (const doc of docs) {
      const resolvedCat = resolvePricingCategoryId(collection, doc.docId, doc.data);
      const isSharedConfig = collection === "pricing_config";
      if (!isSharedConfig && resolvedCat && !allowedSet.has(resolvedCat)) continue;
      if (!isSharedConfig && !resolvedCat) {
        const prefix = doc.docId.split("_")[0];
        if (!allowedSet.has(prefix) && prefix !== "Stamps") continue;
      }

      await prisma.pricingRecord.create({
        data: {
          collection,
          docId: doc.docId,
          categoryId: resolvedCat || (doc.data.categoryId as string) || null,
          data: JSON.stringify(doc.data),
          updatedAt: doc.data.updatedAt ? new Date(String(doc.data.updatedAt)) : null,
        },
      });
      importedKeys.add(`${collection}::${doc.docId}`);
      pricingCount++;
    }
  }

  // Seed legacy default configs when Firestore export is empty (dafater, NBB, stamps matrix, etc.)
  for (const def of LEGACY_DEFAULT_CONFIGS) {
    const key = `${def.collection}::${def.docId}`;
    if (importedKeys.has(key)) continue;
    if (!allowedSet.has(def.categoryId)) continue;

    await prisma.pricingRecord.create({
      data: {
        collection: def.collection,
        docId: def.docId,
        categoryId: def.categoryId,
        data: JSON.stringify(def.data),
        updatedAt: new Date(),
      },
    });
    importedKeys.add(key);
    pricingCount++;
  }

  // Create products from catalog + attach Firestore prices
  let productCount = 0;
  for (const cat of allowedCatalog) {
    const categoryDbId = categoryIdToDbId.get(cat.categoryId);
    if (!categoryDbId) continue;
    const meta = getCategoryMeta(cat.categoryId);

    if (cat.products.length === 0) {
      // Single placeholder product for matrix/config categories
      if (["business_cards", "config", "dtf", "stamps", "nbb", "notebooks_invoices"].includes(meta.editorType)) {
        const docId = `${cat.categoryId}_config`;
        const sellData = sellMap.get(docId) || {};
        await prisma.product.create({
          data: {
            slug: slugify(`${cat.categoryId}-service`),
            legacyId: cat.categoryId,
            categoryId: categoryDbId,
            nameAr: meta.nameAr,
            nameEn: meta.nameEn,
            descriptionAr: `خدمة ${meta.nameAr} — احسب السعر حسب المواصفات`,
            descriptionEn: `${meta.nameEn} service with dynamic pricing`,
            pricingCategory: cat.categoryId,
            pricingType: inferPricingType(cat.categoryId, meta.editorType),
            basePrice: getSellPriceFromData(sellData),
            costPrice: getCostPriceFromData(costMap.get(docId) || {}),
            pricingData: JSON.stringify({ groups: cat.groups, addons: cat.addons, defaults: cat.defaults }),
            featured: ["Outdoor", "Indoor", "Stands", "Stamps", "DTF", "UVPrinting"].includes(cat.categoryId),
            sortOrder: 0,
          },
        });
        productCount++;
      }
      continue;
    }

    for (let i = 0; i < cat.products.length; i++) {
      const p = cat.products[i];
      const sellDocId = `${cat.categoryId}_${p.id}`;
      const sellData = sellMap.get(sellDocId) || {};
      const costData = costMap.get(sellDocId) || {};
      const basePrice = getSellPriceFromData(sellData);
      const costPrice = getCostPriceFromData(costData);

      const pricingType =
        cat.pricingType ||
        (meta.editorType === "sqm_groups"
          ? "per_sqm"
          : meta.editorType === "stands"
            ? "stands"
            : meta.editorType === "unit"
              ? "per_unit"
              : inferPricingType(cat.categoryId, meta.editorType));

      const nameAr = p.nameAr || p.nameEn || p.id;
      const nameEn = p.nameEn || p.nameAr || p.id;
      const categoryNameAr = cat.nameAr || meta.nameAr;
      const categoryNameEn = cat.nameEn || meta.nameEn;

      await prisma.product.create({
        data: {
          slug: slugify(`${cat.categoryId}-${p.id}`),
          legacyId: p.id,
          categoryId: categoryDbId,
          nameAr,
          nameEn,
          descriptionAr: p.descriptionAr || `${nameAr} — ${categoryNameAr}`,
          descriptionEn: p.descriptionEn || `${nameEn} — ${categoryNameEn}`,
          pricingCategory: cat.categoryId,
          pricingType,
          unit: cat.priceUnit || "cm",
          basePrice,
          costPrice,
          minWidth: p.widthCm || (pricingType === "per_sqm" ? 30 : 1),
          maxWidth: p.widthCm || (pricingType === "per_sqm" ? 500 : 999),
          minHeight: p.heightCm || (pricingType === "per_sqm" ? 30 : 1),
          maxHeight: p.heightCm || (pricingType === "per_sqm" ? 500 : 999),
          pricingData: JSON.stringify({
            groupId: p.groupId,
            subCategoryId: p.subCategoryId,
            hasLamination: p.hasLamination,
            widthCm: p.widthCm,
            heightCm: p.heightCm,
            sellDocId,
          }),
          featured: p.featured ?? (i < 2 && ["Outdoor", "Indoor", "Stands"].includes(cat.categoryId)),
          sortOrder: i,
        },
      });
      productCount++;
    }
  }

  console.log(`✅ Categories: ${allowedCatalog.length}`);
  console.log(`✅ Products: ${productCount}`);
  console.log(`✅ Pricing records: ${pricingCount}`);
  console.log(`📧 Admin: ${adminEmail}`);
  console.log(`🔑 Password: ${adminPassword}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
