"use client";

import { CartItem } from "@/lib/cartStore";

interface PerforatedTicketProps {
  items: CartItem[];
  orderType: "delivery" | "pickup";
  deliveryFee: number;
  branchName: string;
}

export default function PerforatedTicket({
  items,
  orderType,
  deliveryFee,
  branchName,
}: PerforatedTicketProps) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.qty,
    0
  );
  const actualDeliveryFee = orderType === "delivery" ? deliveryFee : 0;
  const total = subtotal + actualDeliveryFee;

  return (
    <div className="relative bg-cream text-ink rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 border-2 border-cream/90 font-mono text-left overflow-hidden">
      {/* Ticket Header */}
      <div className="text-center border-b-2 border-dashed border-ink/25 pb-6 space-y-2">
        <div className="inline-block px-3 py-1 bg-ink text-cream rounded-full text-[11px] uppercase tracking-widest font-bold">
          Official Seven Sides Receipt
        </div>
        <h3 className="font-anton text-3xl sm:text-4xl text-ink uppercase tracking-wide">
          Order Summary
        </h3>
        <p className="font-work text-xs text-ink/75">
          Fulfillment Branch: <strong>{branchName}</strong> ({orderType.toUpperCase()})
        </p>
      </div>

      {/* Item Lines */}
      <div className="space-y-4 py-2">
        {items.map((item) => {
          const itemTotal = item.unitPrice * item.qty;
          return (
            <div
              key={item.cartId}
              className="flex justify-between items-start gap-4 text-xs sm:text-sm border-b border-dashed border-ink/15 pb-3"
            >
              <div className="space-y-0.5 flex-1">
                <p className="font-bold font-work text-base text-ink">
                  {item.qty}x {item.name}
                </p>

                {/* Configurations */}
                <div className="font-work text-[11px] text-ink/70 space-y-0.5">
                  {item.selectedHeat && (
                    <p className="text-red font-semibold">
                      🌶️ Heat: {item.selectedHeat}
                    </p>
                  )}
                  {item.selectedFlavor && (
                    <p className="text-teal-deep font-semibold">
                      ✨ Flavor: {item.selectedFlavor}
                    </p>
                  )}
                  {item.selectedAddons && item.selectedAddons.length > 0 && (
                    <p>
                      ➕ Addons: {item.selectedAddons.map((a) => a.name).join(", ")}
                    </p>
                  )}
                </div>
              </div>

              <span className="font-mono font-bold text-sm text-ink whitespace-nowrap pt-0.5">
                Rs. {itemTotal.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Ticket Calculations */}
      <div className="border-t-2 border-dashed border-ink/25 pt-4 space-y-2 text-xs sm:text-sm font-work">
        <div className="flex justify-between items-center text-ink/80">
          <span>Subtotal</span>
          <span className="font-mono font-bold">
            Rs. {subtotal.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between items-center text-ink/80">
          <span>Fulfillment Fee</span>
          <span className="font-mono font-bold">
            {orderType === "delivery" ? (
              `Rs. ${deliveryFee.toLocaleString()}`
            ) : (
              <span className="text-teal-deep font-semibold">
                Pickup — no delivery fee
              </span>
            )}
          </span>
        </div>

        {/* Final Total */}
        <div className="flex justify-between items-center pt-3 border-t border-ink/20 text-base sm:text-lg font-bold text-ink">
          <span className="font-anton uppercase tracking-wider text-xl">Total</span>
          <span className="font-mono text-2xl text-teal-deep">
            Rs. {total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Ticket Perforated Cut-Out Circles */}
      <div className="absolute top-1/2 -left-4 w-8 h-8 rounded-full bg-teal-deep border-r-2 border-cream/90 -translate-y-1/2" />
      <div className="absolute top-1/2 -right-4 w-8 h-8 rounded-full bg-teal-deep border-l-2 border-cream/90 -translate-y-1/2" />
    </div>
  );
}
