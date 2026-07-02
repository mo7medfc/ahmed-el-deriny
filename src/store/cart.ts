import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItemConfiguration {
  type: string;
  summary?: string;
  band?: string;
  sizeId?: string;
  variant?: string;
  inkColor?: string;
  widthCm?: number;
  heightCm?: number;
  [key: string]: unknown;
}

export interface CartItem {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  width?: number;
  height?: number;
  quantity: number;
  selectedOptions: { id: string; name: string; priceAddon: number }[];
  unitPrice: number;
  totalPrice: number;
  designFile?: string;
  designFileName?: string;
  notes?: string;
  configuration?: CartItemConfiguration;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const id = `${item.productId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        set((state) => ({ items: [...state.items, { ...item, id }] }));
      },
      removeItem: (id) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => get().items.reduce((sum, item) => sum + item.totalPrice, 0),
      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    { name: "ahmed-deriny-cart" }
  )
);
