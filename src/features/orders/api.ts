import { api } from "@/lib/api-client";
import type { Order, CreateOrderPayload, UpdateStatusPayload, StatusHistoryEntry } from "@/types/order";
import type { PaginatedResponse } from "@/types/api";

export interface OrdersParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}

export function fetchOrders(params: OrdersParams = {}): Promise<PaginatedResponse<Order>> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.page_size) query.set("page_size", String(params.page_size));
  if (params.search) query.set("search", params.search);
  if (params.status && params.status !== "all") query.set("status", params.status);
  if (params.date_from) query.set("date_from", params.date_from);
  if (params.date_to) query.set("date_to", params.date_to);
  return api.get<PaginatedResponse<Order>>(`/orders?${query.toString()}`);
}

export function fetchOrder(id: number | string): Promise<Order> {
  return api.get<Order>(`/orders/${id}`);
}

export function createOrder(data: CreateOrderPayload): Promise<Order> {
  return api.post<Order>("/orders", data);
}

export function updateOrderStatus(id: number | string, data: UpdateStatusPayload): Promise<Order> {
  return api.patch<Order>(`/orders/${id}/status`, data);
}

export function fetchOrderHistory(id: number | string): Promise<StatusHistoryEntry[]> {
  return api.get<StatusHistoryEntry[]>(`/orders/${id}/history`);
}
