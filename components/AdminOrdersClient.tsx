"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface Branch {
  id: string;
  name: string;
}

interface OrderItem {
  id: string;
  nameSnapshot: string;
  qty: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  orderType: string;
  source?: string;
  total: number;
  status: string;
  createdAt: string;
  branch: Branch;
  items: OrderItem[];
}

interface AdminOrdersClientProps {
  initialOrders: Order[];
  branches: Branch[];
  userRole: "owner" | "branch_staff";
  userBranchId?: string | null;
  userEmail: string;
}

const STATUS_OPTIONS = [
  { id: "all", label: "All Statuses" },
  { id: "placed", label: "Placed" },
  { id: "confirmed", label: "Confirmed" },
  { id: "preparing", label: "Preparing" },
  { id: "out_for_delivery", label: "Out for Delivery" },
  { id: "ready_for_pickup", label: "Ready for Pickup" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

const SOURCE_OPTIONS = [
  { id: "all", label: "All Sources" },
  { id: "website", label: "🌐 Website" },
  { id: "pos", label: "🖥️ POS Counter" },
];

export default function AdminOrdersClient({
  initialOrders,
  branches,
  userRole,
  userBranchId,
  userEmail,
}: AdminOrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    userRole === "branch_staff" ? userBranchId || "all" : "all"
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      setIsRefreshing(true);
      const query = new URLSearchParams();
      if (selectedStatus !== "all") query.set("status", selectedStatus);
      if (selectedSource !== "all") query.set("source", selectedSource);
      if (userRole === "owner" && selectedBranchId !== "all") {
        query.set("branchId", selectedBranchId);
      }

      const res = await fetch(`/api/admin/orders?${query.toString()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.orders) {
          setOrders(data.orders);
        }
      }
    } catch (err) {
      console.error("Failed to refresh admin orders:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Poll every 15 seconds & on filter change
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [selectedStatus, selectedSource, selectedBranchId]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "placed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/40";
      case "confirmed":
        return "bg-teal-500/20 text-teal-300 border-teal-500/40";
      case "preparing":
        return "bg-orange/20 text-orange border-orange/40";
      case "out_for_delivery":
      case "ready_for_pickup":
        return "bg-purple-500/20 text-purple-300 border-purple-500/40";
      case "delivered":
        return "bg-green-500/20 text-green-400 border-green-500/40";
      case "cancelled":
        return "bg-red/20 text-red border-red/40";
      default:
        return "bg-cream/20 text-cream border-cream/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-ink/60 border border-cream/15 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="font-anton text-3xl text-cream uppercase tracking-wide">
              Orders Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-bold tracking-wider bg-orange/20 text-orange border border-orange/30">
              {userRole === "owner" ? "Owner View" : "Staff View"}
            </span>
          </div>
          <p className="font-work text-xs text-cream/70">
            Logged in as <strong className="text-cream">{userEmail}</strong> • Auto-refreshes every 15s
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={fetchOrders}
            disabled={isRefreshing}
            className="px-4 py-2 bg-cream/10 hover:bg-cream/20 text-cream font-mono text-xs rounded-xl border border-cream/20 transition-all flex items-center gap-2"
          >
            <span className={isRefreshing ? "animate-spin" : ""}>🔄</span>
            <span>{isRefreshing ? "Syncing..." : "Refresh Queue"}</span>
          </button>

          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="px-4 py-2 bg-red/20 hover:bg-red/30 text-red font-anton text-xs uppercase tracking-wider rounded-xl border border-red/30 transition-all"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-ink/40 border border-cream/15 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
        {/* Status Filter */}
        <div className="space-y-1">
          <label className="font-anton text-xs text-cream/80 uppercase tracking-wider block">
            Filter by Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2.5 bg-ink border border-cream/20 rounded-xl text-cream font-work text-xs focus:outline-none focus:border-orange"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id} className="bg-ink text-cream">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Source Filter */}
        <div className="space-y-1">
          <label className="font-anton text-xs text-cream/80 uppercase tracking-wider block">
            Filter by Source
          </label>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="w-full px-3 py-2.5 bg-ink border border-cream/20 rounded-xl text-cream font-work text-xs focus:outline-none focus:border-orange"
          >
            {SOURCE_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id} className="bg-ink text-cream">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Branch Filter */}
        <div className="space-y-1">
          <label className="font-anton text-xs text-cream/80 uppercase tracking-wider block">
            Filter by Branch
          </label>
          {userRole === "owner" ? (
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="w-full px-3 py-2.5 bg-ink border border-cream/20 rounded-xl text-cream font-work text-xs focus:outline-none focus:border-orange"
            >
              <option value="all" className="bg-ink text-cream">
                All Branches
              </option>
              {branches.map((b) => (
                <option key={b.id} value={b.id} className="bg-ink text-cream">
                  {b.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="px-3 py-2.5 bg-ink/70 border border-cream/15 rounded-xl text-cream font-work text-xs">
              📍 {branches.find((b) => b.id === userBranchId)?.name || "Your Branch"} (Locked)
            </div>
          )}
        </div>

        <div className="flex items-center justify-end text-right">
          <span className="font-mono text-xs text-cream/60">
            Total Orders Found: <strong className="text-orange font-anton text-lg">{orders.length}</strong>
          </span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-ink/60 border border-cream/15 rounded-3xl overflow-hidden shadow-2xl">
        {orders.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <span className="text-5xl">📦</span>
            <h3 className="font-anton text-2xl text-cream uppercase">
              No orders found
            </h3>
            <p className="font-work text-xs text-cream/60 max-w-sm mx-auto">
              There are no orders matching your selected filters right now.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-work text-xs">
              <thead className="bg-ink border-b border-cream/15 font-anton text-cream/70 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-4 px-5">Order #</th>
                  <th className="py-4 px-5">Source</th>
                  <th className="py-4 px-5">Branch</th>
                  <th className="py-4 px-5">Customer</th>
                  <th className="py-4 px-5">Type</th>
                  <th className="py-4 px-5">Total</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5">Created At</th>
                  <th className="py-4 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream/10">
                {orders.map((o) => {
                  const createdDate = new Date(o.createdAt);
                  const formattedTime = createdDate.toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  const isPos = o.source === "pos";

                  return (
                    <tr
                      key={o.id}
                      className="hover:bg-cream/5 transition-colors group"
                    >
                      <td className="py-4 px-5 font-mono font-bold text-orange">
                        #{o.orderNumber}
                      </td>
                      <td className="py-4 px-5 font-mono">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] uppercase font-bold border ${
                            isPos
                              ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                              : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                          }`}
                        >
                          {isPos ? "🖥️ POS" : "🌐 Web"}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-medium text-cream">
                        {o.branch?.name}
                      </td>
                      <td className="py-4 px-5 space-y-0.5">
                        <div className="font-bold text-cream">{o.customerName}</div>
                        <div className="font-mono text-[11px] text-cream/60">
                          {o.customerPhone}
                        </div>
                      </td>
                      <td className="py-4 px-5 font-mono capitalize text-cream/80">
                        {o.orderType === "delivery" ? "🛵 Delivery" : "🛍️ Pickup"}
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-cream">
                        Rs. {o.total.toLocaleString()}
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`inline-block px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(
                            o.status
                          )}`}
                        >
                          {o.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono text-cream/60">
                        {formattedTime}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="inline-block px-3.5 py-1.5 bg-orange text-ink hover:bg-orange/90 font-anton text-xs uppercase tracking-wider rounded-lg shadow transition-all"
                        >
                          Manage →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
