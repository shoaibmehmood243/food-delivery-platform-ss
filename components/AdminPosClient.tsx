"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ItemCustomizationModal from "./ItemCustomizationModal";

interface Branch {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  sortOrder: number;
}

interface AddonOption {
  id: string;
  name: string;
  price: number;
}

interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  hasHeatGauge: boolean;
  flavorOptions: string[];
  isActive: boolean;
  isNew: boolean;
  isSignature: boolean;
  addonOptions: AddonOption[];
}

interface PosCartItem {
  cartId: string;
  menuItemId: string;
  name: string;
  unitPrice: number;
  qty: number;
  selectedHeat?: string | null;
  selectedFlavor?: string | null;
  selectedAddons?: Array<{ name: string; price: number }>;
}

interface AdminPosClientProps {
  categories: Category[];
  menuItems: MenuItem[];
  branches: Branch[];
  userRole: "owner" | "branch_staff";
  userBranchId?: string | null;
}

export default function AdminPosClient({
  categories,
  menuItems,
  branches,
  userRole,
  userBranchId,
}: AdminPosClientProps) {
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    userRole === "branch_staff" ? userBranchId || branches[0]?.id || "" : branches[0]?.id || ""
  );

  const [selectedCatFilter, setSelectedCatFilter] = useState<string>("all");
  const [activeItemForCustomization, setActiveItemForCustomization] = useState<MenuItem | null>(null);
  
  // POS Order Cart State
  const [posItems, setPosItems] = useState<PosCartItem[]>([]);
  const [customerName, setCustomerName] = useState("Walk-in");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderType, setOrderType] = useState<"dine_in" | "takeaway" | "phone">("dine_in");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [completedOrderNum, setCompletedOrderNum] = useState<string | null>(null);
  const router = useRouter();

  // Add Item to POS Cart
  const handleItemCardClick = (item: MenuItem) => {
    const hasOptions = item.hasHeatGauge || (item.flavorOptions && item.flavorOptions.length > 0) || (item.addonOptions && item.addonOptions.length > 0);
    if (hasOptions) {
      setActiveItemForCustomization(item);
    } else {
      // Add directly
      addPosLineItem({
        cartId: `${item.id}-${Date.now()}`,
        menuItemId: item.id,
        name: item.name,
        unitPrice: item.price,
        qty: 1,
      });
    }
  };

  const addPosLineItem = (lineItem: PosCartItem) => {
    setPosItems((prev) => {
      // Check if identical item with same options already exists
      const existingIdx = prev.findIndex(
        (p) =>
          p.menuItemId === lineItem.menuItemId &&
          p.selectedHeat === lineItem.selectedHeat &&
          p.selectedFlavor === lineItem.selectedFlavor &&
          JSON.stringify(p.selectedAddons) === JSON.stringify(lineItem.selectedAddons)
      );

      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx].qty += lineItem.qty;
        return updated;
      }

      return [...prev, lineItem];
    });
  };

  const updatePosQty = (cartId: string, delta: number) => {
    setPosItems((prev) =>
      prev
        .map((item) => {
          if (item.cartId === cartId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as PosCartItem[]
    );
  };

  const removePosItem = (cartId: string) => {
    setPosItems((prev) => prev.filter((i) => i.cartId !== cartId));
  };

  const calculateSubtotal = () =>
    posItems.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);

  // Submit POS Order Handler
  const handleSubmitPosOrder = async () => {
    if (posItems.length === 0) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/pos/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId: selectedBranchId,
          customerName: customerName.trim() || "Walk-in",
          customerPhone: customerPhone.trim() || "N/A",
          orderType,
          items: posItems,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create POS order");
      }

      setCompletedOrderNum(data.order.orderNumber);
      setPosItems([]);
      setCustomerName("Walk-in");
      setCustomerPhone("");
      setNotes("");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to submit POS order");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems =
    selectedCatFilter === "all"
      ? menuItems.filter((i) => i.isActive)
      : menuItems.filter((i) => i.isActive && i.categoryId === selectedCatFilter);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
      {/* Left Column: Menu Browsing Terminal */}
      <div className="lg:col-span-8 space-y-6">
        {/* Branch Selector Header */}
        <div className="bg-ink/60 border border-cream/15 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div>
            <h1 className="font-anton text-3xl text-cream uppercase tracking-wide">
              🛒 POS Terminal
            </h1>
            <p className="font-work text-xs text-cream/70">
              Counter sales, dine-in, takeaway, and phone orders.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-anton text-xs text-orange uppercase tracking-wider">
              Selected Branch:
            </span>
            {userRole === "owner" ? (
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="px-3 py-2 bg-ink border border-cream/20 rounded-xl text-cream font-work text-xs font-bold focus:outline-none focus:border-orange"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id} className="bg-ink text-cream">
                    {b.name}
                  </option>
                ))}
              </select>
            ) : (
              <span className="px-3 py-1.5 bg-ink border border-orange/40 text-cream font-mono text-xs rounded-xl font-bold">
                📍 {branches.find((b) => b.id === selectedBranchId)?.name || "Your Branch"}
              </span>
            )}
          </div>
        </div>

        {/* Category Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCatFilter("all")}
            className={`px-4 py-2.5 rounded-xl font-anton text-xs uppercase tracking-wider whitespace-nowrap transition-all ${
              selectedCatFilter === "all"
                ? "bg-orange text-ink shadow-lg font-bold"
                : "bg-ink/50 text-cream/70 hover:text-cream border border-cream/15"
            }`}
          >
            All Items ({menuItems.filter((i) => i.isActive).length})
          </button>

          {categories.map((cat) => {
            const count = menuItems.filter(
              (i) => i.isActive && i.categoryId === cat.id
            ).length;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCatFilter(cat.id)}
                className={`px-4 py-2.5 rounded-xl font-anton text-xs uppercase tracking-wider whitespace-nowrap transition-all ${
                  selectedCatFilter === cat.id
                    ? "bg-orange text-ink shadow-lg font-bold"
                    : "bg-ink/50 text-cream/70 hover:text-cream border border-cream/15"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Menu Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemCardClick(item)}
              className="bg-ink/60 border border-cream/15 hover:border-orange rounded-3xl p-4 space-y-3 cursor-pointer group shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="relative w-full h-36 rounded-2xl bg-teal-deep/50 overflow-hidden border border-cream/10">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    🍗
                  </div>
                )}
                {item.hasHeatGauge && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-ink/90 text-orange font-mono text-[10px] uppercase rounded border border-orange/40">
                    🔥 Customizable
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-anton text-lg text-cream uppercase tracking-wide group-hover:text-orange transition-colors">
                  {item.name}
                </h3>
                <p className="font-work text-[11px] text-cream/60 line-clamp-1 mt-0.5">
                  {item.description || "Freshly prepared to order."}
                </p>
              </div>

              <div className="pt-2 border-t border-cream/10 flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-orange">
                  Rs. {item.price.toLocaleString()}
                </span>
                <span className="px-3 py-1 bg-orange/20 text-orange font-anton text-xs uppercase rounded-lg border border-orange/30 group-hover:bg-orange group-hover:text-ink transition-colors">
                  + Add to Order
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Running Order Cart Panel & Counter Checkout */}
      <div className="lg:col-span-4 bg-ink/80 border border-cream/20 rounded-3xl p-6 space-y-6 shadow-2xl sticky top-24">
        <div className="flex items-center justify-between border-b border-cream/15 pb-4">
          <h2 className="font-anton text-2xl text-cream uppercase tracking-wide flex items-center gap-2">
            <span>📝 Order Panel</span>
          </h2>
          <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-orange/20 text-orange border border-orange/30">
            {posItems.reduce((sum, i) => sum + i.qty, 0)} Items
          </span>
        </div>

        {/* Selected Items List */}
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {posItems.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <span className="text-4xl">🛒</span>
              <p className="font-work text-xs text-cream/50">
                Click any menu item on the left to add to counter order.
              </p>
            </div>
          ) : (
            posItems.map((item) => (
              <div
                key={item.cartId}
                className="bg-ink p-3 rounded-2xl border border-cream/10 space-y-2 font-work text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-cream">{item.name}</h4>
                    {item.selectedHeat && (
                      <span className="text-[10px] text-orange font-mono block">
                        🔥 Heat: {item.selectedHeat}
                      </span>
                    )}
                    {item.selectedFlavor && (
                      <span className="text-[10px] text-cream/70 font-mono block">
                        ✨ Flavor: {item.selectedFlavor}
                      </span>
                    )}
                    {item.selectedAddons && item.selectedAddons.length > 0 && (
                      <span className="text-[10px] text-cream/60 font-mono block">
                        + {item.selectedAddons.map((a) => a.name).join(", ")}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => removePosItem(item.cartId)}
                    className="text-red/70 hover:text-red font-bold text-xs"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-cream/5">
                  <div className="flex items-center gap-2 bg-teal-deep/50 rounded-lg p-1 border border-cream/10 font-mono">
                    <button
                      onClick={() => updatePosQty(item.cartId, -1)}
                      className="w-5 h-5 flex items-center justify-center bg-ink text-cream hover:bg-orange hover:text-ink rounded text-xs"
                    >
                      -
                    </button>
                    <span className="font-bold px-1">{item.qty}</span>
                    <button
                      onClick={() => updatePosQty(item.cartId, 1)}
                      className="w-5 h-5 flex items-center justify-center bg-ink text-cream hover:bg-orange hover:text-ink rounded text-xs"
                    >
                      +
                    </button>
                  </div>

                  <span className="font-mono font-bold text-cream">
                    Rs. {(item.unitPrice * item.qty).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Counter Checkout Form */}
        <div className="pt-4 border-t border-cream/15 space-y-4">
          {/* Order Type Toggle */}
          <div className="space-y-1.5">
            <label className="font-anton text-xs text-cream uppercase tracking-wider block">
              Order Type
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-ink rounded-xl border border-cream/15 text-xs">
              <button
                type="button"
                onClick={() => setOrderType("dine_in")}
                className={`py-2 rounded-lg font-anton uppercase transition-all ${
                  orderType === "dine_in"
                    ? "bg-orange text-ink shadow"
                    : "text-cream/70 hover:text-cream"
                }`}
              >
                🍽️ Dine-in
              </button>

              <button
                type="button"
                onClick={() => setOrderType("takeaway")}
                className={`py-2 rounded-lg font-anton uppercase transition-all ${
                  orderType === "takeaway"
                    ? "bg-orange text-ink shadow"
                    : "text-cream/70 hover:text-cream"
                }`}
              >
                🛍️ Takeaway
              </button>

              <button
                type="button"
                onClick={() => setOrderType("phone")}
                className={`py-2 rounded-lg font-anton uppercase transition-all ${
                  orderType === "phone"
                    ? "bg-orange text-ink shadow"
                    : "text-cream/70 hover:text-cream"
                }`}
              >
                📞 Phone
              </button>
            </div>
          </div>

          {/* Customer Name */}
          <div className="space-y-1">
            <label className="font-anton text-xs text-cream uppercase tracking-wider block">
              Customer Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Walk-in"
              className="w-full px-3 py-2 bg-ink border border-cream/20 rounded-xl text-cream font-work text-xs focus:outline-none focus:border-orange"
            />
          </div>

          {/* Payment Method Display */}
          <div className="bg-ink/70 p-3 rounded-xl border border-cream/10 space-y-1 font-work text-xs">
            <span className="font-mono text-cream/50 text-[10px] uppercase block">
              Payment Method:
            </span>
            <span className="font-bold text-green-400">💵 Cash — Paid at Counter</span>
          </div>

          {/* Totals Summary */}
          <div className="bg-ink/90 p-4 rounded-2xl border border-orange/40 space-y-2 font-mono text-xs">
            <div className="flex justify-between text-cream/70">
              <span>Subtotal:</span>
              <span>Rs. {calculateSubtotal().toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-cream/70">
              <span>Delivery Fee:</span>
              <span>Rs. 0 (POS)</span>
            </div>
            <div className="flex justify-between text-orange font-anton text-xl pt-2 border-t border-cream/15">
              <span>Total:</span>
              <span>Rs. {calculateSubtotal().toLocaleString()}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmitPosOrder}
            disabled={posItems.length === 0 || submitting}
            className="w-full py-4 bg-orange hover:bg-orange/90 disabled:opacity-50 text-ink font-anton text-sm uppercase tracking-wider rounded-2xl shadow-xl transition-transform active:scale-95"
          >
            {submitting ? "Placing Order..." : "Submit POS Counter Order"}
          </button>
        </div>
      </div>

      {/* Item Customization Modal Reuse */}
      {activeItemForCustomization && (
        <ItemCustomizationModal
          item={{
            ...activeItemForCustomization,
            imageUrl: activeItemForCustomization.imageUrl || undefined,
            description: activeItemForCustomization.description || undefined,
          }}
          isOpen={Boolean(activeItemForCustomization)}
          onClose={() => setActiveItemForCustomization(null)}
          onAddToCart={(customizedItem) => {
            addPosLineItem({
              cartId: customizedItem.cartId,
              menuItemId: customizedItem.menuItemId,
              name: customizedItem.name,
              unitPrice: customizedItem.unitPrice,
              qty: customizedItem.qty,
              selectedHeat: customizedItem.selectedHeat,
              selectedFlavor: customizedItem.selectedFlavor,
              selectedAddons: customizedItem.selectedAddons,
            });
            setActiveItemForCustomization(null);
          }}
        />
      )}

      {/* SUCCESS RECEIPT MODAL */}
      {completedOrderNum && (
        <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-teal-deep border-2 border-orange rounded-3xl p-8 text-center space-y-6 shadow-2xl">
            <span className="text-6xl">🎉</span>
            <h2 className="font-anton text-3xl text-cream uppercase">
              POS Order Created!
            </h2>
            <div className="bg-ink/70 p-4 rounded-2xl border border-cream/20 space-y-1">
              <span className="font-mono text-xs text-cream/60 uppercase block">
                Order Reference Number:
              </span>
              <span className="font-anton text-3xl text-orange">
                #{completedOrderNum}
              </span>
            </div>
            <p className="font-work text-xs text-cream/80">
              The order has been submitted directly to the kitchen queue and is visible on the orders dashboard.
            </p>
            <button
              onClick={() => setCompletedOrderNum(null)}
              className="w-full py-3.5 bg-orange text-ink font-anton text-sm uppercase tracking-wider rounded-xl shadow-lg"
            >
              Start Next Counter Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
