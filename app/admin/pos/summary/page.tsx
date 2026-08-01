import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import AdminHeader from "@/components/AdminHeader";
import AdminPosSummaryClient from "@/components/AdminPosSummaryClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Shift Summary Report — Seven Sides Admin",
};

export default async function AdminPosSummaryPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/admin/login");
  }

  const { role, branchId, email } = session.user;

  // Fetch active branches
  const branches = await prisma.branch.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const staffBranch = branchId
    ? await prisma.branch.findUnique({ where: { id: branchId } })
    : null;

  // Initial Summary computation for today
  const todayStr = new Date().toISOString().split("T")[0];
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const where: any = {
    createdAt: {
      gte: startDate,
      lte: endDate,
    },
  };

  if (role === "branch_staff" && branchId) {
    where.branchId = branchId;
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: {
        include: {
          menuItem: {
            include: { category: true },
          },
        },
      },
    },
  });

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

  const initialSummary = {
    date: todayStr,
    totalOrdersCount,
    totalCashCollected,
    sourceBreakdown,
    orderTypeBreakdown,
    categorySales,
  };

  return (
    <div className="min-h-screen bg-teal-deep text-cream font-work selection:bg-orange selection:text-ink">
      <AdminHeader
        userEmail={email}
        userRole={role}
        branchName={staffBranch?.name}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pb-16">
        <AdminPosSummaryClient
          initialSummary={initialSummary}
          branches={branches}
          userRole={role}
          userBranchId={branchId}
        />
      </main>
    </div>
  );
}
