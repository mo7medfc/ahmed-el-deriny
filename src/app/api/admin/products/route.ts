import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { allowedCategoryFilter } from "@/lib/storefront-categories";
async function requireAdmin() {
  const adminId = await getAdminSession();
  if (!adminId) return null;
  return prisma.admin.findUnique({ where: { id: adminId } });
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const products = await prisma.product.findMany({
    where: { category: allowedCategoryFilter },
    include: { category: true, options: true },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await request.json();
  const product = await prisma.product.create({ data });
  return NextResponse.json(product);
}

export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, ...data } = await request.json();
  const product = await prisma.product.update({ where: { id }, data });
  return NextResponse.json(product);
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
