import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import AdminHeader from "@/components/AdminHeader";
import AdminPosClient from "@/components/AdminPosClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "POS Counter — Seven Sides Admin",
};

export default async function AdminPosPage() {
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

  // Fetch active categories and menu items
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, sortOrder: true },
  });

  const menuItems = await prisma.menuItem.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: {
      addonOptions: true,
    },
  });

  return (
    <div className="min-h-screen bg-teal-deep text-cream font-work selection:bg-orange selection:text-ink">
      <AdminHeader
        userEmail={email}
        userRole={role}
        branchName={staffBranch?.name}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pb-16">
        <AdminPosClient
          categories={categories}
          menuItems={menuItems}
          branches={branches}
          userRole={role}
          userBranchId={branchId}
        />
      </main>
    </div>
  );
}
