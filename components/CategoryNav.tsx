"use client";

import { useState, useEffect } from "react";

export interface CategoryNavItem {
  id: string;
  name: string;
}

interface CategoryNavProps {
  categories: CategoryNavItem[];
}

export default function CategoryNav({ categories }: CategoryNavProps) {
  const [activeId, setActiveId] = useState<string>(categories[0]?.id || "");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;

      for (let i = categories.length - 1; i >= 0; i--) {
        const cat = categories[i];
        const element = document.getElementById(`category-${cat.id}`);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveId(cat.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [categories]);

  const scrollToCategory = (id: string) => {
    setActiveId(id);
    const element = document.getElementById(`category-${id}`);
    if (element) {
      const yOffset = -140; // Offset for sticky headers
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="sticky top-[61px] z-30 bg-ink/95 backdrop-blur-md border-b border-cream/15 py-3 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1">
        {categories.map((category) => {
          const isActive = activeId === category.id;
          return (
            <button
              key={category.id}
              onClick={() => scrollToCategory(category.id)}
              className={`px-4 py-2 rounded-full font-anton text-sm uppercase tracking-wider whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                isActive
                  ? "bg-orange text-ink shadow-md scale-105"
                  : "bg-cream/10 text-cream hover:bg-cream/20 hover:text-orange"
              }`}
            >
              {category.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
