import { useQuery } from "@tanstack/react-query";
import { fetchOrders, fetchOrder, fetchOrderHistory, type OrdersParams } from "./api";

export const ordersKeys = {
  all: ["orders"] as const,
  list: (params: OrdersParams) => ["orders", "list", params] as const,
  detail: (id: number | string) => ["orders", "detail", id] as const,
  history: (id: number | string) => ["orders", "history", id] as const,
};

export function useOrdersQuery(params: OrdersParams = {}) {
  return useQuery({
    queryKey: ordersKeys.list(params),
    queryFn: () => fetchOrders(params),
  });
}

export function useOrderQuery(id: number | string) {
  return useQuery({
    queryKey: ordersKeys.detail(id),
    queryFn: () => fetchOrder(id),
    enabled: !!id,
  });
}

export function useOrderHistoryQuery(id: number | string) {
  return useQuery({
    queryKey: ordersKeys.history(id),
    queryFn: () => fetchOrderHistory(id),
    enabled: !!id,
  });
}
