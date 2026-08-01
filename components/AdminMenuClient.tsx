"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  sortOrder: number;
}

interface AddonOption {
  id?: string;
  name: string;
  price: number;
}

interface MenuItem {
  id: string;
  categoryId: string;
  category?: Category;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  hasHeatGauge: boolean;
  flavorOptions: string[];
  isActive: boolean;
  isNew: boolean;
  isSignature: boolean;
  addonOptions: AddonOption[];
}

interface AdminMenuClientProps {
  initialCategories: Category[];
  initialItems: MenuItem[];
}

export default function AdminMenuClient({
  initialCategories,
  initialItems,
}: AdminMenuClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"items" | "categories">("items");

  // Category State
  const [newCatName, setNewCatName] = useState("");
  const [newCatSortOrder, setNewCatSortOrder] = useState<number>(categories.length + 1);

  // Item Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form Fields for Item Modal
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState("");
  const [hasHeatGauge, setHasHeatGauge] = useState(false);
  const [flavorString, setFlavorString] = useState("");
  const [isNew, setIsNew] = useState(false);
  const [isSignature, setIsSignature] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [addons, setAddons] = useState<AddonOption[]>([]);
  const [newAddonName, setNewAddonName] = useState("");
  const [newAddonPrice, setNewAddonPrice] = useState<number>(100);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const router = useRouter();

  // Reset Item Form
  const openNewItemModal = () => {
    setEditingItem(null);
    setName("");
    setCategoryId(categories[0]?.id || "");
    setDescription("");
    setPrice(1000);
    setImageUrl("");
    setHasHeatGauge(false);
    setFlavorString("");
    setIsNew(false);
    setIsSignature(false);
    setIsActive(true);
    setAddons([]);
    setIsItemModalOpen(true);
  };

  const openEditItemModal = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategoryId(item.categoryId);
    setDescription(item.description || "");
    setPrice(item.price);
    setImageUrl(item.imageUrl || "");
    setHasHeatGauge(item.hasHeatGauge);
    setFlavorString(item.flavorOptions ? item.flavorOptions.join(", ") : "");
    setIsNew(item.isNew);
    setIsSignature(item.isSignature);
    setIsActive(item.isActive);
    setAddons(item.addonOptions || []);
    setIsItemModalOpen(true);
  };

  // Image Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setSaving(true);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.imageUrl) {
        setImageUrl(data.imageUrl);
      } else {
        alert(data.error || "Image upload failed");
      }
    } catch (err) {
      alert("Error uploading image");
    } finally {
      setSaving(false);
    }
  };

  // Save Item Handler
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    const flavorOptions = flavorString
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload = {
      name,
      categoryId,
      description,
      price,
      imageUrl,
      hasHeatGauge,
      flavorOptions,
      isNew,
      isSignature,
      isActive,
      addonOptions: addons,
    };

    try {
      const url = editingItem
        ? `/api/admin/menu-items/${editingItem.id}`
        : "/api/admin/menu-items";
      const method = editingItem ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save menu item");
      }

      if (editingItem) {
        setItems(items.map((i) => (i.id === data.item.id ? data.item : i)));
      } else {
        setItems([data.item, ...items]);
      }

      setIsItemModalOpen(false);
      setMsg({ text: "Menu item saved successfully!", type: "success" });
      router.refresh();
    } catch (err: any) {
      setMsg({ text: err.message || "Error saving item", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Toggle Item Active Status (Sold out)
  const handleToggleItemActive = async (item: MenuItem) => {
    try {
      const newActive = !item.isActive;
      const res = await fetch(`/api/admin/menu-items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newActive }),
      });

      if (res.ok) {
        setItems(
          items.map((i) => (i.id === item.id ? { ...i, isActive: newActive } : i))
        );
      }
    } catch (err) {
      console.error("Failed to toggle item status:", err);
    }
  };

  // Delete Item
  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    try {
      const res = await fetch(`/api/admin/menu-items/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems(items.filter((i) => i.id !== id));
      }
    } catch (err) {
      alert("Failed to delete item");
    }
  };

  // Add Category Handler
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      setSaving(true);
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName, sortOrder: newCatSortOrder }),
      });

      const data = await res.json();
      if (data.success && data.category) {
        setCategories([...categories, data.category]);
        setNewCatName("");
        setNewCatSortOrder(categories.length + 2);
      }
    } catch (err) {
      alert("Failed to add category");
    } finally {
      setSaving(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure? Items in this category will also be removed!")) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCategories(categories.filter((c) => c.id !== id));
      }
    } catch (err) {
      alert("Failed to delete category");
    }
  };

  const filteredItems =
    selectedCatFilter === "all"
      ? items
      : items.filter((i) => i.categoryId === selectedCatFilter);

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Toggle */}
      <div className="bg-ink/60 border border-cream/15 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl">
        <div>
          <h1 className="font-anton text-3xl sm:text-4xl text-cream uppercase tracking-wide">
            Menu Management
          </h1>
          <p className="font-work text-xs text-cream/70 mt-1">
            Create, edit, toggle availability, or upload photos for Seven Sides menu items.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-ink p-1 rounded-xl border border-cream/15 flex items-center">
            <button
              onClick={() => setActiveTab("items")}
              className={`px-4 py-2 rounded-lg font-anton text-xs uppercase tracking-wider ${
                activeTab === "items"
                  ? "bg-orange text-ink shadow"
                  : "text-cream/70 hover:text-cream"
              }`}
            >
              🍔 Menu Items ({items.length})
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`px-4 py-2 rounded-lg font-anton text-xs uppercase tracking-wider ${
                activeTab === "categories"
                  ? "bg-orange text-ink shadow"
                  : "text-cream/70 hover:text-cream"
              }`}
            >
              📁 Categories ({categories.length})
            </button>
          </div>

          {activeTab === "items" && (
            <button
              onClick={openNewItemModal}
              className="px-4 py-2.5 bg-orange text-ink font-anton text-xs uppercase tracking-wider rounded-xl shadow-lg hover:bg-orange/90 transition-transform active:scale-95"
            >
              + Add Menu Item
            </button>
          )}
        </div>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-2xl font-work text-xs text-center border shadow ${
            msg.type === "success"
              ? "bg-green-500/20 text-green-300 border-green-500/40"
              : "bg-red/20 text-red border-red/40"
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* ITEMS TAB CONTENT */}
      {activeTab === "items" && (
        <div className="space-y-6">
          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCatFilter("all")}
              className={`px-4 py-2 rounded-xl font-anton text-xs uppercase tracking-wider whitespace-nowrap transition-all ${
                selectedCatFilter === "all"
                  ? "bg-cream text-ink shadow-lg font-bold"
                  : "bg-ink/50 text-cream/70 hover:text-cream border border-cream/15"
              }`}
            >
              All Categories ({items.length})
            </button>

            {categories.map((cat) => {
              const count = items.filter((i) => i.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCatFilter(cat.id)}
                  className={`px-4 py-2 rounded-xl font-anton text-xs uppercase tracking-wider whitespace-nowrap transition-all ${
                    selectedCatFilter === cat.id
                      ? "bg-orange text-ink shadow-lg font-bold"
                      : "bg-ink/50 text-cream/70 hover:text-cream border border-cream/15"
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`bg-ink/60 border rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between transition-all ${
                  item.isActive
                    ? "border-cream/15 hover:border-orange/40"
                    : "border-red/40 opacity-60 bg-red/5"
                }`}
              >
                <div className="space-y-3">
                  {/* Thumbnail & Badges */}
                  <div className="relative w-full h-44 rounded-2xl bg-teal-deep/50 overflow-hidden border border-cream/10">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-cream/30">
                        🍗
                      </div>
                    )}

                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                      {item.isSignature && (
                        <span className="px-2 py-0.5 bg-orange text-ink font-anton text-[10px] uppercase rounded">
                          Signature
                        </span>
                      )}
                      {item.isNew && (
                        <span className="px-2 py-0.5 bg-red text-cream font-anton text-[10px] uppercase rounded">
                          NEW
                        </span>
                      )}
                      {item.hasHeatGauge && (
                        <span className="px-2 py-0.5 bg-ink text-orange border border-orange/40 font-mono text-[10px] uppercase rounded">
                          🔥 Heat Gauge
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleToggleItemActive(item)}
                      className={`absolute bottom-2 right-2 px-3 py-1 font-mono text-[10px] uppercase font-bold rounded-lg shadow-md border ${
                        item.isActive
                          ? "bg-green-500 text-black border-green-400"
                          : "bg-red text-cream border-red-400 animate-pulse"
                      }`}
                    >
                      {item.isActive ? "Available" : "Sold Out"}
                    </button>
                  </div>

                  {/* Title & Category */}
                  <div>
                    <span className="font-mono text-[10px] text-orange uppercase font-semibold">
                      {item.category?.name || "General"}
                    </span>
                    <h3 className="font-anton text-xl text-cream uppercase tracking-wide">
                      {item.name}
                    </h3>
                    <p className="font-work text-xs text-cream/70 line-clamp-2 mt-1">
                      {item.description || "No description provided."}
                    </p>
                  </div>
                </div>

                {/* Price & Actions */}
                <div className="pt-3 border-t border-cream/10 flex items-center justify-between gap-2">
                  <span className="font-mono text-base font-bold text-cream">
                    Rs. {item.price.toLocaleString()}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditItemModal(item)}
                      className="px-3 py-1.5 bg-cream/10 hover:bg-orange hover:text-ink text-cream font-anton text-xs uppercase tracking-wider rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="px-3 py-1.5 bg-red/20 hover:bg-red text-red hover:text-cream font-anton text-xs uppercase tracking-wider rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CATEGORIES TAB CONTENT */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Add Category Form */}
          <form
            onSubmit={handleAddCategory}
            className="lg:col-span-4 bg-ink/70 border border-cream/15 rounded-3xl p-6 space-y-4 shadow-xl text-left"
          >
            <h3 className="font-anton text-xl text-orange uppercase tracking-wide border-b border-cream/10 pb-2">
              + Add New Category
            </h3>

            <div className="space-y-1">
              <label className="font-anton text-xs text-cream uppercase block">Category Name</label>
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Bird Menu"
                className="w-full px-4 py-2.5 bg-ink border border-cream/20 rounded-xl text-cream font-work text-xs focus:outline-none focus:border-orange"
              />
            </div>

            <div className="space-y-1">
              <label className="font-anton text-xs text-cream uppercase block">Sort Order</label>
              <input
                type="number"
                value={newCatSortOrder}
                onChange={(e) => setNewCatSortOrder(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-ink border border-cream/20 rounded-xl text-cream font-mono text-xs focus:outline-none focus:border-orange"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-orange hover:bg-orange/90 text-ink font-anton text-xs uppercase tracking-wider rounded-xl shadow transition-all"
            >
              Add Category
            </button>
          </form>

          {/* Categories List */}
          <div className="lg:col-span-8 bg-ink/70 border border-cream/15 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-anton text-xl text-cream uppercase tracking-wide border-b border-cream/10 pb-3 text-left">
              Existing Categories
            </h3>

            <div className="divide-y divide-cream/10">
              {categories.map((cat) => {
                const count = items.filter((i) => i.categoryId === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className="py-3 flex items-center justify-between gap-4 font-work text-xs text-left"
                  >
                    <div className="space-y-0.5">
                      <strong className="text-cream text-sm font-anton tracking-wide">
                        {cat.name}
                      </strong>
                      <div className="font-mono text-cream/50 text-[11px]">
                        Sort Order: {cat.sortOrder} • {count} Menu Items
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="px-3 py-1.5 bg-red/20 hover:bg-red text-red hover:text-cream font-anton text-xs uppercase tracking-wider rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT ITEM MODAL */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full bg-teal-deep border border-cream/20 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl my-8 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-cream/15 pb-4">
              <h2 className="font-anton text-2xl text-cream uppercase tracking-wide">
                {editingItem ? "Edit Menu Item" : "Create New Menu Item"}
              </h2>
              <button
                type="button"
                onClick={() => setIsItemModalOpen(false)}
                className="text-cream/50 hover:text-cream font-mono text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-anton text-xs text-cream uppercase block">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. The Sando"
                    className="w-full px-4 py-2.5 bg-ink border border-cream/20 rounded-xl text-cream font-work text-xs focus:outline-none focus:border-orange"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-anton text-xs text-cream uppercase block">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-ink border border-cream/20 rounded-xl text-cream font-work text-xs focus:outline-none focus:border-orange"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} className="bg-ink text-cream">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-anton text-xs text-cream uppercase block">Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-ink border border-cream/20 rounded-xl text-cream font-mono text-xs focus:outline-none focus:border-orange"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-anton text-xs text-cream uppercase block">Flavor Options (comma separated)</label>
                  <input
                    type="text"
                    value={flavorString}
                    onChange={(e) => setFlavorString(e.target.value)}
                    placeholder="e.g. Nutella, Strawberry, Dark Choc"
                    className="w-full px-4 py-2.5 bg-ink border border-cream/20 rounded-xl text-cream font-work text-xs focus:outline-none focus:border-orange"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-anton text-xs text-cream uppercase block">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="House bread, hot chicken tenders, cheese fondue & comeback sauce"
                  className="w-full px-4 py-2.5 bg-ink border border-cream/20 rounded-xl text-cream font-work text-xs focus:outline-none focus:border-orange"
                />
              </div>

              {/* Image Upload Input & Preview */}
              <div className="space-y-2 bg-ink/40 border border-cream/15 rounded-2xl p-4">
                <label className="font-anton text-xs text-orange uppercase tracking-wider block">
                  📷 Image Upload (Cloudinary / File / URL)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-8">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="text-xs text-cream/70 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-anton file:bg-orange file:text-ink cursor-pointer"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Or paste image URL"
                      className="w-full px-3 py-2 bg-ink border border-cream/20 rounded-xl text-cream font-mono text-[11px] focus:outline-none"
                    />
                  </div>
                </div>

                {imageUrl && (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden mt-2 border border-cream/20">
                    <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-ink/40 p-4 rounded-2xl border border-cream/15 font-work text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasHeatGauge}
                    onChange={(e) => setHasHeatGauge(e.target.checked)}
                    className="accent-orange w-4 h-4"
                  />
                  <span>🔥 Heat Gauge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSignature}
                    onChange={(e) => setIsSignature(e.target.checked)}
                    className="accent-orange w-4 h-4"
                  />
                  <span>⭐ Signature</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNew}
                    onChange={(e) => setIsNew(e.target.checked)}
                    className="accent-orange w-4 h-4"
                  />
                  <span>✨ NEW Badge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="accent-orange w-4 h-4"
                  />
                  <span>✅ Available</span>
                </label>
              </div>

              {/* Dynamic Addon Options */}
              <div className="space-y-3 bg-ink/40 border border-cream/15 rounded-2xl p-4">
                <span className="font-anton text-xs text-orange uppercase tracking-wider block">
                  ➕ Addon Options
                </span>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newAddonName}
                    onChange={(e) => setNewAddonName(e.target.value)}
                    placeholder="Addon Name (e.g. Vanilla Scoop)"
                    className="flex-1 px-3 py-2 bg-ink border border-cream/20 rounded-xl text-cream font-work text-xs"
                  />
                  <input
                    type="number"
                    value={newAddonPrice}
                    onChange={(e) => setNewAddonPrice(Number(e.target.value))}
                    className="w-24 px-3 py-2 bg-ink border border-cream/20 rounded-xl text-cream font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newAddonName.trim()) {
                        setAddons([...addons, { name: newAddonName.trim(), price: newAddonPrice }]);
                        setNewAddonName("");
                      }
                    }}
                    className="px-3 py-2 bg-orange text-ink font-anton text-xs uppercase rounded-xl"
                  >
                    + Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {addons.map((a, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-ink border border-cream/20 rounded-lg font-mono text-xs text-cream flex items-center gap-2"
                    >
                      <span>{a.name} (+Rs. {a.price})</span>
                      <button
                        type="button"
                        onClick={() => setAddons(addons.filter((_, i) => i !== idx))}
                        className="text-red font-bold hover:text-red-400"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-cream/15">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-5 py-2.5 bg-cream/10 text-cream font-anton text-xs uppercase tracking-wider rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-orange text-ink font-anton text-xs uppercase tracking-wider rounded-xl shadow hover:bg-orange/90"
                >
                  {saving ? "Saving..." : "Save Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
