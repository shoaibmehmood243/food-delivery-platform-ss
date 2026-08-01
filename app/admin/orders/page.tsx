import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import AdminHeader from "@/components/AdminHeader";
import AdminOrdersClient from "@/components/AdminOrdersClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Admin Orders Dashboard — Seven Sides",
};

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/admin/login");
  }

  const { role, branchId, email } = session.user;

  // Fetch branches
  const branches = await prisma.branch.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const staffBranch = branchId
    ? await prisma.branch.findUnique({ where: { id: branchId } })
    : null;

  // Query scoping
  const where: any = {};
  if (role === "branch_staff" && branchId) {
    where.branchId = branchId;
  }

  const initialOrdersData = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      branch: {
        select: { id: true, name: true },
      },
      items: true,
    },
  });

  const serializedOrders = initialOrdersData.map((o) => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    estimatedReadyAt: o.estimatedReadyAt ? o.estimatedReadyAt.toISOString() : null,
  }));

  return (
    <div className="min-h-screen bg-teal-deep text-cream font-work selection:bg-orange selection:text-ink">
      <AdminHeader
        userEmail={email}
        userRole={role}
        branchName={staffBranch?.name}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pb-16">
        <AdminOrdersClient
          initialOrders={serializedOrders}
          branches={branches}
          userRole={role}
          userBranchId={branchId}
          userEmail={email}
        />
      </main>
    </div>
  );
}
