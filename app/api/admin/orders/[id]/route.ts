import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { status, estimatedReadyAt } = body;

    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Role-based branch scoping check
    if (
      session.user.role === "branch_staff" &&
      existingOrder.branchId !== session.user.branchId
    ) {
      return NextResponse.json(
        { error: "Forbidden: You cannot update orders for other branches." },
        { status: 403 }
      );
    }

    const statusChanged = status && status !== existingOrder.status;

    // Transaction update
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id },
        data: {
          ...(status ? { status } : {}),
          ...(estimatedReadyAt !== undefined
            ? {
                estimatedReadyAt: estimatedReadyAt
                  ? new Date(estimatedReadyAt)
                  : null,
              }
            : {}),
        },
        include: {
          items: true,
          branch: true,
          statusHistory: {
            orderBy: { changedAt: "asc" },
          },
        },
      });

      if (statusChanged) {
        await tx.orderStatusHistory.create({
          data: {
            orderId: id,
            status: status as any,
          },
        });
      }

      return order;
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}
