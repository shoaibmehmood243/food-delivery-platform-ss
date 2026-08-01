"use client";

import { Branch } from "./BranchModal";

interface BranchSwitchConfirmModalProps {
  pendingBranch: Branch | null;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: (branch: Branch) => void;
}

export default function BranchSwitchConfirmModal({
  pendingBranch,
  isOpen,
  onCancel,
  onConfirm,
}: BranchSwitchConfirmModalProps) {
  if (!isOpen || !pendingBranch) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-teal-deep border-2 border-red/60 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl text-cream space-y-6 text-center relative overflow-hidden">
        {/* Warning Icon */}
        <div className="w-16 h-16 rounded-full bg-red/20 border border-red/40 text-red text-3xl flex items-center justify-center mx-auto animate-bounce">
          ⚠️
        </div>

        <div className="space-y-2">
          <h3 className="font-anton text-2xl sm:text-3xl text-cream uppercase tracking-wide">
            Switch Branch?
          </h3>
          <p className="font-work text-sm text-cream/90 leading-relaxed">
            Switching branches to <strong className="text-orange">{pendingBranch.name}</strong> will clear your current cart items. Do you want to continue?
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={onCancel}
            className="w-full sm:w-1/2 py-3 bg-ink/70 hover:bg-ink text-cream font-work text-sm font-semibold rounded-xl border border-cream/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(pendingBranch)}
            className="w-full sm:w-1/2 py-3 bg-red hover:bg-red/90 text-cream font-anton text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95"
          >
            Switch &amp; Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
}
