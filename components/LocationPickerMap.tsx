"use client";

import { useState, useEffect } from "react";
import { calculateHaversineDistance } from "@/lib/haversine";

interface LocationPickerMapProps {
  branchLat: number;
  branchLng: number;
  branchName: string;
  deliveryRadiusKm: number;
  onLocationSelect?: (lat: number, lng: number, distanceKm: number) => void;
}

export default function LocationPickerMap({
  branchLat,
  branchLng,
  branchName,
  deliveryRadiusKm,
  onLocationSelect,
}: LocationPickerMapProps) {
  // Default pin position near branch
  const [pinLat, setPinLat] = useState<number>(branchLat + 0.01);
  const [pinLng, setPinLng] = useState<number>(branchLng + 0.01);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [isOutOfRadius, setIsOutOfRadius] = useState<boolean>(false);

  // Recalculate distance whenever pin or branch changes
  useEffect(() => {
    const dist = calculateHaversineDistance(branchLat, branchLng, pinLat, pinLng);
    setDistanceKm(dist);
    const out = dist > deliveryRadiusKm;
    setIsOutOfRadius(out);
    onLocationSelect?.(pinLat, pinLng, dist);
  }, [pinLat, pinLng, branchLat, branchLng, deliveryRadiusKm, onLocationSelect]);

  // Adjust pin location manually or by predefined offset points
  const handleOffsetClick = (offsetLat: number, offsetLng: number) => {
    const newLat = parseFloat((branchLat + offsetLat).toFixed(4));
    const newLng = parseFloat((branchLng + offsetLng).toFixed(4));
    setPinLat(newLat);
    setPinLng(newLng);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="font-anton text-base text-cream uppercase tracking-wider flex items-center gap-1.5">
          <span>📍 Drop Delivery Pin</span>
        </label>
        <span className="font-mono text-xs text-orange">
          Distance from {branchName}: <strong>{distanceKm} km</strong>
        </span>
      </div>

      {/* Interactive Map Visualizer */}
      <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-ink border-2 border-cream/20 shadow-inner flex flex-col items-center justify-between p-4 group">
        {/* Background Grid Pattern simulating map */}
        <div className="absolute inset-0 bg-[radial-gradient(#1E8C86_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

        {/* Branch Marker */}
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
          <span className="w-8 h-8 rounded-full bg-teal-bright text-cream flex items-center justify-center font-bold text-xs shadow-lg border border-cream">
            🏠
          </span>
          <span className="font-mono text-[10px] bg-ink/90 text-cream px-2 py-0.5 rounded mt-1 border border-cream/20 whitespace-nowrap">
            {branchName} Branch
          </span>
        </div>

        {/* Radius Circle Indicator */}
        <div
          className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-orange/40 bg-orange/5 pointer-events-none transition-all"
          style={{
            width: `${Math.min(deliveryRadiusKm * 40, 240)}px`,
            height: `${Math.min(deliveryRadiusKm * 40, 240)}px`,
          }}
        />

        {/* Dynamic User Pin Marker */}
        <div
          className={`absolute transition-all duration-300 flex flex-col items-center z-20 cursor-pointer ${
            isOutOfRadius ? "top-12 right-12" : "top-1/3 right-1/4"
          }`}
        >
          <span className="text-3xl animate-bounce">📍</span>
          <span className="font-mono text-[10px] bg-orange text-ink font-bold px-2 py-0.5 rounded shadow">
            Your Delivery Location
          </span>
        </div>

        {/* Map Control Buttons */}
        <div className="w-full flex items-center justify-between z-20 relative pt-2">
          <span className="font-mono text-[10px] text-cream/60">
            Coordinates: {pinLat.toFixed(4)}, {pinLng.toFixed(4)}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleOffsetClick(0.015, 0.015)}
              className="px-2.5 py-1 bg-ink/80 hover:bg-ink text-cream text-[11px] font-mono rounded border border-cream/20"
            >
              Set Nearby (2 km)
            </button>
            <button
              type="button"
              onClick={() => handleOffsetClick(0.065, 0.065)}
              className="px-2.5 py-1 bg-ink/80 hover:bg-ink text-orange text-[11px] font-mono rounded border border-orange/30"
            >
              Set Far (7 km)
            </button>
          </div>
        </div>

        <div className="z-20 text-center w-full pb-1">
          <p className="font-work text-xs text-cream/70">
            Click quick test buttons above or confirm coordinates to test radius calculation.
          </p>
        </div>
      </div>

      {/* Out of Delivery Radius Warning (Non-blocking) */}
      {isOutOfRadius && (
        <div className="p-4 rounded-xl bg-orange/15 border-2 border-orange text-cream space-y-1 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-orange font-anton text-sm uppercase tracking-wide">
            <span>⚠️ Delivery Zone Warning</span>
          </div>
          <p className="font-work text-xs text-cream/90 leading-relaxed">
            This address ({distanceKm} km away) may be outside our standard {deliveryRadiusKm} km delivery zone for <strong className="text-orange">{branchName}</strong>. You can still place the order, or switch to a closer branch for faster delivery.
          </p>
        </div>
      )}
    </div>
  );
}
