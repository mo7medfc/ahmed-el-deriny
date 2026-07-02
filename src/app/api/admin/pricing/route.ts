import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { getCategoryMeta } from "@/lib/pricing/categories";
import { allowedCategoryFilter, filterAllowedCatalogCategories } from "@/lib/storefront-categories";
import { readFileSync } from "fs";
import { join } from "path";

function loadCatalog() {
  return JSON.parse(
    readFileSync(join(process.cwd(), "prisma", "catalog-export.json"), "utf8")
  ) as { categories: Array<{ categoryId: string; slug: string; productCount: number }> };
}

async function requireAdmin() {
  const adminId = await getAdminSession();
  if (!adminId) return null;
  return prisma.admin.findUnique({ where: { id: adminId } });
}

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const catalogExport = loadCatalog();
    const categories = filterAllowedCatalogCategories(catalogExport.categories).map((cat) => {
      const meta = getCategoryMeta(cat.categoryId);
      return {
        id: cat.categoryId,
        slug: cat.slug,
        nameAr: meta.nameAr,
        nameEn: meta.nameEn,
        icon: meta.icon,
        editorType: meta.editorType,
        productCount: cat.productCount,
        sortOrder: meta.sortOrder,
      };
    });

    categories.sort((a, b) => a.sortOrder - b.sortOrder);

    const recordCounts = await prisma.pricingRecord.groupBy({
      by: ["categoryId"],
      _count: { docId: true },
    });
    const countMap = Object.fromEntries(
      recordCounts.map((r) => [r.categoryId || "", r._count.docId])
    );

    return NextResponse.json(
      categories.map((c) => ({
        ...c,
        pricingRecords: countMap[c.id] || 0,
      }))
    );
  } catch (error) {
    console.error("Pricing API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
