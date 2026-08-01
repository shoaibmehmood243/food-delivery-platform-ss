"use client";

import React, { useState, useEffect } from "react";

interface Branch {
  id: string;
  name: string;
}

interface SummaryData {
  date: string;
  totalOrdersCount: number;
  totalCashCollected: number;
  sourceBreakdown: {
    website: number;
    pos: number;
  };
  orderTypeBreakdown: {
    delivery: number;
    pickup: number;
    dine_in: number;
    takeaway: number;
    phone: number;
  };
  categorySales: Array<{
    name: string;
    qty: number;
    revenue: number;
  }>;
}

interface AdminPosSummaryClientProps {
  initialSummary: SummaryData;
  branches: Branch[];
  userRole: "owner" | "branch_staff";
  userBranchId?: string | null;
}

export default function AdminPosSummaryClient({
  initialSummary,
  branches,
  userRole,
  userBranchId,
}: AdminPosSummaryClientProps) {
  const [summary, setSummary] = useState<SummaryData>(initialSummary);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    userRole === "branch_staff" ? userBranchId || "all" : "all"
  );
  
  // Today date YYYY-MM-DD
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (selectedDate) query.set("date", selectedDate);
      if (userRole === "owner" && selectedBranchId !== "all") {
        query.set("branchId", selectedBranchId);
      }

      const res = await fetch(`/api/admin/pos/summary?${query.toString()}`, {
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.summary) {
          setSummary(data.summary);
        }
      }
    } catch (err) {
      console.error("Failed to fetch shift summary:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [selectedBranchId, selectedDate]);

  return (
    <div className="space-y-8 text-left">
      {/* Header Bar */}
      <div className="bg-ink/60 border border-cream/15 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl">
        <div>
          <h1 className="font-anton text-3xl sm:text-4xl text-cream uppercase tracking-wide">
            📊 Shift Summary Report
          </h1>
          <p className="font-work text-xs text-cream/70 mt-1">
            Read-only breakdown of total sales, order sources, and category item counts.
          </p>
        </div>

        <button
          onClick={fetchSummary}
          disabled={loading}
          className="px-4 py-2.5 bg-cream/10 hover:bg-cream/20 text-cream font-mono text-xs rounded-xl border border-cream/20 transition-all flex items-center gap-2"
        >
          <span className={loading ? "animate-spin" : ""}>🔄</span>
          <span>{loading ? "Refreshing..." : "Refresh Report"}</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="bg-ink/40 border border-cream/15 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-center">
        {/* Date Selector */}
        <div className="space-y-1">
          <label className="font-anton text-xs text-cream/80 uppercase tracking-wider block">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 bg-ink border border-cream/20 rounded-xl text-cream font-mono text-xs focus:outline-none focus:border-orange"
          />
        </div>

        {/* Branch Selector */}
        <div className="space-y-1">
          <label className="font-anton text-xs text-cream/80 uppercase tracking-wider block">
            Select Branch
          </label>
          {userRole === "owner" ? (
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="w-full px-3 py-2 bg-ink border border-cream/20 rounded-xl text-cream font-work text-xs focus:outline-none focus:border-orange"
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
            <div className="px-3 py-2 bg-ink/70 border border-cream/15 rounded-xl text-cream font-work text-xs">
              📍 {branches.find((b) => b.id === userBranchId)?.name || "Your Branch"} (Locked)
            </div>
          )}
        </div>

        <div className="sm:col-span-2 lg:col-span-1 flex items-center justify-end text-right font-mono text-xs text-cream/60">
          Showing Data For: <strong className="text-orange font-bold ml-1">{summary.date}</strong>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Revenue */}
        <div className="bg-ink/60 border border-cream/15 rounded-3xl p-6 space-y-2 shadow-xl">
          <span className="font-mono text-xs text-cream/50 uppercase tracking-wider block">
            Total Revenue Collected
          </span>
          <h3 className="font-anton text-3xl sm:text-4xl text-orange">
            Rs. {summary.totalCashCollected.toLocaleString()}
          </h3>
          <p className="font-work text-[11px] text-cream/60">
            Across all order sources &amp; channels
          </p>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-ink/60 border border-cream/15 rounded-3xl p-6 space-y-2 shadow-xl">
          <span className="font-mono text-xs text-cream/50 uppercase tracking-wider block">
            Total Shift Orders
          </span>
          <h3 className="font-anton text-3xl sm:text-4xl text-cream">
            {summary.totalOrdersCount}
          </h3>
          <p className="font-work text-[11px] text-cream/60">
            Active orders (excluding cancelled)
          </p>
        </div>

        {/* Card 3: Source Split */}
        <div className="bg-ink/60 border border-cream/15 rounded-3xl p-6 space-y-2 shadow-xl">
          <span className="font-mono text-xs text-cream/50 uppercase tracking-wider block">
            Order Source Split
          </span>
          <div className="space-y-1 font-mono text-xs pt-1">
            <div className="flex justify-between">
              <span className="text-cream/80">🌐 Website:</span>
              <strong className="text-cream">{summary.sourceBreakdown.website}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-orange">🖥️ POS Counter:</span>
              <strong className="text-orange">{summary.sourceBreakdown.pos}</strong>
            </div>
          </div>
        </div>

        {/* Card 4: Order Type Split */}
        <div className="bg-ink/60 border border-cream/15 rounded-3xl p-6 space-y-2 shadow-xl">
          <span className="font-mono text-xs text-cream/50 uppercase tracking-wider block">
            Order Type Breakdown
          </span>
          <div className="space-y-1 font-mono text-[11px] pt-1 text-cream/80">
            <div className="flex justify-between">
              <span>🛵 Delivery:</span>
              <strong>{summary.orderTypeBreakdown.delivery}</strong>
            </div>
            <div className="flex justify-between">
              <span>🛍️ Pickup:</span>
              <strong>{summary.orderTypeBreakdown.pickup}</strong>
            </div>
            <div className="flex justify-between">
              <span>🍽️ Dine-in:</span>
              <strong className="text-orange">{summary.orderTypeBreakdown.dine_in}</strong>
            </div>
            <div className="flex justify-between">
              <span>🛍️ Takeaway:</span>
              <strong className="text-orange">{summary.orderTypeBreakdown.takeaway}</strong>
            </div>
            <div className="flex justify-between">
              <span>📞 Phone:</span>
              <strong>{summary.orderTypeBreakdown.phone}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Category Sales Breakdown Table */}
      <div className="bg-ink/60 border border-cream/15 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <h3 className="font-anton text-2xl text-cream uppercase tracking-wide border-b border-cream/10 pb-3">
          🍗 Items Sold by Category
        </h3>

        {summary.categorySales.length === 0 ? (
          <div className="py-8 text-center font-work text-xs text-cream/50">
            No sales recorded for this date and branch selection.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-work text-xs">
              <thead className="bg-ink border-b border-cream/15 font-anton text-cream/70 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Quantity Sold</th>
                  <th className="py-3 px-4 text-right">Category Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream/10">
                {summary.categorySales.map((cat, idx) => (
                  <tr key={idx} className="hover:bg-cream/5 transition-colors font-mono">
                    <td className="py-3.5 px-4 font-bold text-cream text-sm">
                      {cat.name}
                    </td>
                    <td className="py-3.5 px-4 text-orange font-bold text-sm">
                      {cat.qty} items
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-cream text-sm">
                      Rs. {cat.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
