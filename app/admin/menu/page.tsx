import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import AdminHeader from "@/components/AdminHeader";
import AdminMenuClient from "@/components/AdminMenuClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Menu Management — Seven Sides Admin",
};

export default async function AdminMenuPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/admin/login");
  }

  const { role, email } = session.user;

  // Owner-only security check
  if (role !== "owner") {
    return (
      <div className="min-h-screen bg-teal-deep text-cream flex items-center justify-center p-8 font-work">
        <div className="max-w-md w-full bg-red/20 border-2 border-red rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <span className="text-6xl">⛔</span>
          <h1 className="font-anton text-3xl text-red uppercase">
            Owner Access Required (403)
          </h1>
          <p className="font-work text-sm text-cream/80">
            Menu and category management is restricted to owner accounts only.
          </p>
          <Link
            href="/admin/orders"
            className="inline-block px-8 py-3 bg-cream text-ink font-anton text-sm uppercase tracking-wider rounded-xl shadow-lg"
          >
            ← Return to Orders Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const menuItems = await prisma.menuItem.findMany({
    orderBy: { name: "asc" },
    include: {
      category: true,
      addonOptions: true,
    },
  });

  return (
    <div className="min-h-screen bg-teal-deep text-cream font-work selection:bg-orange selection:text-ink">
      <AdminHeader userEmail={email} userRole={role} />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pb-16">
        <AdminMenuClient initialCategories={categories} initialItems={menuItems} />
      </main>
    </div>
  );
}
