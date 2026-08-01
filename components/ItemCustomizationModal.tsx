"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useCartStore } from "@/lib/cartStore";

export interface AddonOption {
  id: string;
  name: string;
  price: number;
}

export interface MenuItemWithAddons {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  hasHeatGauge: boolean;
  flavorOptions: string[];
  isNew: boolean;
  isSignature: boolean;
  addonOptions: AddonOption[];
}

interface ItemCustomizationModalProps {
  item: MenuItemWithAddons | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (customizedItem: any) => void;
}

const HEAT_LEVELS = [
  { level: 1, name: "No Heat", description: "Classic, zero spice", icon: "🟢" },
  { level: 2, name: "Mild Heat", description: "Gentle warm kick", icon: "🟡" },
  { level: 3, name: "Country Heat", description: "Signature hot spice", icon: "🟠" },
  { level: 4, name: "Uncommon Heat", description: "Extreme fire 🔥", icon: "🔴" },
];

export default function ItemCustomizationModal({
  item,
  isOpen,
  onClose,
  onAddToCart,
}: ItemCustomizationModalProps) {
  const [selectedHeat, setSelectedHeat] = useState<string>("Country Heat");
  const [selectedFlavor, setSelectedFlavor] = useState<string>("");
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);

  const addItemToCart = useCartStore((state) => state.addItem);

  // Reset defaults when item changes
  useEffect(() => {
    if (item) {
      setSelectedHeat("Country Heat");
      setSelectedFlavor(item.flavorOptions[0] || "");
      setSelectedAddonIds([]);
      setQuantity(1);
      setAddedAnimation(false);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const toggleAddon = (id: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((aId) => aId !== id) : [...prev, id]
    );
  };

  // Calculate price
  const selectedAddons = item.addonOptions.filter((addon) =>
    selectedAddonIds.includes(addon.id)
  );
  const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
  const unitPrice = item.price + addonsTotal;
  const runningTotal = unitPrice * quantity;

  const handleAddToCart = () => {
    setAddedAnimation(true);

    addItemToCart({
      menuItemId: item.id,
      name: item.name,
      unitPrice,
      qty: quantity,
      selectedHeat: item.hasHeatGauge ? selectedHeat : null,
      selectedFlavor: item.flavorOptions.length > 0 ? selectedFlavor : null,
      selectedAddons: selectedAddons.map((a) => ({
        id: a.id,
        name: a.name,
        price: a.price,
      })),
      imageUrl: item.imageUrl,
    });

    if (onAddToCart) {
      onAddToCart({ item, qty: quantity, unitPrice, runningTotal });
    }

    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-teal-deep border-t-2 sm:border-2 border-orange/40 rounded-t-3xl sm:rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl text-cream space-y-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-ink/60 hover:bg-ink text-cream/70 hover:text-cream flex items-center justify-center font-bold text-lg transition-colors z-10"
        >
          ✕
        </button>

        {/* Item Header */}
        <div className="flex gap-4 items-start">
          {item.imageUrl && (
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden flex-shrink-0 bg-ink border border-cream/20">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover"
                sizes="112px"
              />
            </div>
          )}
          <div className="space-y-1 text-left flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-anton text-2xl sm:text-3xl text-cream tracking-wide">
                {item.name}
              </h2>
              {item.isSignature && (
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-orange text-ink font-bold uppercase">
                  Signature
                </span>
              )}
              {item.isNew && (
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-red text-cream font-bold uppercase">
                  New
                </span>
              )}
            </div>
            <p className="font-work text-xs text-cream/80 leading-relaxed">
              {item.description || "Crafted fresh to order with Seven Sides signature flavor profile."}
            </p>
            <p className="font-mono text-lg font-bold text-orange pt-1">
              Rs. {item.price.toLocaleString()}
            </p>
          </div>
        </div>

        {/* 1. HEAT GAUGE SELECTOR */}
        {item.hasHeatGauge && (
          <div className="space-y-3 pt-2 border-t border-cream/15">
            <div className="flex items-center justify-between">
              <label className="font-anton text-base text-cream uppercase tracking-wider flex items-center gap-1.5">
                <span>🌶️ Select Heat Level</span>
              </label>
              <span className="font-mono text-xs text-orange font-semibold">
                {selectedHeat}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {HEAT_LEVELS.map((heat) => {
                const isSelected = selectedHeat === heat.name;
                return (
                  <button
                    key={heat.level}
                    type="button"
                    onClick={() => setSelectedHeat(heat.name)}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? "bg-orange text-ink border-orange shadow-lg scale-105"
                        : "bg-ink/50 text-cream border-cream/15 hover:border-orange/60"
                    }`}
                  >
                    <span className="text-xl">{heat.icon}</span>
                    <span className="font-anton text-xs uppercase tracking-wide">
                      {heat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. FLAVOR OPTIONS CHIPS */}
        {item.flavorOptions && item.flavorOptions.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-cream/15">
            <div className="flex items-center justify-between">
              <label className="font-anton text-base text-cream uppercase tracking-wider">
                ✨ Choose Flavor
              </label>
              <span className="font-mono text-xs text-orange">Required</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {item.flavorOptions.map((flavor) => {
                const isSelected = selectedFlavor === flavor;
                return (
                  <button
                    key={flavor}
                    type="button"
                    onClick={() => setSelectedFlavor(flavor)}
                    className={`px-4 py-2 rounded-full font-work text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-orange text-ink shadow-md scale-105"
                        : "bg-ink/60 text-cream/80 border border-cream/15 hover:border-orange"
                    }`}
                  >
                    {flavor}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. ADDON OPTIONS CHECKBOXES */}
        {item.addonOptions && item.addonOptions.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-cream/15">
            <label className="font-anton text-base text-cream uppercase tracking-wider block">
              ➕ Extra Add-Ons
            </label>
            <div className="space-y-2">
              {item.addonOptions.map((addon) => {
                const isChecked = selectedAddonIds.includes(addon.id);
                return (
                  <label
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      isChecked
                        ? "bg-ink/80 border-orange text-cream"
                        : "bg-ink/40 border-cream/15 text-cream/80 hover:border-cream/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center font-bold text-xs ${
                          isChecked
                            ? "bg-orange text-ink border-orange"
                            : "border-cream/40"
                        }`}
                      >
                        {isChecked && "✓"}
                      </div>
                      <span className="font-work text-xs font-medium">
                        {addon.name}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-orange font-semibold">
                      + Rs. {addon.price.toLocaleString()}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. QUANTITY STEPPER & RUNNING TOTAL */}
        <div className="pt-4 border-t border-cream/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 bg-ink/70 border border-cream/20 rounded-xl p-1.5">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-lg bg-cream/10 hover:bg-cream/20 text-cream font-bold flex items-center justify-center transition-colors"
            >
              -
            </button>
            <span className="font-mono font-bold text-lg text-cream min-w-[24px] text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-lg bg-cream/10 hover:bg-cream/20 text-cream font-bold flex items-center justify-center transition-colors"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-anton text-base uppercase tracking-wider transition-all duration-200 shadow-xl flex items-center justify-center gap-2 ${
              addedAnimation
                ? "bg-teal-bright text-cream scale-105"
                : "bg-orange hover:bg-orange/90 text-ink active:scale-95"
            }`}
          >
            <span>{addedAnimation ? "✓ Added to Cart" : "Add to Cart"}</span>
            <span className="font-mono font-bold">
              • Rs. {runningTotal.toLocaleString()}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
