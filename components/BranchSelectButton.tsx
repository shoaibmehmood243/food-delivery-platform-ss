"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setCookie, BRANCH_COOKIE_NAME, BRANCH_NAME_COOKIE_NAME } from "@/lib/cookies";
import { useCartStore } from "@/lib/cartStore";
import { Branch } from "./BranchModal";
import BranchSwitchConfirmModal from "./BranchSwitchConfirmModal";

interface BranchSelectButtonProps {
  branch: Branch;
}

export default function BranchSelectButton({ branch }: BranchSelectButtonProps) {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const applyBranchSelect = () => {
    setCookie(BRANCH_COOKIE_NAME, branch.id);
    setCookie(BRANCH_NAME_COOKIE_NAME, branch.name);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("branchChanged", { detail: branch }));
    }

    router.push("/menu");
  };

  const handleClick = () => {
    if (items.length > 0) {
      setIsConfirmOpen(true);
    } else {
      applyBranchSelect();
    }
  };

  const handleConfirmSwitch = () => {
    clearCart();
    setIsConfirmOpen(false);
    applyBranchSelect();
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="w-full py-3 bg-orange hover:bg-orange/90 text-ink font-anton text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-98 flex items-center justify-center gap-2 group"
      >
        <span>Order from here</span>
        <span className="group-hover:translate-x-1 transition-transform font-sans">
          →
        </span>
      </button>

      <BranchSwitchConfirmModal
        pendingBranch={branch}
        isOpen={isConfirmOpen}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmSwitch}
      />
    </>
  );
}
