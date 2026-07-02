import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [ordersCount, pendingOrders, productsCount, categoriesCount, recentOrders, totalRevenue] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "pending" } }),
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
    ]);

  return NextResponse.json({
    ordersCount,
    pendingOrders,
    productsCount,
    categoriesCount,
    recentOrders,
    totalRevenue: totalRevenue._sum.totalAmount || 0,
  });
}
