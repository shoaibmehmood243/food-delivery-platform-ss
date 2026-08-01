"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface AdminHeaderProps {
  userEmail: string;
  userRole: "owner" | "branch_staff";
  branchName?: string | null;
}

export default function AdminHeader({
  userEmail,
  userRole,
  branchName,
}: AdminHeaderProps) {
  const pathname = usePathname();

  const isTabActive = (path: string) => {
    if (path === "/admin/orders" && pathname?.startsWith("/admin/orders")) return true;
    return pathname === path;
  };

  return (
    <header className="bg-ink/80 border-b border-cream/15 px-4 sm:px-8 py-4 mb-8 backdrop-blur-md sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Tabs */}
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
          <Link href="/admin/orders" className="flex items-center gap-2 group">
            <span className="font-anton text-2xl text-cream tracking-wide uppercase group-hover:text-orange transition-colors">
              Seven Sides Admin
            </span>
          </Link>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-2 bg-ink p-1 rounded-xl border border-cream/10">
            <Link
              href="/admin/orders"
              className={`px-4 py-2 rounded-lg font-anton text-xs uppercase tracking-wider transition-all ${
                isTabActive("/admin/orders")
                  ? "bg-orange text-ink shadow-md"
                  : "text-cream/70 hover:text-cream hover:bg-cream/5"
              }`}
            >
              📋 Orders Queue
            </Link>

            <Link
              href="/admin/pos"
              className={`px-4 py-2 rounded-lg font-anton text-xs uppercase tracking-wider transition-all ${
                isTabActive("/admin/pos")
                  ? "bg-orange text-ink shadow-md"
                  : "text-cream/70 hover:text-cream hover:bg-cream/5"
              }`}
            >
              🛒 POS Counter
            </Link>

            <Link
              href="/admin/pos/summary"
              className={`px-4 py-2 rounded-lg font-anton text-xs uppercase tracking-wider transition-all ${
                isTabActive("/admin/pos/summary")
                  ? "bg-orange text-ink shadow-md"
                  : "text-cream/70 hover:text-cream hover:bg-cream/5"
              }`}
            >
              📊 Shift Summary
            </Link>

            {userRole === "owner" && (
              <>
                <Link
                  href="/admin/menu"
                  className={`px-4 py-2 rounded-lg font-anton text-xs uppercase tracking-wider transition-all ${
                    isTabActive("/admin/menu")
                      ? "bg-orange text-ink shadow-md"
                      : "text-cream/70 hover:text-cream hover:bg-cream/5"
                  }`}
                >
                  🍔 Menu Management
                </Link>

                <Link
                  href="/admin/branches"
                  className={`px-4 py-2 rounded-lg font-anton text-xs uppercase tracking-wider transition-all ${
                    isTabActive("/admin/branches")
                      ? "bg-orange text-ink shadow-md"
                      : "text-cream/70 hover:text-cream hover:bg-cream/5"
                  }`}
                >
                  📍 Branches
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="text-right font-work text-xs">
            <div className="flex items-center gap-2 justify-end">
              <span className="font-bold text-cream">{userEmail}</span>
              <span className="px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold tracking-wider bg-orange/20 text-orange border border-orange/30">
                {userRole === "owner" ? "Owner" : "Staff"}
              </span>
            </div>
            {branchName && (
              <p className="font-mono text-[11px] text-cream/60">
                Branch: {branchName}
              </p>
            )}
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="px-3.5 py-2 bg-red/20 hover:bg-red/30 text-red font-anton text-xs uppercase tracking-wider rounded-xl border border-red/30 transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
