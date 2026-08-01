import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const { orderNumber } = params;

    if (!orderNumber) {
      return NextResponse.json(
        { error: "Order number is required" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
        branch: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
          },
        },
        statusHistory: {
          orderBy: { changedAt: "asc" },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        order,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("Error fetching order status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch order details" },
      { status: 500 }
    );
  }
}
