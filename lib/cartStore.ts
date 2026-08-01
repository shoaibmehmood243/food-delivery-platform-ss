import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getCookie, setCookie, deleteCookie } from "./cookies";

export interface SelectedAddon {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  cartId: string;
  menuItemId: string;
  name: string;
  unitPrice: number;
  qty: number;
  selectedHeat: string | null;
  selectedFlavor: string | null;
  selectedAddons: SelectedAddon[];
  imageUrl?: string | null;
}

interface CartState {
  items: CartItem[];
  branchId: string | null;
  isOpen: boolean;
  
  // Actions
  addItem: (item: Omit<CartItem, "cartId">, branchId?: string | null) => void;
  updateQty: (cartId: string, qty: number) => void;
  removeItem: (cartId: string) => void;
  clearCart: () => void;
  setBranchId: (branchId: string | null) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  
  // Selectors
  getTotalItems: () => number;
  getSubtotal: () => number;
}

// Custom cookie storage engine for Zustand persist middleware
const cookieStorage = {
  getItem: (name: string): string | null => {
    return getCookie(name);
  },
  setItem: (name: string, value: string): void => {
    setCookie(name, value, 365);
  },
  removeItem: (name: string): void => {
    deleteCookie(name);
  },
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      branchId: null,
      isOpen: false,

      addItem: (newItemData, branchId) => {
        const { items, branchId: currentBranchId } = get();

        // Deterministic cartId generation based on configuration
        const addonIdsKey = newItemData.selectedAddons
          .map((a) => a.id)
          .sort()
          .join("-");
        const cartId = `${newItemData.menuItemId}_${newItemData.selectedHeat || "noheat"}_${
          newItemData.selectedFlavor || "noflavor"
        }_${addonIdsKey}`;

        // Check if item configuration already exists in cart
        const existingIndex = items.findIndex((i) => i.cartId === cartId);

        let updatedItems: CartItem[];
        if (existingIndex > -1) {
          updatedItems = items.map((item, idx) =>
            idx === existingIndex
              ? { ...item, qty: item.qty + newItemData.qty }
              : item
          );
        } else {
          const fullItem: CartItem = {
            ...newItemData,
            cartId,
          };
          updatedItems = [...items, fullItem];
        }

        set({
          items: updatedItems,
          branchId: branchId || currentBranchId,
          isOpen: true, // Open cart drawer on add
        });
      },

      updateQty: (cartId, qty) => {
        if (qty <= 0) {
          get().removeItem(cartId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.cartId === cartId ? { ...item, qty } : item
          ),
        }));
      },

      removeItem: (cartId) => {
        set((state) => ({
          items: state.items.filter((item) => item.cartId !== cartId),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      setBranchId: (branchId) => {
        set({ branchId });
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.qty, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.unitPrice * item.qty,
          0
        );
      },
    }),
    {
      name: "seven_sides_cart",
      storage: createJSONStorage(() => cookieStorage),
      partialize: (state) => ({
        items: state.items,
        branchId: state.branchId,
      }),
    }
  )
);
