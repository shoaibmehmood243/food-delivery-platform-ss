"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getCookie, setCookie, deleteCookie, BRANCH_NAME_COOKIE_NAME, BRANCH_COOKIE_NAME, LAST_ORDER_COOKIE_NAME } from "@/lib/cookies";
import { useCartStore } from "@/lib/cartStore";
import BranchModal, { Branch } from "./BranchModal";
import BranchSwitchConfirmModal from "./BranchSwitchConfirmModal";
import CartDrawer from "./CartDrawer";

interface HeaderProps {
  initialBranches?: Branch[];
}

export default function Header({ initialBranches }: HeaderProps) {
  const [selectedBranchName, setSelectedBranchName] = useState<string | null>(null);
  const [lastOrderNumber, setLastOrderNumber] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingBranch, setPendingBranch] = useState<Branch | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { items, clearCart, openCart, getTotalItems } = useCartStore();

  useEffect(() => {
    setMounted(true);
    const name = getCookie(BRANCH_NAME_COOKIE_NAME);
    if (name) {
      setSelectedBranchName(decodeURIComponent(name));
    }

    const orderNum = getCookie(LAST_ORDER_COOKIE_NAME);
    if (orderNum) {
      const decodedNum = decodeURIComponent(orderNum);

      // Verify order status from API to clear finished/cancelled tracking
      fetch(`/api/orders/${decodedNum}?t=${Date.now()}`, { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.order) {
            const { status, updatedAt } = data.order;
            if (status === "delivered" || status === "cancelled") {
              const updatedTime = new Date(updatedAt).getTime();
              const now = Date.now();
              const diffMinutes = (now - updatedTime) / (1000 * 60);

              // Clear tracking cookie if completed/cancelled > 15 mins ago or from previous day
              const orderDateStr = new Date(updatedAt).toDateString();
              const todayStr = new Date().toDateString();

              if (diffMinutes > 15 || orderDateStr !== todayStr) {
                deleteCookie(LAST_ORDER_COOKIE_NAME);
                setLastOrderNumber(null);
                return;
              }
            }
            setLastOrderNumber(decodedNum);
          } else {
            // Stale order number not found in DB
            deleteCookie(LAST_ORDER_COOKIE_NAME);
            setLastOrderNumber(null);
          }
        })
        .catch(() => {
          setLastOrderNumber(decodedNum);
        });
    }

    const handleBranchChange = (e: Event) => {
      const customEvent = e as CustomEvent<Branch>;
      if (customEvent.detail && customEvent.detail.name) {
        setSelectedBranchName(customEvent.detail.name);
      }
    };

    window.addEventListener("branchChanged", handleBranchChange);
    return () => window.removeEventListener("branchChanged", handleBranchChange);
  }, []);

  // Handle branch selection with cart check
  const handleBranchSelectAttempt = (branch: Branch) => {
    if (items.length > 0) {
      setPendingBranch(branch);
      setIsConfirmOpen(true);
    } else {
      applyBranchChange(branch);
    }
  };

  const applyBranchChange = (branch: Branch) => {
    setCookie(BRANCH_COOKIE_NAME, branch.id);
    setCookie(BRANCH_NAME_COOKIE_NAME, branch.name);
    setSelectedBranchName(branch.name);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("branchChanged", { detail: branch }));
    }

    setIsModalOpen(false);
    setIsConfirmOpen(false);
    setPendingBranch(null);
  };

  const handleConfirmSwitch = (branch: Branch) => {
    clearCart();
    applyBranchChange(branch);
  };

  const totalCartItems = mounted ? getTotalItems() : 0;

  return (
    <>
      <header className="sticky top-0 z-40 bg-teal-deep/95 backdrop-blur-md border-b border-cream/10 px-3 sm:px-8 py-2.5 sm:py-3 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Brand Name (7 circle removed) */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <span className="font-anton text-xl sm:text-3xl text-orange tracking-wide uppercase transition-colors whitespace-nowrap">
              Seven Sides
            </span>
          </Link>

          {/* Navigation & Branch Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <nav className="hidden md:flex items-center gap-5 font-work text-sm font-medium text-cream/90">
              <Link href="/" className="hover:text-orange transition-colors">
                Home
              </Link>
              <Link href="/menu" className="hover:text-orange transition-colors">
                Menu
              </Link>
            </nav>

            {/* Persistent Order Tracking Button (Mobile & Desktop Responsive) */}
            {mounted && lastOrderNumber && (
              <Link
                href={`/order/${lastOrderNumber}`}
                className="px-2 sm:px-3 py-1.5 rounded-lg bg-orange/20 border border-orange/40 text-orange hover:bg-orange/30 text-[10px] sm:text-xs font-mono font-semibold transition-all flex items-center gap-1 shadow shrink-0"
                title={`Track Order #${lastOrderNumber}`}
              >
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-orange animate-ping flex-shrink-0" />
                <span className="truncate max-w-[70px] xs:max-w-[100px] sm:max-w-none">
                  Track #{lastOrderNumber}
                </span>
              </Link>
            )}

            {/* Branch Switcher Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-lg bg-ink/70 border border-orange/40 hover:border-orange text-cream text-[11px] sm:text-xs font-work transition-all shadow-md group shrink-0"
            >
              <span className="text-orange text-sm sm:text-base group-hover:animate-bounce">
                📍
              </span>
              <span className="max-w-[65px] xs:max-w-[95px] sm:max-w-[150px] truncate font-medium">
                {selectedBranchName || "Select Branch"}
              </span>
              <span className="hidden md:inline font-mono text-[10px] text-orange bg-orange/10 px-1.5 py-0.5 rounded border border-orange/20">
                Change
              </span>
            </button>

            {/* Cart Icon Button with Badge */}
            <button
              onClick={openCart}
              className="relative p-2 sm:px-3 sm:py-2 rounded-lg bg-orange hover:bg-orange/90 text-ink font-anton text-xs sm:text-sm transition-all shadow-lg active:scale-95 flex items-center gap-1 shrink-0"
              aria-label="View Shopping Cart"
            >
              <span className="text-sm sm:text-base">🛒</span>
              <span className="hidden sm:inline uppercase tracking-wider text-xs">Cart</span>
              {totalCartItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-red text-cream font-mono text-[10px] sm:text-[11px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow border-2 border-teal-deep animate-in zoom-in">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Controlled Branch Modal */}
      <BranchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialBranches={initialBranches}
        onSelectBranch={handleBranchSelectAttempt}
      />

      {/* Branch Switch Confirmation Dialog */}
      <BranchSwitchConfirmModal
        pendingBranch={pendingBranch}
        isOpen={isConfirmOpen}
        onCancel={() => {
          setIsConfirmOpen(false);
          setPendingBranch(null);
        }}
        onConfirm={handleConfirmSwitch}
      />

      {/* Slide-out Cart Drawer */}
      <CartDrawer />
    </>
  );
}
