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
    const status = searchParams.get("status");
    const source = searchParams.get("source");
    const requestedBranchId = searchParams.get("branchId");

    const where: any = {};

    // Branch scoping
    if (session.user.role === "branch_staff") {
      if (!session.user.branchId) {
        return NextResponse.json(
          { error: "Branch staff user has no associated branch" },
          { status: 400 }
        );
      }
      where.branchId = session.user.branchId;
    } else if (requestedBranchId && requestedBranchId !== "all") {
      where.branchId = requestedBranchId;
    }

    // Status filtering
    if (status && status !== "all") {
      where.status = status;
    }

    // Source filtering (website vs pos)
    if (source && source !== "all") {
      where.source = source;
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error: any) {
    console.error("Error fetching admin orders:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
