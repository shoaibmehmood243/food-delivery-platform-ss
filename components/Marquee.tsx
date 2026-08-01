"use client";

interface MarqueeProps {
  items?: string[];
}

export default function Marquee({ items }: MarqueeProps) {
  const defaultItems = [
    "🔥 THE SANDO — SIGNATURE HOT CHICKEN",
    "⚡ CASH ON DELIVERY AVAILABLE ACROSS LAHORE",
    "🍗 100% FRESH CRISPY TENDERS & SLIDERS",
    "🥤 HAND SPUN SHAKES & SS TREATS",
    "🌶️ CUSTOMIZABLE HEAT GAUGE LEVELS",
    "📍 DHA PHASE 5 • LAKE CITY • CANTT",
  ];

  const displayItems = items && items.length > 0 ? items : defaultItems;
  // Duplicate array to ensure smooth continuous scrolling loop
  const repeatedItems = [...displayItems, ...displayItems, ...displayItems];

  return (
    <div className="w-full bg-orange text-ink overflow-hidden py-3 border-y border-ink/20 shadow-inner">
      <div className="flex w-max animate-marquee space-x-8 items-center font-anton text-sm sm:text-base tracking-widest uppercase">
        {repeatedItems.map((text, idx) => (
          <div key={idx} className="flex items-center space-x-8 flex-shrink-0">
            <span>{text}</span>
            <span className="text-ink/40 text-xs">★</span>
          </div>
        ))}
      </div>
    </div>
  );
}
