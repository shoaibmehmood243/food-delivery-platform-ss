import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import AdminOrderDetailClient from "@/components/AdminOrderDetailClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Manage Order — Seven Sides Admin",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/admin/login");
  }

  const { id } = params;
  const { role, branchId } = session.user;

  const orderData = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      branch: true,
      statusHistory: {
        orderBy: { changedAt: "asc" },
      },
    },
  });

  if (!orderData) {
    return (
      <div className="min-h-screen bg-teal-deep text-cream flex items-center justify-center p-8 font-work">
        <div className="max-w-md w-full bg-ink/80 border border-cream/20 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <span className="text-6xl">🔍</span>
          <h1 className="font-anton text-3xl text-cream uppercase">
            Order Not Found
          </h1>
          <p className="font-work text-sm text-cream/70">
            The requested order ID does not exist in the database.
          </p>
          <Link
            href="/admin/orders"
            className="inline-block px-8 py-3 bg-orange text-ink font-anton text-sm uppercase tracking-wider rounded-xl shadow-lg"
          >
            ← Return to Orders Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Branch scoping permission check for branch staff
  if (role === "branch_staff" && orderData.branchId !== branchId) {
    return (
      <div className="min-h-screen bg-teal-deep text-cream flex items-center justify-center p-8 font-work">
        <div className="max-w-md w-full bg-red/20 border-2 border-red rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <span className="text-6xl">⛔</span>
          <h1 className="font-anton text-3xl text-red uppercase">
            Access Denied (403)
          </h1>
          <p className="font-work text-sm text-cream/80">
            You do not have permission to view or edit orders belonging to the{" "}
            <strong className="text-orange">{orderData.branch.name}</strong> branch.
          </p>
          <Link
            href="/admin/orders"
            className="inline-block px-8 py-3 bg-cream text-ink font-anton text-sm uppercase tracking-wider rounded-xl shadow-lg"
          >
            ← Back to My Branch Queue
          </Link>
        </div>
      </div>
    );
  }

  // Serialize dates for Client Component
  const serializedOrder = {
    ...orderData,
    createdAt: orderData.createdAt.toISOString(),
    updatedAt: orderData.updatedAt.toISOString(),
    estimatedReadyAt: orderData.estimatedReadyAt
      ? orderData.estimatedReadyAt.toISOString()
      : null,
    statusHistory: orderData.statusHistory.map((h) => ({
      ...h,
      changedAt: h.changedAt.toISOString(),
    })),
  };

  return (
    <div className="min-h-screen bg-teal-deep text-cream p-4 sm:p-8 font-work selection:bg-orange selection:text-ink">
      <AdminOrderDetailClient
        initialOrder={serializedOrder}
        userRole={role}
        userBranchId={branchId}
      />
    </div>
  );
}
