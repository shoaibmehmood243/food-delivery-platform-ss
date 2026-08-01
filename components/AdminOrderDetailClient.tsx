"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LocationPickerMap from "./LocationPickerMap";

interface OrderItem {
  id: string;
  nameSnapshot: string;
  unitPriceSnapshot: number;
  qty: number;
  selectedHeat?: string | null;
  selectedFlavor?: string | null;
  selectedAddons?: any;
}

interface StatusHistoryItem {
  id: string;
  status: string;
  changedAt: string;
}

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  lat?: number;
  lng?: number;
}

interface OrderData {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string | null;
  customerLat?: number | null;
  customerLng?: number | null;
  notes?: string | null;
  orderType: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: string;
  estimatedReadyAt?: string | null;
  createdAt: string;
  items: OrderItem[];
  branch: Branch;
  statusHistory: StatusHistoryItem[];
}

interface AdminOrderDetailClientProps {
  initialOrder: OrderData;
  userRole: "owner" | "branch_staff";
  userBranchId?: string | null;
}

const STATUS_LIST = [
  { id: "placed", label: "Placed" },
  { id: "confirmed", label: "Confirmed" },
  { id: "preparing", label: "Preparing" },
  { id: "out_for_delivery", label: "Out for Delivery" },
  { id: "ready_for_pickup", label: "Ready for Pickup" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

export default function AdminOrderDetailClient({
  initialOrder,
  userRole,
  userBranchId,
}: AdminOrderDetailClientProps) {
  const [order, setOrder] = useState<OrderData>(initialOrder);
  const [status, setStatus] = useState<string>(initialOrder.status);
  
  // Format initial ETA for datetime-local input
  const formatEtaForInput = (isoStr?: string | null) => {
    if (!isoStr) return "";
    const date = new Date(isoStr);
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    return localISOTime;
  };

  const [etaInput, setEtaInput] = useState<string>(
    formatEtaForInput(initialOrder.estimatedReadyAt)
  );

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          estimatedReadyAt: etaInput ? new Date(etaInput).toISOString() : null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update order");
      }

      setOrder({
        ...data.order,
        createdAt: new Date(data.order.createdAt).toISOString(),
        updatedAt: new Date(data.order.updatedAt).toISOString(),
        estimatedReadyAt: data.order.estimatedReadyAt
          ? new Date(data.order.estimatedReadyAt).toISOString()
          : null,
        statusHistory: data.order.statusHistory.map((h: any) => ({
          ...h,
          changedAt: new Date(h.changedAt).toISOString(),
        })),
      });

      setMsg({ text: "Order updated successfully!", type: "success" });
      router.refresh();
    } catch (err: any) {
      setMsg({ text: err.message || "Failed to save updates", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-cream/15 pb-6">
        <div>
          <Link
            href="/admin/orders"
            className="font-mono text-xs text-orange hover:underline font-semibold"
          >
            ← Back to Orders Dashboard
          </Link>
          <h1 className="font-anton text-3xl sm:text-4xl text-cream uppercase tracking-wide mt-1">
            Manage Order #{order.orderNumber}
          </h1>
        </div>

        <span className="px-4 py-1.5 rounded-full font-mono text-xs uppercase font-bold tracking-wider bg-orange/20 text-orange border border-orange/40">
          Branch: {order.branch.name}
        </span>
      </div>

      {/* Message Feedback */}
      {msg && (
        <div
          className={`p-4 rounded-2xl font-work text-xs font-medium border text-center shadow-lg animate-in fade-in ${
            msg.type === "success"
              ? "bg-green-500/20 text-green-300 border-green-500/40"
              : "bg-red/20 text-red border-red/40"
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Grid Layout: Left Column Details, Right Column Status Control */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Customer & Items */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer Info Card */}
          <div className="bg-ink/60 border border-cream/15 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl text-left">
            <h2 className="font-anton text-xl text-cream uppercase tracking-wide border-b border-cream/10 pb-3">
              👤 Customer &amp; Delivery Info
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-work text-xs text-cream/80">
              <div>
                <span className="font-mono text-cream/50 uppercase block">Name:</span>
                <strong className="text-cream text-sm">{order.customerName}</strong>
              </div>

              <div>
                <span className="font-mono text-cream/50 uppercase block">Phone:</span>
                <strong className="text-cream text-sm">{order.customerPhone}</strong>
              </div>

              <div>
                <span className="font-mono text-cream/50 uppercase block">Order Type:</span>
                <span className="capitalize font-bold text-orange">
                  {order.orderType === "delivery" ? "🛵 Delivery" : "🛍️ Pickup"}
                </span>
              </div>

              <div>
                <span className="font-mono text-cream/50 uppercase block">Payment:</span>
                <span className="font-bold text-cream">Cash on Delivery</span>
              </div>

              {order.orderType === "delivery" && order.customerAddress && (
                <div className="sm:col-span-2">
                  <span className="font-mono text-cream/50 uppercase block">Address:</span>
                  <span className="font-medium text-cream">{order.customerAddress}</span>
                </div>
              )}

              {order.notes && (
                <div className="sm:col-span-2 bg-ink p-3 rounded-xl border border-cream/10">
                  <span className="font-mono text-cream/50 uppercase block mb-1">Customer Notes:</span>
                  <span className="italic text-cream">{order.notes}</span>
                </div>
              )}
            </div>

            {/* Map location display if delivery coordinates exist */}
            {order.orderType === "delivery" && order.customerLat && order.customerLng && (
              <div className="pt-4 border-t border-cream/10 space-y-2">
                <span className="font-anton text-xs text-orange uppercase tracking-wider block">
                  📍 Pinpoint Delivery Location
                </span>
                <LocationPickerMap
                  branchLat={order.branch.lat || 31.4705}
                  branchLng={order.branch.lng || 74.4075}
                  branchName={order.branch.name}
                  deliveryRadiusKm={5.0}
                />
              </div>
            )}
          </div>

          {/* Itemized Order Breakdown */}
          <div className="bg-ink/60 border border-cream/15 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl text-left">
            <h2 className="font-anton text-xl text-cream uppercase tracking-wide border-b border-cream/10 pb-3">
              🍗 Order Items Breakdown
            </h2>

            <div className="space-y-4">
              {order.items.map((item) => {
                const addons = Array.isArray(item.selectedAddons)
                  ? item.selectedAddons
                  : [];

                return (
                  <div
                    key={item.id}
                    className="bg-ink/70 border border-cream/10 rounded-2xl p-4 flex items-start justify-between gap-4 font-work text-xs"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-cream text-sm">
                        {item.qty}x {item.nameSnapshot}
                      </h4>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.selectedHeat && (
                          <span className="px-2 py-0.5 bg-orange/20 text-orange border border-orange/30 font-mono text-[10px] rounded">
                            🔥 {item.selectedHeat}
                          </span>
                        )}
                        {item.selectedFlavor && (
                          <span className="px-2 py-0.5 bg-cream/10 text-cream font-mono text-[10px] rounded">
                            ✨ {item.selectedFlavor}
                          </span>
                        )}
                        {addons.map((a: any, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-cream/10 text-cream/80 font-mono text-[10px] rounded"
                          >
                            + {a.name} (Rs. {a.price})
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="font-mono text-right text-sm font-bold text-cream">
                      Rs. {(item.unitPriceSnapshot * item.qty).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Financial Summary */}
            <div className="border-t border-cream/15 pt-4 space-y-2 font-mono text-xs text-cream/80">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>Rs. {order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee:</span>
                <span>Rs. {order.deliveryFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-orange font-anton text-lg pt-2 border-t border-cream/10">
                <span>Total:</span>
                <span>Rs. {order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Update Controls & Status History */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status & ETA Form */}
          <form
            onSubmit={handleSave}
            className="bg-ink/80 border border-orange/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-left"
          >
            <h2 className="font-anton text-2xl text-orange uppercase tracking-wide border-b border-cream/10 pb-3">
              ⚡ Order Status &amp; ETA Controls
            </h2>

            {/* Status Dropdown */}
            <div className="space-y-2">
              <label className="font-anton text-xs text-cream uppercase tracking-wider block">
                Update Order Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 bg-ink border border-cream/20 rounded-xl text-cream font-work text-sm focus:outline-none focus:border-orange font-bold uppercase"
              >
                {STATUS_LIST.map((s) => (
                  <option key={s.id} value={s.id} className="bg-ink text-cream">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Editable ETA Field */}
            <div className="space-y-2">
              <label className="font-anton text-xs text-cream uppercase tracking-wider block">
                Estimated Ready / Delivery Time (ETA)
              </label>
              <input
                type="datetime-local"
                value={etaInput}
                onChange={(e) => setEtaInput(e.target.value)}
                className="w-full px-4 py-3 bg-ink border border-cream/20 rounded-xl text-cream font-mono text-xs focus:outline-none focus:border-orange"
              />
              <p className="font-work text-[11px] text-cream/50">
                Updates will instantly reflect on customer's live tracking page.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 bg-orange hover:bg-orange/90 text-ink font-anton text-sm uppercase tracking-wider rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50"
            >
              {saving ? "Saving Changes..." : "Save Updates & Notify Status"}
            </button>
          </form>

          {/* Status Change History Timeline */}
          <div className="bg-ink/60 border border-cream/15 rounded-3xl p-6 space-y-4 shadow-xl text-left">
            <h3 className="font-anton text-lg text-cream uppercase tracking-wide border-b border-cream/10 pb-3">
              📜 Status Change History
            </h3>

            {order.statusHistory.length === 0 ? (
              <p className="font-work text-xs text-cream/50">No status changes recorded yet.</p>
            ) : (
              <ul className="space-y-3 font-mono text-xs">
                {order.statusHistory.map((h) => {
                  const date = new Date(h.changedAt);
                  return (
                    <li
                      key={h.id}
                      className="flex items-center justify-between border-b border-cream/5 pb-2"
                    >
                      <span className="font-bold text-orange capitalize">
                        {h.status.replace(/_/g, " ")}
                      </span>
                      <span className="text-cream/50 text-[11px]">
                        {date.toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
