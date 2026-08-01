"use client";

import React from "react";

interface StatusTimelineProps {
  status: string;
  orderType: "delivery" | "pickup" | string;
}

const DELIVERY_STEPS = [
  { id: "placed", label: "Placed", icon: "📝" },
  { id: "confirmed", label: "Confirmed", icon: "✅" },
  { id: "preparing", label: "Preparing", icon: "👨‍🍳" },
  { id: "out_for_delivery", label: "Out for Delivery", icon: "🛵" },
  { id: "delivered", label: "Delivered", icon: "🎉" },
];

const PICKUP_STEPS = [
  { id: "placed", label: "Placed", icon: "📝" },
  { id: "confirmed", label: "Confirmed", icon: "✅" },
  { id: "preparing", label: "Preparing", icon: "👨‍🍳" },
  { id: "ready_for_pickup", label: "Ready for Pickup", icon: "🛍️" },
  { id: "delivered", label: "Picked Up", icon: "🎉" },
];

export function StatusTimeline({ status, orderType }: StatusTimelineProps) {
  if (status === "cancelled") {
    return (
      <div className="bg-red/10 border-2 border-red rounded-2xl p-6 text-center space-y-2 my-4 shadow-lg">
        <span className="text-4xl">❌</span>
        <h3 className="font-anton text-2xl text-red uppercase tracking-wider">
          Order Cancelled
        </h3>
        <p className="font-work text-sm text-cream/80 max-w-md mx-auto">
          This order has been cancelled by the restaurant or customer support. Please contact the branch directly for inquiries.
        </p>
      </div>
    );
  }

  const steps = orderType === "pickup" ? PICKUP_STEPS : DELIVERY_STEPS;
  
  // Find index of current status
  const currentStepIndex = steps.findIndex((step) => step.id === status);
  // If status is unknown, default to index 0
  const activeIndex = currentStepIndex !== -1 ? currentStepIndex : 0;

  return (
    <div className="w-full py-6 px-2">
      <div className="relative flex items-center justify-between max-w-3xl mx-auto">
        {/* Background Connecting Line */}
        <div className="absolute top-5 left-6 right-6 h-1 bg-cream/15 -z-0 rounded-full" />

        {/* Active Progress Line */}
        <div
          className="absolute top-5 left-6 h-1 bg-orange -z-0 rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${(activeIndex / (steps.length - 1)) * 100}%`,
          }}
        />

        {/* Step Nodes */}
        {steps.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isActive = idx === activeIndex;
          const isPending = idx > activeIndex;

          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center group flex-1 text-center"
            >
              {/* Step Circle */}
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center font-mono text-sm transition-all duration-300 ${
                  isActive
                    ? "bg-orange text-ink ring-4 ring-orange/30 scale-110 shadow-lg shadow-orange/30 animate-pulse"
                    : isCompleted
                    ? "bg-orange text-ink shadow-md"
                    : "bg-ink border-2 border-cream/20 text-cream/40"
                }`}
              >
                <span>{step.icon}</span>
              </div>

              {/* Step Label */}
              <div className="mt-3 space-y-0.5">
                <p
                  className={`font-anton text-xs uppercase tracking-wider transition-colors ${
                    isActive
                      ? "text-orange"
                      : isCompleted
                      ? "text-cream"
                      : "text-cream/40"
                  }`}
                >
                  {step.label}
                </p>
                {isActive && (
                  <span className="inline-block px-2 py-0.5 bg-orange/20 text-orange font-mono text-[10px] rounded-full uppercase font-bold tracking-widest border border-orange/30">
                    Current
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
