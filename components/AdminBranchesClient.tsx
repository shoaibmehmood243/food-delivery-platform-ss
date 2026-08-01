"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface Branch {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  hoursOpen: string;
  hoursClose: string;
  deliveryFee: number;
  deliveryRadiusKm: number;
  lat: number;
  lng: number;
  isActive: boolean;
  _count?: {
    orders: number;
  };
}

interface AdminBranchesClientProps {
  initialBranches: Branch[];
}

export default function AdminBranchesClient({
  initialBranches,
}: AdminBranchesClientProps) {
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [hoursOpen, setHoursOpen] = useState("12 PM");
  const [hoursClose, setHoursClose] = useState("12 AM");
  const [deliveryFee, setDeliveryFee] = useState<number>(150);
  const [deliveryRadiusKm, setDeliveryRadiusKm] = useState<number>(5.0);
  const [lat, setLat] = useState<number>(31.5204);
  const [lng, setLng] = useState<number>(74.3587);
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [deleteBlockedMsg, setDeleteBlockedMsg] = useState<string | null>(null);
  const router = useRouter();

  const openNewBranchModal = () => {
    setEditingBranch(null);
    setName("");
    setAddress("");
    setPhone("923196481040");
    setHoursOpen("12 PM");
    setHoursClose("12 AM");
    setDeliveryFee(150);
    setDeliveryRadiusKm(5.0);
    setLat(31.4705);
    setLng(74.4075);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditBranchModal = (b: Branch) => {
    setEditingBranch(b);
    setName(b.name);
    setAddress(b.address);
    setPhone(b.phone);
    setHoursOpen(b.hoursOpen);
    setHoursClose(b.hoursClose);
    setDeliveryFee(b.deliveryFee);
    setDeliveryRadiusKm(b.deliveryRadiusKm);
    setLat(b.lat);
    setLng(b.lng);
    setIsActive(b.isActive);
    setIsModalOpen(true);
  };

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    const payload = {
      name,
      address,
      phone,
      hoursOpen,
      hoursClose,
      deliveryFee,
      deliveryRadiusKm,
      lat,
      lng,
      isActive,
    };

    try {
      const url = editingBranch
        ? `/api/admin/branches/${editingBranch.id}`
        : "/api/admin/branches";
      const method = editingBranch ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save branch");
      }

      if (editingBranch) {
        setBranches(
          branches.map((b) => (b.id === data.branch.id ? { ...b, ...data.branch } : b))
        );
      } else {
        setBranches([...branches, data.branch]);
      }

      setIsModalOpen(false);
      setMsg({ text: "Branch details saved successfully!", type: "success" });
      router.refresh();
    } catch (err: any) {
      setMsg({ text: err.message || "Failed to save branch", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Toggle Branch Active
  const handleToggleActive = async (b: Branch) => {
    try {
      const newActive = !b.isActive;
      const res = await fetch(`/api/admin/branches/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newActive }),
      });

      if (res.ok) {
        setBranches(
          branches.map((item) =>
            item.id === b.id ? { ...item, isActive: newActive } : item
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle branch status:", err);
    }
  };

  // Delete Branch with dependency check
  const handleDeleteBranch = async (b: Branch) => {
    setDeleteBlockedMsg(null);
    const orderCount = b._count?.orders || 0;

    if (orderCount > 0) {
      setDeleteBlockedMsg(
        `Branch "${b.name}" has ${orderCount} existing orders and cannot be deleted. We recommend setting its status to Inactive instead to disable new orders.`
      );
      return;
    }

    if (!confirm(`Are you sure you want to delete branch "${b.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/branches/${b.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Failed to delete branch");
      } else {
        setBranches(branches.filter((item) => item.id !== b.id));
        setMsg({ text: `Branch "${b.name}" deleted successfully.`, type: "success" });
      }
    } catch (err) {
      alert("Error deleting branch");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-ink/60 border border-cream/15 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl">
        <div>
          <h1 className="font-anton text-3xl sm:text-4xl text-cream uppercase tracking-wide">
            Branch Management
          </h1>
          <p className="font-work text-xs text-cream/70 mt-1">
            Manage restaurant branches, operating hours, delivery fees, and coverage radiuses.
          </p>
        </div>

        <button
          onClick={openNewBranchModal}
          className="px-5 py-3 bg-orange text-ink font-anton text-xs uppercase tracking-wider rounded-xl shadow-lg hover:bg-orange/90 transition-transform active:scale-95"
        >
          + Add New Branch
        </button>
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

      {/* Delete Blocked Warning Modal */}
      {deleteBlockedMsg && (
        <div className="bg-red/20 border-2 border-red text-red rounded-2xl p-6 text-center space-y-3 shadow-xl animate-in fade-in">
          <span className="text-4xl">⚠️</span>
          <h3 className="font-anton text-xl uppercase tracking-wide">
            Deletion Blocked (Existing Orders)
          </h3>
          <p className="font-work text-xs text-cream/90 max-w-lg mx-auto">
            {deleteBlockedMsg}
          </p>
          <button
            onClick={() => setDeleteBlockedMsg(null)}
            className="px-4 py-2 bg-red text-cream font-anton text-xs uppercase tracking-wider rounded-xl"
          >
            Understood
          </button>
        </div>
      )}

      {/* Branch Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((b) => {
          const orderCount = b._count?.orders || 0;

          return (
            <div
              key={b.id}
              className={`bg-ink/60 border rounded-3xl p-6 space-y-4 shadow-xl flex flex-col justify-between text-left transition-all ${
                b.isActive
                  ? "border-cream/15 hover:border-orange/40"
                  : "border-red/40 opacity-60 bg-red/5"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-cream/10 pb-3">
                  <h3 className="font-anton text-2xl text-cream uppercase tracking-wide">
                    {b.name}
                  </h3>
                  <button
                    onClick={() => handleToggleActive(b)}
                    className={`px-3 py-1 rounded-full font-mono text-[10px] uppercase font-bold border ${
                      b.isActive
                        ? "bg-green-500/20 text-green-300 border-green-500/40"
                        : "bg-red/20 text-red border-red/40"
                    }`}
                  >
                    {b.isActive ? "Active" : "Inactive"}
                  </button>
                </div>

                <div className="space-y-2 font-work text-xs text-cream/80">
                  <p>📍 <strong>Address:</strong> {b.address}</p>
                  <p>📞 <strong>Phone:</strong> <span className="font-mono text-cream">{b.phone}</span></p>
                  <p>⏰ <strong>Hours:</strong> <span className="font-mono text-cream">{b.hoursOpen} – {b.hoursClose}</span></p>
                  <p>🛵 <strong>Delivery Fee:</strong> <span className="font-mono text-cream">Rs. {b.deliveryFee}</span></p>
                  <p>📡 <strong>Coverage Radius:</strong> <span className="font-mono text-cream">{b.deliveryRadiusKm} km</span></p>
                  <p>📦 <strong>Total Orders Placed:</strong> <span className="font-mono text-orange font-bold">{orderCount}</span></p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-cream/10 flex items-center justify-between gap-2">
                <button
                  onClick={() => openEditBranchModal(b)}
                  className="flex-1 py-2 bg-cream/10 hover:bg-orange hover:text-ink text-cream font-anton text-xs uppercase tracking-wider rounded-xl transition-colors"
                >
                  Edit Branch
                </button>

                <button
                  onClick={() => handleDeleteBranch(b)}
                  className="py-2 px-4 bg-red/20 hover:bg-red text-red hover:text-cream font-anton text-xs uppercase tracking-wider rounded-xl transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT BRANCH MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-teal-deep border border-cream/20 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-cream/15 pb-4">
              <h2 className="font-anton text-2xl text-cream uppercase tracking-wide">
                {editingBranch ? "Edit Branch Details" : "Create New Branch"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-cream/50 hover:text-cream font-mono text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="space-y-4">
              <div className="space-y-1">
                <label className="font-anton text-xs text-cream uppercase block">Branch Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. DHA Phase 5"
                  className="w-full px-4 py-2.5 bg-ink border border-cream/20 rounded-xl text-cream font-work text-xs focus:outline-none focus:border-orange"
                />
              </div>

              <div className="space-y-1">
                <label className="font-anton text-xs text-cream uppercase block">Full Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="15-A Street 2, Sector A, Phase 5, DHA, Lahore"
                  className="w-full px-4 py-2.5 bg-ink border border-cream/20 rounded-xl text-cream font-work text-xs focus:outline-none focus:border-orange"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-anton text-xs text-cream uppercase block">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="923196481040"
                    className="w-full px-4 py-2.5 bg-ink border border-cream/20 rounded-xl text-cream font-mono text-xs focus:outline-none focus:border-orange"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-anton text-xs text-cream uppercase block">Delivery Fee (PKR)</label>
                  <input
                    type="number"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-ink border border-cream/20 rounded-xl text-cream font-mono text-xs focus:outline-none focus:border-orange"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-anton text-xs text-cream uppercase block">Opening Time</label>
                  <input
                    type="text"
                    value={hoursOpen}
                    onChange={(e) => setHoursOpen(e.target.value)}
                    placeholder="12 PM"
                    className="w-full px-4 py-2.5 bg-ink border border-cream/20 rounded-xl text-cream font-work text-xs focus:outline-none focus:border-orange"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-anton text-xs text-cream uppercase block">Closing Time</label>
                  <input
                    type="text"
                    value={hoursClose}
                    onChange={(e) => setHoursClose(e.target.value)}
                    placeholder="12 AM"
                    className="w-full px-4 py-2.5 bg-ink border border-cream/20 rounded-xl text-cream font-work text-xs focus:outline-none focus:border-orange"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-anton text-xs text-cream uppercase block">Delivery Radius (km)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={deliveryRadiusKm}
                    onChange={(e) => setDeliveryRadiusKm(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-ink border border-cream/20 rounded-xl text-cream font-mono text-xs focus:outline-none focus:border-orange"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-anton text-xs text-cream uppercase block">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lat}
                    onChange={(e) => setLat(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-ink border border-cream/20 rounded-xl text-cream font-mono text-xs focus:outline-none focus:border-orange"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-anton text-xs text-cream uppercase block">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lng}
                    onChange={(e) => setLng(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-ink border border-cream/20 rounded-xl text-cream font-mono text-xs focus:outline-none focus:border-orange"
                  />
                </div>
              </div>

              <div className="bg-ink/40 p-4 rounded-2xl border border-cream/15">
                <label className="flex items-center gap-2 cursor-pointer font-work text-xs text-cream">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="accent-orange w-4 h-4"
                  />
                  <span>Active Branch (Accepting Orders)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-cream/15">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-cream/10 text-cream font-anton text-xs uppercase tracking-wider rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-orange text-ink font-anton text-xs uppercase tracking-wider rounded-xl shadow hover:bg-orange/90"
                >
                  {saving ? "Saving..." : "Save Branch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
