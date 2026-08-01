"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/cartStore";

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    updateQty,
    removeItem,
    getSubtotal,
    getTotalItems,
  } = useCartStore();

  const [mounted, setMounted] = useState(false);

  // Prevent SSR hydration mismatch for persisted store
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  const subtotal = getSubtotal();
  const totalItems = getTotalItems();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop blur overlay */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-ink/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-teal-deep border-l-2 border-orange/40 text-cream shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 relative">
          {/* Header */}
          <div className="p-6 border-b border-cream/15 flex items-center justify-between bg-ink/40">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🛒</span>
              <h2 className="font-anton text-2xl text-cream uppercase tracking-wide">
                Your Order
              </h2>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-orange text-ink font-bold">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </span>
            </div>

            <button
              onClick={closeCart}
              className="w-8 h-8 rounded-full bg-cream/10 hover:bg-cream/20 text-cream flex items-center justify-center font-bold text-sm transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                <span className="text-5xl opacity-40">🍗</span>
                <h3 className="font-anton text-xl text-cream/70 uppercase">
                  Your cart is empty
                </h3>
                <p className="font-work text-xs text-cream/60 max-w-xs">
                  Looks like you haven&apos;t added any hot chicken or treats yet!
                </p>
                <Link
                  href="/menu"
                  onClick={closeCart}
                  className="px-6 py-2.5 bg-orange hover:bg-orange/90 text-ink font-anton text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
                >
                  Browse Menu
                </Link>
              </div>
            ) : (
              items.map((item) => {
                const itemTotal = item.unitPrice * item.qty;
                return (
                  <div
                    key={item.cartId}
                    className="bg-ink/60 border border-cream/15 rounded-xl p-4 space-y-3 relative group"
                  >
                    <div className="flex gap-3 items-start">
                      {item.imageUrl && (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-ink border border-cream/20">
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      )}

                      <div className="flex-1 space-y-1 text-left">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-anton text-lg text-cream leading-tight">
                            {item.name}
                          </h4>
                          <button
                            onClick={() => removeItem(item.cartId)}
                            className="text-cream/40 hover:text-red transition-colors text-xs p-1"
                            title="Remove item"
                          >
                            🗑️
                          </button>
                        </div>

                        {/* Selected Options Details */}
                        <div className="space-y-0.5 font-work text-[11px] text-cream/70">
                          {item.selectedHeat && (
                            <p className="text-orange">
                              🌶️ Heat: <strong>{item.selectedHeat}</strong>
                            </p>
                          )}
                          {item.selectedFlavor && (
                            <p className="text-teal-bright">
                              ✨ Flavor: <strong>{item.selectedFlavor}</strong>
                            </p>
                          )}
                          {item.selectedAddons && item.selectedAddons.length > 0 && (
                            <p className="text-cream/80">
                              ➕ Addons:{" "}
                              {item.selectedAddons.map((a) => a.name).join(", ")}
                            </p>
                          )}
                        </div>

                        <p className="font-mono text-xs text-cream/60">
                          Rs. {item.unitPrice.toLocaleString()} each
                        </p>
                      </div>
                    </div>

                    {/* Stepper & Line Total */}
                    <div className="pt-2 border-t border-cream/10 flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-teal-deep border border-cream/20 rounded-lg p-1">
                        <button
                          onClick={() => updateQty(item.cartId, item.qty - 1)}
                          className="w-6 h-6 rounded bg-cream/10 hover:bg-cream/20 text-cream font-bold text-xs flex items-center justify-center transition-colors"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-sm text-cream min-w-[20px] text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.cartId, item.qty + 1)}
                          className="w-6 h-6 rounded bg-cream/10 hover:bg-cream/20 text-cream font-bold text-xs flex items-center justify-center transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-mono font-bold text-base text-orange">
                        Rs. {itemTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-cream/15 bg-ink/80 space-y-4">
              <div className="space-y-1.5 font-work text-sm">
                <div className="flex items-center justify-between text-cream/80">
                  <span>Subtotal</span>
                  <span className="font-mono font-bold text-cream">
                    Rs. {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-cream/60">
                  <span>Taxes &amp; Delivery Fee</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex items-center justify-between font-anton text-xl text-cream pt-2 border-t border-cream/10">
                  <span>Total</span>
                  <span className="text-orange font-mono font-bold">
                    Rs. {subtotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full py-4 bg-orange hover:bg-orange/90 text-ink font-anton text-base uppercase tracking-wider rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <span className="font-sans">→</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
