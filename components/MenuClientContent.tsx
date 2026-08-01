"use client";

import { useState } from "react";
import CategoryNav from "./CategoryNav";
import MenuItemCard from "./MenuItemCard";
import ItemCustomizationModal, {
  MenuItemWithAddons,
} from "./ItemCustomizationModal";

export interface CategoryWithItems {
  id: string;
  name: string;
  sortOrder: number;
  menuItems: MenuItemWithAddons[];
}

interface MenuClientContentProps {
  categories: CategoryWithItems[];
}

export default function MenuClientContent({ categories }: MenuClientContentProps) {
  const [selectedItem, setSelectedItem] = useState<MenuItemWithAddons | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cartNotification, setCartNotification] = useState<string | null>(null);

  const handleSelectItem = (item: MenuItemWithAddons) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleAddToCart = (configuredItem: any) => {
    // Notification popup feedback
    setCartNotification(
      `Added ${configuredItem.qty}x ${configuredItem.item.name} to cart!`
    );
    setTimeout(() => {
      setCartNotification(null);
    }, 3000);
  };

  return (
    <>
      {/* Sticky Category Sub-Nav */}
      <CategoryNav
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />

      {/* Cart Notification Toast */}
      {cartNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-orange text-ink px-5 py-3 rounded-xl font-anton text-sm uppercase tracking-wide shadow-2xl animate-in slide-in-from-bottom-5 flex items-center gap-2">
          <span>🛒</span>
          <span>{cartNotification}</span>
        </div>
      )}

      {/* Category Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-16">
        {categories.map((category) => (
          <section
            key={category.id}
            id={`category-${category.id}`}
            className="space-y-6 scroll-mt-36"
          >
            <div className="flex items-center gap-4 border-b border-cream/15 pb-4">
              <span className="w-3 h-8 bg-orange rounded-full" />
              <h2 className="font-anton text-3xl sm:text-4xl text-cream uppercase tracking-wide">
                {category.name}
              </h2>
              <span className="font-mono text-xs text-cream/50">
                ({category.menuItems.length} items)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.menuItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onSelect={handleSelectItem}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Customization Bottom Sheet / Modal */}
      <ItemCustomizationModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={handleAddToCart}
      />
    </>
  );
}
