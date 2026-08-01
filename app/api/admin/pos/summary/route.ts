import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedBranchId = searchParams.get("branchId");
    const dateParam = searchParams.get("date"); // YYYY-MM-DD format or ISO

    let targetBranchId: string | undefined = undefined;
    if (session.user.role === "branch_staff") {
      targetBranchId = session.user.branchId || undefined;
    } else if (requestedBranchId && requestedBranchId !== "all") {
      targetBranchId = requestedBranchId;
    }

    // Determine date range (default to today)
    const baseDate = dateParam ? new Date(dateParam) : new Date();
    const startDate = new Date(baseDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(baseDate);
    endDate.setHours(23, 59, 59, 999);

    const where: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (targetBranchId) {
      where.branchId = targetBranchId;
    }

    // Fetch orders matching range
    const orders = await prisma.order.findMany({
      where,
      include: {
        branch: { select: { id: true, name: true } },
        items: {
          include: {
            menuItem: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    // Compute Metrics
    const activeOrders = orders.filter((o: any) => o.status !== "cancelled");
    const totalOrdersCount = activeOrders.length;
    const totalCashCollected = activeOrders.reduce((sum: number, o: any) => sum + o.total, 0);

    const sourceBreakdown = {
      website: activeOrders.filter((o: any) => o.source === "website").length,
      pos: activeOrders.filter((o: any) => o.source === "pos").length,
    };

    const orderTypeBreakdown = {
      delivery: activeOrders.filter((o: any) => (o.orderType as string) === "delivery").length,
      pickup: activeOrders.filter((o: any) => (o.orderType as string) === "pickup").length,
      dine_in: activeOrders.filter((o: any) => (o.orderType as string) === "dine_in").length,
      takeaway: activeOrders.filter((o: any) => (o.orderType as string) === "takeaway").length,
      phone: activeOrders.filter((o: any) => (o.orderType as string) === "phone").length,
    };

    // Category Sales Breakdown
    const categoryMap: { [catName: string]: { name: string; qty: number; revenue: number } } = {};

    activeOrders.forEach((o: any) => {
      o.items.forEach((item: any) => {
        const catName = item.menuItem?.category?.name || "General";
        if (!categoryMap[catName]) {
          categoryMap[catName] = { name: catName, qty: 0, revenue: 0 };
        }
        categoryMap[catName].qty += item.qty;
        categoryMap[catName].revenue += item.unitPriceSnapshot * item.qty;
      });
    });

    const categorySales = Object.values(categoryMap).sort((a, b) => b.qty - a.qty);

    return NextResponse.json({
      success: true,
      summary: {
        date: startDate.toISOString().split("T")[0],
        totalOrdersCount,
        totalCashCollected,
        sourceBreakdown,
        orderTypeBreakdown,
        categorySales,
      },
    });
  } catch (error: any) {
    console.error("Error generating shift summary:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate shift summary" },
      { status: 500 }
    );
  }
}
