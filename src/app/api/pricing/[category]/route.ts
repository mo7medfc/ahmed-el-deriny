import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CATEGORY_PRICING_COLLECTIONS } from "@/lib/pricing/collections";

const PUBLIC_CATEGORIES = new Set([
  "Stamps",
  "dafater",
  "notebooks_books_booklets",
  "notebooks_invoices",
  "envelopes",
]);

async function loadDocs(collection: string) {
  const records = await prisma.pricingRecord.findMany({ where: { collection } });
  return Object.fromEntries(records.map((r) => [r.docId, JSON.parse(r.data)]));
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  const { category: categoryId } = await params;

  if (!PUBLIC_CATEGORIES.has(categoryId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (categoryId === "Stamps") {
    const sellRecords = await prisma.pricingRecord.findMany({
      where: {
        collection: "product_prices_sell",
        docId: { startsWith: "Stamps_" },
      },
    });
    return NextResponse.json({
      categoryId,
      sellByDoc: Object.fromEntries(sellRecords.map((r) => [r.docId, JSON.parse(r.data)])),
    });
  }

  if (categoryId === "dafater") {
    const [sellConfig, costConfig] = await Promise.all([
      loadDocs("dafater_prices_sell"),
      loadDocs("dafater_prices_cost"),
    ]);
    return NextResponse.json({ categoryId, sellConfig, costConfig });
  }

  if (categoryId === "notebooks_invoices") {
    const sellConfig = await loadDocs("notebooks_sell_prices");
    return NextResponse.json({ categoryId, sellConfig });
  }

  if (categoryId === "notebooks_books_booklets") {
    const config = await loadDocs("notebooks_books_booklets_prices");
    return NextResponse.json({ categoryId, config });
  }

  if (categoryId === "envelopes") {
    const sellByDoc = await loadDocs("envelopes_prices_sell");
    return NextResponse.json({ categoryId, sellByDoc });
  }

  const mapping = CATEGORY_PRICING_COLLECTIONS[categoryId];
  if (!mapping?.sell) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const sellByDoc = await loadDocs(mapping.sell);
  return NextResponse.json({ categoryId, sellByDoc });
}
