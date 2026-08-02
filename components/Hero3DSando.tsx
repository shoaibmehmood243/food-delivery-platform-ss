"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/cartStore";

interface Hero3DSandoProps {
  sandoMenuItem?: {
    id: string;
    name: string;
    price: number;
    description?: string | null;
    hasHeatGauge?: boolean;
    flavorOptions?: string[];
  } | null;
}

const HEAT_LEVELS = [
  { id: "no_heat", name: "No Heat", icon: "🟢", glowColor: "rgba(20, 184, 166, 0.4)", accent: "text-teal-bright" },
  { id: "country_heat", name: "Country Heat", icon: "🟡", glowColor: "rgba(245, 158, 11, 0.5)", accent: "text-orange" },
  { id: "screamer", name: "Screamer", icon: "🌶️🔥", glowColor: "rgba(225, 29, 72, 0.6)", accent: "text-red" },
];

export default function Hero3DSando({ sandoMenuItem }: Hero3DSandoProps) {
  const [activeTab, setActiveTab] = useState<"sando" | "tenders">("sando");
  const [selectedHeat, setSelectedHeat] = useState<string>("Country Heat");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [addedToast, setAddedToast] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const addItemToCart = useCartStore((state) => state.addItem);

  // 3D Parallax Mouse Tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const currentHeatObj =
    HEAT_LEVELS.find((h) => h.name === selectedHeat) || HEAT_LEVELS[1];

  const handleQuickAdd = () => {
    const isSando = activeTab === "sando";
    addItemToCart({
      menuItemId: sandoMenuItem?.id || (isSando ? "sando-default" : "tenders-default"),
      name: isSando ? "The Sando" : "Red Tenders (5 Pcs)",
      unitPrice: isSando ? (sandoMenuItem?.price || 1070) : 1390,
      qty: 1,
      selectedHeat: selectedHeat,
      selectedFlavor: "Original Comeback",
      selectedAddons: [],
    });

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  return (
    <section className="relative overflow-hidden bg-teal-deep pt-10 pb-20 px-4 sm:px-8 font-work border-b border-cream/10 select-none">
      {/* Dynamic Photorealistic Ambient Glow */}
      <div
        className="absolute inset-0 transition-all duration-700 pointer-events-none blur-3xl"
        style={{
          background: `radial-gradient(circle at 60% 40%, ${currentHeatObj.glowColor}, transparent 70%)`,
        }}
      />

      {/* Floating Ember Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-10 w-2 h-2 rounded-full bg-orange animate-ping opacity-60" />
        <div className="absolute top-2/3 right-16 w-3 h-3 rounded-full bg-red animate-pulse opacity-70" />
        <div className="absolute bottom-10 left-1/3 w-2 h-2 rounded-full bg-cream/40 animate-bounce" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left Column: Headline & Heat Selector */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ink/80 border border-orange/40 text-orange font-mono text-xs uppercase tracking-widest shadow-lg">
            <span>🔥</span>
            <span>Lahore&apos;s Famous Hot Chicken Destination</span>
          </div>

          <div className="space-y-3">
            <h1 className="font-anton text-5xl sm:text-7xl lg:text-8xl text-cream uppercase tracking-tight leading-none drop-shadow-2xl">
              {activeTab === "sando" ? (
                <>
                  THE <span className="text-orange underline decoration-orange/40">SANDO</span>
                </>
              ) : (
                <>
                  HOT <span className="text-orange underline decoration-orange/40">TENDERS</span>
                </>
              )}
            </h1>
            <p className="font-work text-base sm:text-lg text-cream/90 max-w-xl leading-relaxed">
              {activeTab === "sando"
                ? "Thick golden-toasted house bread packed with juicy hot crimson chicken tenders, overflowing melted cheese fondue, crunchy pickles, and comeback sauce."
                : "5 pieces of thick, hand-breaded crimson hot chicken tenders fried to crispy perfection, served with house-made comeback dip."}
            </p>
          </div>

          {/* Product Switcher Tabs */}
          <div className="flex items-center gap-3 p-1.5 bg-ink/80 rounded-2xl border border-cream/15 max-w-xs">
            <button
              type="button"
              onClick={() => setActiveTab("sando")}
              className={`flex-1 py-2 rounded-xl font-anton text-xs uppercase tracking-wider transition-all ${activeTab === "sando"
                  ? "bg-orange text-ink shadow-lg font-bold"
                  : "text-cream/70 hover:text-cream"
                }`}
            >
              🍔 The Sando
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("tenders")}
              className={`flex-1 py-2 rounded-xl font-anton text-xs uppercase tracking-wider transition-all ${activeTab === "tenders"
                  ? "bg-orange text-ink shadow-lg font-bold"
                  : "text-cream/70 hover:text-cream"
                }`}
            >
              🍗 5-Pc Tenders
            </button>
          </div>

          {/* Heat Selector Dial */}
          <div className="bg-ink/80 border border-cream/15 rounded-3xl p-5 space-y-3 shadow-2xl max-w-md backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs font-anton text-cream/80 uppercase">
              <span>Select Heat Level:</span>
              <span className={`font-mono ${currentHeatObj.accent}`}>
                {currentHeatObj.icon} {currentHeatObj.name}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {HEAT_LEVELS.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setSelectedHeat(h.name)}
                  className={`py-2.5 px-3 rounded-2xl font-anton text-xs uppercase tracking-wider transition-all border ${selectedHeat === h.name
                      ? "bg-orange text-ink font-bold shadow-lg scale-105 border-orange"
                      : "bg-teal-deep/60 text-cream/70 hover:text-cream hover:bg-cream/10 border-cream/15"
                    }`}
                >
                  {h.icon} {h.name}
                </button>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={handleQuickAdd}
              className="px-8 py-4 bg-orange hover:bg-orange/90 text-ink font-anton text-base uppercase tracking-wider rounded-2xl shadow-2xl transition-transform active:scale-95 flex items-center gap-3"
            >
              <span>Order {activeTab === "sando" ? "The Sando" : "Hot Tenders"}</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-ink text-cream font-mono text-sm font-bold">
                Rs. {activeTab === "sando" ? (sandoMenuItem?.price || 1070) : 1390}
              </span>
            </button>

            <Link
              href="/menu"
              className="px-6 py-4 bg-ink/70 hover:bg-ink text-cream font-anton text-sm uppercase tracking-wider rounded-2xl border border-cream/20 transition-all shadow-lg"
            >
              Explore Full Menu →
            </Link>
          </div>

          {/* Toast Notification */}
          {addedToast && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-300 border border-green-500/40 rounded-xl font-mono text-xs animate-in fade-in">
              <span>🎉</span>
              <span>
                Added {activeTab === "sando" ? "The Sando" : "Red Tenders"} ({selectedHeat}) to your cart!
              </span>
            </div>
          )}
        </div>

        {/* Right Column: PURE FLOATING 3D FOOD & TEXT SHOWCASE (NO BG / NO BORDER) */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-full max-w-md h-[380px] sm:h-[420px] flex items-center justify-center cursor-pointer group"
            style={{ perspective: "1000px" }}
          >
            {/* 3D Rotatable Floating Stage */}
            <div
              className="relative w-full h-full flex flex-col items-center justify-center transition-transform duration-200 ease-out"
              style={{
                transform: `rotateX(${mousePos.y * -16}deg) rotateY(${mousePos.x * 16}deg)`,
                transformStyle: "preserve-3d",
              }}
            >
              {/* Seamless Floating Food Image (Clean, No Shadows, No Auras) */}
              <div
                className="relative w-64 sm:w-[340px] h-[280px] sm:h-[340px] flex items-center justify-center transition-transform duration-300"
                style={{
                  transform: "translateZ(20px)",
                }}
              >
                <Image
                  src={activeTab === "sando" ? "/sando_hero.png" : "/tenders_hero.png"}
                  alt={activeTab === "sando" ? "Seven Sides The Sando" : "Seven Sides Hot Tenders"}
                  fill
                  priority
                  className="object-contain"
                  sizes="340px"
                />
              </div>

              {/* FLOATING 3D TEXT & PRICE BADGES */}
              <div
                className="absolute top-2 left-2 sm:left-4 z-20 transition-transform duration-300 pointer-events-none"
                style={{ transform: "translateZ(45px)" }}
              >
                <span className="px-3.5 py-1.5 rounded-full bg-ink/80 backdrop-blur-md border border-orange/50 font-mono text-xs font-bold text-orange flex items-center gap-1.5 shadow-2xl">
                  <span>{currentHeatObj.icon}</span>
                  <span>{currentHeatObj.name}</span>
                </span>
              </div>

              <div
                className="absolute bottom-4 right-2 sm:right-4 z-20 transition-transform duration-300 pointer-events-none"
                style={{ transform: "translateZ(45px)" }}
              >
                <span className="px-4 py-2 rounded-full bg-orange text-ink font-anton text-sm uppercase shadow-2xl tracking-wider font-bold">
                  Rs. {activeTab === "sando" ? 1070 : 1390}
                </span>
              </div>

              <div
                className="absolute bottom-4 left-2 sm:left-4 z-20 transition-transform duration-300 pointer-events-none"
                style={{ transform: "translateZ(35px)" }}
              >
                <div className="bg-ink/80 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-cream/20 font-mono text-[11px] text-cream shadow-2xl">
                  <span className="text-orange font-bold">Seven Sides:</span>{" "}
                  {activeTab === "sando" ? "Artisan Toast & Cheese Fondue" : "Hand-Breaded Crimson Tenders"}
                </div>
              </div>
            </div>
          </div>

          <p className="mt-2 font-mono text-[11px] text-cream/50">
            💡 Hover to levitate the food &amp; badges in 3D
          </p>
        </div>
      </div>
    </section>
  );
}
