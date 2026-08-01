import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      branchId,
      orderType,
      customerName,
      customerPhone,
      customerAddress,
      customerLat,
      customerLng,
      notes,
      items,
    } = body;

    // Basic Validation
    if (!branchId || !customerName || !customerPhone || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields or empty cart" },
        { status: 400 }
      );
    }

    if (orderType === "delivery" && !customerAddress) {
      return NextResponse.json(
        { error: "Delivery address is required for delivery orders" },
        { status: 400 }
      );
    }

    // Fetch Branch for fee verification
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      return NextResponse.json({ error: "Invalid branch selected" }, { status: 400 });
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.unitPrice * item.qty,
      0
    );
    const deliveryFee = orderType === "delivery" ? branch.deliveryFee : 0;
    const total = subtotal + deliveryFee;

    // Generate unique SS-XXXX order number
    let orderNumber = `SS-${Math.floor(1000 + Math.random() * 9000)}`;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const existing = await prisma.order.findUnique({
        where: { orderNumber },
      });
      if (!existing) {
        isUnique = true;
      } else {
        orderNumber = `SS-${Math.floor(1000 + Math.random() * 9000)}`;
        attempts++;
      }
    }

    // Create Order with OrderItems and OrderStatusHistory in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          branchId,
          customerName,
          customerPhone,
          customerAddress: orderType === "delivery" ? customerAddress : null,
          customerLat: orderType === "delivery" && customerLat ? parseFloat(customerLat) : null,
          customerLng: orderType === "delivery" && customerLng ? parseFloat(customerLng) : null,
          notes: notes || null,
          orderType: orderType === "delivery" ? "delivery" : "pickup",
          subtotal,
          deliveryFee,
          total,
          status: "placed",
          items: {
            create: items.map((item: any) => ({
              menuItemId: item.menuItemId,
              nameSnapshot: item.name,
              unitPriceSnapshot: item.unitPrice,
              qty: item.qty,
              selectedHeat: item.selectedHeat || null,
              selectedFlavor: item.selectedFlavor || null,
              selectedAddons: item.selectedAddons || null,
            })),
          },
          statusHistory: {
            create: {
              status: "placed",
            },
          },
        },
        include: {
          items: true,
          branch: true,
        },
      });

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
    });
  } catch (error: any) {
    console.error("Failed to create order:", error);
    return NextResponse.json(
      { error: error.message || "Server error while creating order" },
      { status: 500 }
    );
  }
}
