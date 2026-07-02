import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { getCategoryMeta } from "@/lib/pricing/categories";
import { CATEGORY_PRICING_COLLECTIONS } from "@/lib/pricing/collections";

function loadCatalog() {
  return JSON.parse(
    readFileSync(join(process.cwd(), "prisma", "catalog-export.json"), "utf8")
  ) as {
    categories: Array<{
      categoryId: string;
      products: Array<{ id: string; nameAr: string; nameEn: string; groupId?: string | null }>;
      groups: Array<{ id: string; nameAr: string; products?: string[] }>;
      addons: Record<string, Array<{ id: string; nameAr: string; unit?: string }>>;
    }>;
  };
}

async function requireAdmin() {
  const adminId = await getAdminSession();
  if (!adminId) return null;
  return prisma.admin.findUnique({ where: { id: adminId } });
}

function getCatalogCategory(categoryId: string) {
  const catalogExport = loadCatalog();
  return catalogExport.categories.find((c) => c.categoryId === categoryId);
}

async function loadCustomDocs(categoryId: string) {
  const mapping = CATEGORY_PRICING_COLLECTIONS[categoryId];
  if (!mapping) return {};

  const collections = [mapping.sell, mapping.cost, mapping.config].filter(
    Boolean
  ) as string[];

  const records = await prisma.pricingRecord.findMany({
    where: { collection: { in: collections } },
  });

  const out: Record<string, Record<string, Record<string, unknown>>> = {};
  for (const r of records) {
    if (!out[r.collection]) out[r.collection] = {};
    out[r.collection][r.docId] = JSON.parse(r.data);
  }
  return out;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { category: categoryId } = await params;
  const catalog = getCatalogCategory(categoryId);
  const meta = getCategoryMeta(categoryId);

  const sellRecords = await prisma.pricingRecord.findMany({
    where: {
      collection: "product_prices_sell",
      docId: { startsWith: `${categoryId}_` },
    },
  });

  const costRecords = await prisma.pricingRecord.findMany({
    where: {
      collection: "product_prices_cost",
      docId: { startsWith: `${categoryId}_` },
    },
  });

  const configRecords = await prisma.pricingRecord.findMany({
    where: {
      collection: "pricing_config",
      OR: [
        { docId: "stand_pricing" },
        { docId: "seal_pricing" },
        { docId: "dtf_pricing" },
        { docId: "business_cards_config" },
        { docId: `${categoryId.toLowerCase()}_pricing` },
      ],
    },
  });

  const businessCardRecords =
    categoryId === "BusinessCard"
      ? await prisma.pricingRecord.findMany({
          where: { collection: "business_cards_prices_sell" },
        })
      : [];

  const sellMap = Object.fromEntries(
    sellRecords.map((r) => [r.docId, JSON.parse(r.data)])
  );
  const costMap = Object.fromEntries(
    costRecords.map((r) => [r.docId, JSON.parse(r.data)])
  );
  const configMap = Object.fromEntries(
    configRecords.map((r) => [r.docId, JSON.parse(r.data)])
  );

  // Stamps uses Stamps_* docIds in product_prices_* — load full category set
  if (categoryId === "Stamps") {
    const stampSell = await prisma.pricingRecord.findMany({
      where: { collection: "product_prices_sell", docId: { startsWith: "Stamps_" } },
    });
    const stampCost = await prisma.pricingRecord.findMany({
      where: { collection: "product_prices_cost", docId: { startsWith: "Stamps_" } },
    });
    for (const r of stampSell) sellMap[r.docId] = JSON.parse(r.data);
    for (const r of stampCost) costMap[r.docId] = JSON.parse(r.data);
  }

  const products = await prisma.product.findMany({
    where: { pricingCategory: categoryId },
    orderBy: { sortOrder: "asc" },
  });

  const customDocs = await loadCustomDocs(categoryId);

  return NextResponse.json({
    categoryId,
    meta,
    catalog: catalog || null,
    sellMap,
    costMap,
    configMap,
    customDocs,
    businessCardRecords: businessCardRecords.map((r) => ({
      docId: r.docId,
      data: JSON.parse(r.data),
    })),
    products: products.map((p) => ({
      id: p.id,
      legacyId: p.legacyId,
      nameAr: p.nameAr,
      basePrice: p.basePrice,
      costPrice: p.costPrice,
      pricingType: p.pricingType,
    })),
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { category: categoryId } = await params;
  const body = await request.json();
  const { updates } = body as {
    updates: Array<{
      collection: string;
      docId: string;
      data: Record<string, unknown>;
      productId?: string;
      basePrice?: number;
      costPrice?: number;
    }>;
  };

  if (!Array.isArray(updates)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  for (const update of updates) {
    const dataStr = JSON.stringify({
      ...update.data,
      categoryId: update.data.categoryId ?? categoryId,
      updatedAt: new Date().toISOString(),
    });

    await prisma.pricingRecord.upsert({
      where: {
        collection_docId: {
          collection: update.collection,
          docId: update.docId,
        },
      },
      create: {
        collection: update.collection,
        docId: update.docId,
        categoryId,
        data: dataStr,
        updatedAt: new Date(),
      },
      update: {
        data: dataStr,
        categoryId,
        updatedAt: new Date(),
      },
    });

    if (update.productId) {
      await prisma.product.updateMany({
        where: { pricingCategory: categoryId, legacyId: update.productId },
        data: {
          basePrice: update.basePrice ?? undefined,
          costPrice: update.costPrice ?? undefined,
        },
      });
    }
  }

  return NextResponse.json({ success: true, updated: updates.length });
}
