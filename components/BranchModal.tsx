"use client";

import { useState, useEffect } from "react";
import {
  getCookie,
  setCookie,
  BRANCH_COOKIE_NAME,
  BRANCH_NAME_COOKIE_NAME,
} from "@/lib/cookies";

export interface Branch {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  hoursOpen: string;
  hoursClose: string;
  deliveryFee: number;
  deliveryRadiusKm: number;
}

interface BranchModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSelectBranch?: (branch: Branch) => void;
  initialBranches?: Branch[];
}

export default function BranchModal({
  isOpen: forcedIsOpen,
  onClose,
  onSelectBranch,
  initialBranches,
}: BranchModalProps) {
  const [branches, setBranches] = useState<Branch[]>(initialBranches || []);
  const [loading, setLoading] = useState(!initialBranches || initialBranches.length === 0);
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Check cookie on mount
  useEffect(() => {
    const existingBranchId = getCookie(BRANCH_COOKIE_NAME);
    if (!existingBranchId && forcedIsOpen === undefined) {
      setInternalIsOpen(true);
    }
  }, [forcedIsOpen]);

  // Fetch branches if not provided
  useEffect(() => {
    if (branches.length === 0) {
      setLoading(true);
      fetch("/api/branches")
        .then((res) => res.json())
        .then((data) => {
          if (data.branches) {
            setBranches(data.branches);
          }
        })
        .catch((err) => console.error("Error fetching branches:", err))
        .finally(() => setLoading(false));
    }
  }, [branches.length]);

  const showModal = forcedIsOpen !== undefined ? forcedIsOpen : internalIsOpen;

  const handleSelect = (branch: Branch) => {
    setCookie(BRANCH_COOKIE_NAME, branch.id);
    setCookie(BRANCH_NAME_COOKIE_NAME, branch.name);
    
    if (onSelectBranch) {
      onSelectBranch(branch);
    }

    // Trigger window event so header updates immediately
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("branchChanged", { detail: branch }));
    }

    setInternalIsOpen(false);
    if (onClose) onClose();
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-teal-deep border-2 border-orange/40 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col p-5 sm:p-8 shadow-2xl text-cream relative my-auto">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header with Close Button */}
        <div className="text-center space-y-2 pb-4 border-b border-cream/10 relative">
          {forcedIsOpen && onClose && (
            <button
              onClick={onClose}
              className="absolute top-0 right-0 text-cream/50 hover:text-cream font-mono text-xl p-1 transition-colors"
              aria-label="Close branch selector modal"
            >
              ✕
            </button>
          )}

          <span className="font-mono text-xs text-orange uppercase tracking-widest font-bold block">
            Lahore Locations
          </span>
          <h2 className="font-anton text-2xl sm:text-4xl text-cream tracking-wide uppercase">
            Select Your Nearest Branch
          </h2>
          <p className="font-work text-xs sm:text-sm text-cream/80 max-w-md mx-auto">
            Choose your preferred Seven Sides branch to view localized menu items and delivery availability.
          </p>
        </div>

        {/* Scrollable Branch List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1 font-work">
          {loading ? (
            <div className="py-12 text-center font-mono text-sm text-cream/60 animate-pulse">
              Loading active branches...
            </div>
          ) : (
            branches.map((branch) => (
              <div
                key={branch.id}
                className="bg-ink/60 border border-cream/15 hover:border-orange/60 rounded-2xl p-4 sm:p-5 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 group"
              >
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-anton text-lg sm:text-xl text-cream group-hover:text-orange transition-colors">
                      {branch.name}
                    </h3>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-teal-bright/30 text-cream border border-teal-bright/40">
                      Rs. {branch.deliveryFee} Delivery
                    </span>
                  </div>
                  <p className="font-work text-xs text-cream/70 leading-relaxed">
                    📍 {branch.address}
                  </p>
                  <p className="font-mono text-[11px] sm:text-xs text-orange/90">
                    🕒 Hours: {branch.hoursOpen} – {branch.hoursClose}
                  </p>
                </div>

                <button
                  onClick={() => handleSelect(branch)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-orange hover:bg-orange/90 text-ink font-anton text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-transform active:scale-95 shadow-md flex-shrink-0"
                >
                  Select Branch
                </button>
              </div>
            ))
          )}
        </div>

        {/* Optional close footer link */}
        {forcedIsOpen && onClose && (
          <div className="text-center pt-3 border-t border-cream/10">
            <button
              onClick={onClose}
              className="font-work text-xs text-cream/60 hover:text-cream underline transition-colors"
            >
              Cancel / Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
