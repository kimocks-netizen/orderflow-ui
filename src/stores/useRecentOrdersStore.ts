import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Order } from "@/types/order";

export interface RecentOrder {
  id: number;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: Order["status"];
  viewedAt: string;
}

interface RecentOrdersState {
  recent: RecentOrder[];
  track: (order: Order) => void;
}

export const useRecentOrdersStore = create<RecentOrdersState>()(
  persist(
    (set) => ({
      recent: [],
      track: (order) =>
        set((s) => {
          const filtered = s.recent.filter((r) => r.id !== order.id);
          const next: RecentOrder = {
            id: order.id,
            customer_name: order.customer_name,
            customer_email: order.customer_email,
            total_amount: order.total_amount,
            status: order.status,
            viewedAt: new Date().toISOString(),
          };
          return { recent: [next, ...filtered].slice(0, 5) };
        }),
    }),
    { name: "recent-orders" }
  )
);
