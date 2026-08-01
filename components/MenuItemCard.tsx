"use client";

import { useState } from "react";
import Image from "next/image";
import { MenuItemWithAddons } from "./ItemCustomizationModal";

interface MenuItemCardProps {
  item: MenuItemWithAddons;
  onSelect: (item: MenuItemWithAddons) => void;
}

export default function MenuItemCard({ item, onSelect }: MenuItemCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={() => onSelect(item)}
      className="bg-cream text-ink rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:-translate-y-1.5 transition-all duration-300 border border-cream/90 hover:border-orange cursor-pointer group relative overflow-hidden"
    >
      <div className="space-y-3">
        {/* Image Container */}
        <div className="relative w-full h-44 rounded-xl overflow-hidden bg-ink/10 border border-ink/5">
          {item.imageUrl && !imgError ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-teal-deep/10 text-teal-deep p-4 text-center">
              <span className="text-3xl mb-1">🍗</span>
              <span className="font-anton text-xs uppercase tracking-wider">
                {item.name}
              </span>
            </div>
          )}

          {/* Floating Badges */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
            {item.isSignature && (
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-orange text-ink uppercase shadow">
                Signature
              </span>
            )}
            {item.isNew && (
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-red text-cream uppercase shadow">
                New
              </span>
            )}
          </div>
        </div>

        {/* Name & Description */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-anton text-2xl text-ink group-hover:text-teal-deep transition-colors leading-tight">
              {item.name}
            </h3>
          </div>
          <p className="font-work text-xs text-ink/75 line-clamp-2 leading-relaxed">
            {item.description || "Freshly cooked with Seven Sides signature seasonings."}
          </p>
        </div>

        {/* Heat Gauge Tag */}
        {item.hasHeatGauge && (
          <div className="inline-flex items-center gap-1 text-[11px] font-mono text-red font-semibold bg-red/10 px-2 py-0.5 rounded border border-red/20">
            <span>🌶️ Customizable Heat Gauge</span>
          </div>
        )}

        {/* Flavor Chips preview */}
        {item.flavorOptions && item.flavorOptions.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap pt-1">
            <span className="font-mono text-[10px] text-ink/60">Flavors:</span>
            {item.flavorOptions.map((flavor) => (
              <span
                key={flavor}
                className="font-work text-[10px] px-1.5 py-0.5 rounded bg-ink/5 text-ink/80 border border-ink/10"
              >
                {flavor}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Pricing & Add Button */}
      <div className="pt-4 border-t border-ink/10 flex items-center justify-between mt-4">
        <span className="font-mono text-xl font-bold text-ink">
          Rs. {item.price.toLocaleString()}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(item);
          }}
          className="px-4 py-2 bg-ink text-cream group-hover:bg-orange group-hover:text-ink font-anton text-xs uppercase tracking-wider rounded-xl transition-all shadow active:scale-95 flex items-center gap-1"
        >
          <span>Add</span>
          <span className="font-bold text-sm">+</span>
        </button>
      </div>
    </div>
  );
}
