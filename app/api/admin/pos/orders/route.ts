import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      branchId,
      customerName,
      customerPhone,
      orderType,
      items,
      notes,
    } = body;

    // Branch authorization check
    let targetBranchId = branchId;
    if (session.user.role === "branch_staff") {
      if (!session.user.branchId) {
        return NextResponse.json(
          { error: "Staff user has no assigned branch" },
          { status: 400 }
        );
      }
      targetBranchId = session.user.branchId;
    }

    if (!targetBranchId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing branch selection or empty items" },
        { status: 400 }
      );
    }

    const branch = await prisma.branch.findUnique({
      where: { id: targetBranchId },
    });

    if (!branch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 400 });
    }

    // Calculate subtotal
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.unitPrice * item.qty,
      0
    );

    // POS sales have 0 delivery fee
    const deliveryFee = 0;
    const total = subtotal + deliveryFee;

    // Generate unique order number
    let orderNumber = `SS-${Math.floor(1000 + Math.random() * 9000)}`;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const existing = await prisma.order.findUnique({ where: { orderNumber } });
      if (!existing) {
        isUnique = true;
      } else {
        orderNumber = `SS-${Math.floor(1000 + Math.random() * 9000)}`;
        attempts++;
      }
    }

    // Default POS order status to preparing (ready for kitchen)
    const initialStatus = "preparing";
    const validOrderType = ["dine_in", "takeaway", "phone"].includes(orderType)
      ? orderType
      : "takeaway";

    const newOrder = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber,
          branchId: targetBranchId,
          customerName: customerName?.trim() || "Walk-in",
          customerPhone: customerPhone?.trim() || "N/A",
          customerAddress: null,
          customerLat: null,
          customerLng: null,
          notes: notes || null,
          orderType: validOrderType as any,
          source: "pos" as any,
          subtotal,
          deliveryFee,
          total,
          status: initialStatus as any,
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
              status: initialStatus as any,
            },
          },
        } as any,
        include: {
          items: true,
          branch: true,
        },
      });

      return created;
    });

    return NextResponse.json({
      success: true,
      order: newOrder,
    });
  } catch (error: any) {
    console.error("Error creating POS order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create POS order" },
      { status: 500 }
    );
  }
}
