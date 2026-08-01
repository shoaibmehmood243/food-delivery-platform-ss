"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { StatusTimeline } from "./StatusTimeline";
import PerforatedTicket from "./PerforatedTicket";
import { setCookie, LAST_ORDER_COOKIE_NAME } from "@/lib/cookies";

interface OrderItem {
  id: string;
  nameSnapshot: string;
  unitPriceSnapshot: number;
  qty: number;
  selectedHeat?: string | null;
  selectedFlavor?: string | null;
  selectedAddons?: Array<{ name: string; price: number }> | any;
}

interface BranchInfo {
  id: string;
  name: string;
  address: string;
  phone: string;
}

interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  orderType: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string | null;
  customerLat?: number | null;
  customerLng?: number | null;
  notes?: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  estimatedReadyAt?: string | null;
  createdAt: string;
  items: OrderItem[];
  branch: BranchInfo;
}

interface OrderTrackingClientProps {
  initialOrder: OrderData;
}

export function OrderTrackingClient({ initialOrder }: OrderTrackingClientProps) {
  const [order, setOrder] = useState<OrderData>(initialOrder);
  const [isPolling, setIsPolling] = useState(false);

  // Set last_order_number cookie on client mount and poll for status updates
  useEffect(() => {
    if (order?.orderNumber) {
      setCookie(LAST_ORDER_COOKIE_NAME, order.orderNumber, 30);
    }

    const fetchLatestOrder = async () => {
      try {
        setIsPolling(true);
        const res = await fetch(`/api/orders/${order.orderNumber}?t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.order) {
            setOrder(data.order);
          }
        }
      } catch (err) {
        console.error("Polling order error:", err);
      } finally {
        setIsPolling(false);
      }
    };

    // Immediate fetch on mount
    fetchLatestOrder();

    // Poll every 5 seconds
    const pollInterval = setInterval(fetchLatestOrder, 5000);

    return () => clearInterval(pollInterval);
  }, [order.orderNumber]);

  // Format ETA time
  const getFormattedETA = () => {
    if (order.estimatedReadyAt) {
      const etaDate = new Date(order.estimatedReadyAt);
      return etaDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    const created = new Date(order.createdAt);
    const minutesToAdd = order.orderType === "delivery" ? 45 : 20;
    const fallbackEta = new Date(created.getTime() + minutesToAdd * 60000);
    return fallbackEta.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Build WhatsApp pre-filled text link
  const getWhatsAppLink = () => {
    const phone = order.branch.phone.replace(/[^0-9]/g, "");
    let text = `*Seven Sides Order #${order.orderNumber}*\n`;
    text += `Branch: ${order.branch.name}\n`;
    text += `Type: ${order.orderType === "delivery" ? "Delivery" : "Pickup"}\n`;
    text += `Customer: ${order.customerName} (${order.customerPhone})\n`;
    if (order.orderType === "delivery" && order.customerAddress) {
      text += `Address: ${order.customerAddress}\n`;
    }
    text += `\n*Items:*\n`;
    order.items.forEach((item) => {
      let opts: string[] = [];
      if (item.selectedHeat) opts.push(`Heat: ${item.selectedHeat}`);
      if (item.selectedFlavor) opts.push(`Flavor: ${item.selectedFlavor}`);
      if (item.selectedAddons && Array.isArray(item.selectedAddons)) {
        item.selectedAddons.forEach((a: any) => opts.push(a.name));
      }
      const optsStr = opts.length > 0 ? ` (${opts.join(", ")})` : "";
      text += `• ${item.qty}x ${item.nameSnapshot}${optsStr} - Rs. ${item.unitPriceSnapshot * item.qty}\n`;
    });
    text += `\n*Total:* Rs. ${order.total.toLocaleString()} (Cash on Delivery)\n`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  // Adapt order.items to PerforatedTicket format
  const ticketItems = order.items.map((item) => ({
    cartId: item.id,
    menuItemId: item.id,
    name: item.nameSnapshot,
    unitPrice: item.unitPriceSnapshot,
    qty: item.qty,
    selectedHeat: item.selectedHeat || null,
    selectedFlavor: item.selectedFlavor || null,
    selectedAddons: Array.isArray(item.selectedAddons) ? item.selectedAddons : [],
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-teal-deep/80 border border-cream/20 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 font-anton text-8xl text-cream pointer-events-none">
          SS
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange/20 border border-orange/40 text-orange rounded-full font-mono text-xs uppercase font-bold tracking-wider">
          <span>{isPolling ? "Syncing..." : "Live Order Status"}</span>
          <span className="w-2 h-2 rounded-full bg-orange animate-ping" />
        </div>

        <h1 className="font-anton text-3xl sm:text-5xl text-cream uppercase tracking-wide">
          Order #{order.orderNumber}
        </h1>

        <p className="font-work text-sm sm:text-base text-cream/80 max-w-lg mx-auto">
          Thank you, <strong className="text-orange">{order.customerName}</strong>! Your order has been placed with our{" "}
          <strong className="text-cream font-bold">{order.branch.name}</strong> branch.
        </p>

        {/* ETA Box */}
        {order.status !== "delivered" && order.status !== "cancelled" && (
          <div className="inline-block bg-ink/70 border border-cream/20 rounded-2xl p-4 sm:px-8 mt-2">
            <p className="font-mono text-xs text-cream/60 uppercase tracking-widest">
              Estimated {order.orderType === "delivery" ? "Delivery" : "Ready"} Time
            </p>
            <p className="font-anton text-3xl text-orange mt-1">
              ~ {getFormattedETA()}
            </p>
          </div>
        )}
      </div>

      {/* Live Status Tracker */}
      <div className="bg-ink/60 border border-cream/15 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-cream/10 pb-4">
          <h2 className="font-anton text-xl text-cream uppercase tracking-wide flex items-center gap-2">
            <span>📍 Order Progress</span>
          </h2>
          <span className="font-mono text-xs text-cream/50 uppercase">
            Auto-refreshes live
          </span>
        </div>

        <StatusTimeline status={order.status} orderType={order.orderType} />
      </div>

      {/* Action Buttons & Order Ticket */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Actions & Details */}
        <div className="md:col-span-6 space-y-6">
          {/* WhatsApp Share CTA */}
          <div className="bg-ink/60 border border-cream/15 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-anton text-lg text-cream uppercase tracking-wider flex items-center gap-2">
              <span>💬 Direct Contact</span>
            </h3>
            <p className="font-work text-xs text-cream/70">
              Need to update your address or ask a question about your order? Connect directly with the branch on WhatsApp.
            </p>
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-black font-anton text-sm uppercase tracking-wider rounded-xl shadow-lg transition-transform hover:-translate-y-0.5"
            >
              <span>💬 Send Order Details on WhatsApp</span>
            </a>
          </div>

          {/* Customer & Branch Info Box */}
          <div className="bg-ink/60 border border-cream/15 rounded-2xl p-6 space-y-4 shadow-xl text-left">
            <h3 className="font-anton text-lg text-cream uppercase tracking-wider border-b border-cream/10 pb-2">
              📋 Order Summary Details
            </h3>

            <div className="space-y-3 font-work text-xs text-cream/80">
              <div>
                <span className="font-mono text-cream/50 uppercase block">Fulfillment:</span>
                <span className="font-bold text-cream capitalize">
                  {order.orderType} • {order.branch.name} Branch
                </span>
              </div>

              <div>
                <span className="font-mono text-cream/50 uppercase block">Contact Phone:</span>
                <span className="font-bold text-cream">{order.customerPhone}</span>
              </div>

              {order.orderType === "delivery" && order.customerAddress && (
                <div>
                  <span className="font-mono text-cream/50 uppercase block">Delivery Address:</span>
                  <span className="font-bold text-cream">{order.customerAddress}</span>
                </div>
              )}

              {order.notes && (
                <div>
                  <span className="font-mono text-cream/50 uppercase block">Special Notes:</span>
                  <span className="italic text-cream/90">{order.notes}</span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Link
                href="/menu"
                className="inline-block font-mono text-xs text-orange hover:underline font-semibold"
              >
                ← Back to Menu
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Perforated Order Ticket */}
        <div className="md:col-span-6">
          <PerforatedTicket
            items={ticketItems}
            orderType={order.orderType === "delivery" ? "delivery" : "pickup"}
            deliveryFee={order.deliveryFee}
            branchName={order.branch.name}
          />
        </div>
      </div>
    </div>
  );
}
