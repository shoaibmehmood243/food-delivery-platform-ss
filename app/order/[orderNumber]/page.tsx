import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { OrderTrackingClient } from "@/components/OrderTrackingClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Order Tracking — Seven Sides",
  description: "Track your Seven Sides order status live.",
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: { orderNumber: string };
}) {
  const { orderNumber } = params;

  // Fetch branches for Header modal
  const branches = await prisma.branch.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  // Fetch target order
  const orderData = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      branch: true,
    },
  });

  if (!orderData) {
    return (
      <div className="min-h-screen bg-teal-deep text-cream flex flex-col font-work">
        <Header initialBranches={branches} />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-ink/70 border border-cream/20 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
            <span className="text-6xl">🔍</span>
            <h1 className="font-anton text-3xl text-cream uppercase">
              Order Not Found
            </h1>
            <p className="font-work text-sm text-cream/70">
              We couldn't find an order with reference number{" "}
              <strong className="text-orange font-mono">#{orderNumber}</strong>.
            </p>
            <Link
              href="/menu"
              className="inline-block px-8 py-3 bg-orange text-ink font-anton text-sm uppercase tracking-wider rounded-xl shadow-lg hover:bg-orange/90 transition-colors"
            >
              Browse Menu
            </Link>
          </div>
        </main>
        <Footer branches={branches} />
      </div>
    );
  }

  // Serialize dates for Client Component safety
  const serializedOrder = {
    ...orderData,
    createdAt: orderData.createdAt.toISOString(),
    updatedAt: orderData.updatedAt.toISOString(),
    estimatedReadyAt: orderData.estimatedReadyAt
      ? orderData.estimatedReadyAt.toISOString()
      : null,
  };

  return (
    <div className="min-h-screen bg-teal-deep text-cream flex flex-col font-work selection:bg-orange selection:text-ink">
      <Header initialBranches={branches} />

      <main className="flex-1 py-6">
        <OrderTrackingClient initialOrder={serializedOrder} />
      </main>

      <Footer branches={branches} />
    </div>
  );
}
