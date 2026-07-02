import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      customerNotes,
      locale,
      items,
      totalAmount,
    } = body;

    if (!customerName || !customerPhone || !items?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerPhone,
        customerEmail,
        customerNotes,
        locale: locale || "ar",
        totalAmount,
        status: "pending",
        items: {
          create: items.map((item: {
            productId: string;
            productName: string;
            width?: number;
            height?: number;
            quantity: number;
            selectedOptions?: string;
            unitPrice: number;
            totalPrice: number;
            designFile?: string;
            notes?: string;
          }) => ({
            productId: item.productId,
            productName: item.productName,
            width: item.width,
            height: item.height,
            quantity: item.quantity,
            selectedOptions: item.selectedOptions,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            designFile: item.designFile,
            notes: item.notes,
          })),
        },
      },
    });

    return NextResponse.json({ orderNumber: order.orderNumber, id: order.id });
  } catch (error) {
    console.error("Order error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
