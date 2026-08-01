"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/lib/cartStore";
import { getCookie, setCookie, BRANCH_COOKIE_NAME, BRANCH_NAME_COOKIE_NAME } from "@/lib/cookies";
import BranchModal, { Branch } from "./BranchModal";
import BranchSwitchConfirmModal from "./BranchSwitchConfirmModal";
import LocationPickerMap from "./LocationPickerMap";
import PerforatedTicket from "./PerforatedTicket";

interface CheckoutClientContentProps {
  branches: Branch[];
}

export default function CheckoutClientContent({ branches }: CheckoutClientContentProps) {
  const router = useRouter();
  const { items, clearCart } = useCartStore();

  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState<boolean>(false);
  const [pendingBranch, setPendingBranch] = useState<Branch | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

  // Form Fields
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerAddress, setCustomerAddress] = useState<string>("");
  const [customerLat, setCustomerLat] = useState<number | null>(null);
  const [customerLng, setCustomerLng] = useState<number | null>(null);
  const [notes, setNotes] = useState<string>("");

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    // Find selected branch from cookie
    const storedBranchId = getCookie(BRANCH_COOKIE_NAME);
    const matchedBranch = branches.find((b) => b.id === storedBranchId) || branches[0];
    if (matchedBranch) {
      setSelectedBranch(matchedBranch);
    }
  }, [branches]);

  const handleBranchSelectAttempt = (branch: Branch) => {
    if (items.length > 0 && selectedBranch && selectedBranch.id !== branch.id) {
      setPendingBranch(branch);
      setIsConfirmOpen(true);
    } else {
      applyBranchChange(branch);
    }
  };

  const applyBranchChange = (branch: Branch) => {
    setCookie(BRANCH_COOKIE_NAME, branch.id);
    setCookie(BRANCH_NAME_COOKIE_NAME, branch.name);
    setSelectedBranch(branch);
    setIsBranchModalOpen(false);
    setIsConfirmOpen(false);
    setPendingBranch(null);
  };

  const handleConfirmSwitch = (branch: Branch) => {
    clearCart();
    applyBranchChange(branch);
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch || items.length === 0) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId: selectedBranch.id,
          orderType,
          customerName,
          customerPhone,
          customerAddress: orderType === "delivery" ? customerAddress : undefined,
          customerLat: orderType === "delivery" ? customerLat : undefined,
          customerLng: orderType === "delivery" ? customerLng : undefined,
          notes,
          items,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to place order");
      }

      // Clear cart & redirect
      clearCart();
      router.push(`/order/${data.orderNumber}`);
    } catch (err: any) {
      console.error("Order submission error:", err);
      setErrorMsg(err.message || "An unexpected error occurred while placing order.");
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  // Empty cart fallback
  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-6 px-4">
        <span className="text-6xl">🍗</span>
        <h2 className="font-anton text-3xl text-cream uppercase">
          Your cart is empty
        </h2>
        <p className="font-work text-sm text-cream/70">
          Please add items to your cart before proceeding to checkout.
        </p>
        <Link
          href="/menu"
          className="inline-block px-8 py-3 bg-orange text-ink font-anton text-sm uppercase tracking-wider rounded-xl shadow-lg"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  const isValid =
    customerName.trim().length > 0 &&
    customerPhone.trim().length > 0 &&
    (orderType === "pickup" || customerAddress.trim().length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Fulfillment & Details */}
        <div className="lg:col-span-7 space-y-8 text-left">
          {/* 1. ORDER TYPE TOGGLE */}
          <div className="bg-ink/50 border border-cream/15 rounded-2xl p-6 space-y-4 shadow-xl">
            <h2 className="font-anton text-2xl text-cream uppercase tracking-wide">
              1. Fulfillment Method
            </h2>
            <div className="grid grid-cols-2 gap-3 p-1 bg-ink rounded-xl border border-cream/10">
              <button
                type="button"
                onClick={() => setOrderType("delivery")}
                className={`py-3 rounded-lg font-anton text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  orderType === "delivery"
                    ? "bg-orange text-ink shadow-md"
                    : "text-cream/70 hover:text-cream"
                }`}
              >
                <span>🛵 Delivery</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderType("pickup")}
                className={`py-3 rounded-lg font-anton text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  orderType === "pickup"
                    ? "bg-orange text-ink shadow-md"
                    : "text-cream/70 hover:text-cream"
                }`}
              >
                <span>🛍️ Pickup</span>
              </button>
            </div>
          </div>

          {/* 2. BRANCH CONFIRMATION */}
          {selectedBranch && (
            <div className="bg-ink/50 border border-cream/15 rounded-2xl p-6 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="font-anton text-xl text-cream uppercase tracking-wide flex items-center gap-2">
                  <span>📍 Selected Branch</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(true)}
                  className="font-mono text-xs text-orange hover:underline font-semibold"
                >
                  Change Branch →
                </button>
              </div>

              <div className="bg-teal-deep/50 border border-orange/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-anton text-xl text-orange">
                    {selectedBranch.name}
                  </h3>
                  <p className="font-work text-xs text-cream/80">
                    {selectedBranch.address}
                  </p>
                  <p className="font-mono text-[11px] text-cream/60 mt-1">
                    Hours: {selectedBranch.hoursOpen} – {selectedBranch.hoursClose}
                  </p>
                </div>
                <span className="font-mono text-xs px-3 py-1 bg-ink text-cream rounded-lg border border-cream/20 self-start sm:self-auto">
                  {orderType === "delivery"
                    ? `Rs. ${selectedBranch.deliveryFee} Fee`
                    : "No Delivery Fee"}
                </span>
              </div>
            </div>
          )}

          {/* 3. LOCATION PICKER MAP & ADDRESS (IF DELIVERY) */}
          {orderType === "delivery" && selectedBranch && (
            <div className="bg-ink/50 border border-cream/15 rounded-2xl p-6 space-y-6 shadow-xl">
              <h2 className="font-anton text-2xl text-cream uppercase tracking-wide">
                2. Delivery Location
              </h2>

              <LocationPickerMap
                branchLat={selectedBranch.lat}
                branchLng={selectedBranch.lng}
                branchName={selectedBranch.name}
                deliveryRadiusKm={selectedBranch.deliveryRadiusKm}
                onLocationSelect={(lat, lng) => {
                  setCustomerLat(lat);
                  setCustomerLng(lng);
                }}
              />

              <div className="space-y-2">
                <label className="font-anton text-sm text-cream uppercase tracking-wider block">
                  Detailed Address (Street / House / Apartment) *
                </label>
                <input
                  type="text"
                  required
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="e.g. House 14-B, Street 3, Sector H, DHA Phase 5, Lahore"
                  className="w-full px-4 py-3 bg-ink border border-cream/20 rounded-xl text-cream font-work text-sm focus:outline-none focus:border-orange placeholder:text-cream/40"
                />
              </div>
            </div>
          )}

          {/* 4. CUSTOMER CONTACT DETAILS */}
          <div className="bg-ink/50 border border-cream/15 rounded-2xl p-6 space-y-4 shadow-xl">
            <h2 className="font-anton text-2xl text-cream uppercase tracking-wide">
              {orderType === "delivery" ? "3." : "2."} Customer Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-anton text-xs text-cream uppercase tracking-wider block">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Ali Ahmed"
                  className="w-full px-4 py-3 bg-ink border border-cream/20 rounded-xl text-cream font-work text-sm focus:outline-none focus:border-orange placeholder:text-cream/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-anton text-xs text-cream uppercase tracking-wider block">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 0300 1234567"
                  className="w-full px-4 py-3 bg-ink border border-cream/20 rounded-xl text-cream font-work text-sm focus:outline-none focus:border-orange placeholder:text-cream/40"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-anton text-xs text-cream uppercase tracking-wider block">
                Order Notes / Special Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Extra comeback sauce or ring doorbell"
                className="w-full px-4 py-3 bg-ink border border-cream/20 rounded-xl text-cream font-work text-sm focus:outline-none focus:border-orange placeholder:text-cream/40 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Perforated Ticket & Submit CTA */}
        <div className="lg:col-span-5 space-y-6 sticky top-24">
          <PerforatedTicket
            items={items}
            orderType={orderType}
            deliveryFee={selectedBranch?.deliveryFee || 0}
            branchName={selectedBranch?.name || "Selected Branch"}
          />

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red/20 border border-red text-red text-xs font-work">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={!isValid || submitting}
            className={`w-full py-4 rounded-xl font-anton text-lg uppercase tracking-wider transition-all shadow-2xl flex items-center justify-center gap-2 ${
              isValid && !submitting
                ? "bg-orange hover:bg-orange/90 text-ink cursor-pointer active:scale-98"
                : "bg-cream/20 text-cream/40 cursor-not-allowed border border-cream/10"
            }`}
          >
            <span>{submitting ? "Placing Order..." : "Place order · Pay with cash"}</span>
            {!submitting && <span className="font-sans">→</span>}
          </button>
          
          <p className="font-work text-xs text-cream/50 text-center">
            💵 Cash on Delivery / Pay on Pickup. No advance payment required.
          </p>
        </div>
      </form>

      {/* Controlled Branch Modal */}
      <BranchModal
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
        initialBranches={branches}
        onSelectBranch={handleBranchSelectAttempt}
      />

      {/* Confirmation modal if changing branch with active cart */}
      <BranchSwitchConfirmModal
        pendingBranch={pendingBranch}
        isOpen={isConfirmOpen}
        onCancel={() => {
          setIsConfirmOpen(false);
          setPendingBranch(null);
        }}
        onConfirm={handleConfirmSwitch}
      />
    </div>
  );
}
