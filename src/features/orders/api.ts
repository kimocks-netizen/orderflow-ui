import { api } from "@/lib/api-client";
import { mockApi, isMock } from "@/mocks/mockApi";
import type { Order, CreateOrderPayload, UpdateStatusPayload, StatusHistoryEntry } from "@/types/order";
import type { PaginatedResponse } from "@/types/api";

export interface OrdersParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
}

export function fetchOrders(params: OrdersParams = {}): Promise<PaginatedResponse<Order>> {
  if (isMock) return mockApi.fetchOrders(params);
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.page_size) query.set("page_size", String(params.page_size));
  if (params.search) query.set("search", params.search);
  if (params.status && params.status !== "all") query.set("status", params.status);
  return api.get<PaginatedResponse<Order>>(`/orders?${query.toString()}`);
}

export function fetchOrder(id: number | string): Promise<Order> {
  if (isMock) return mockApi.fetchOrder(id);
  return api.get<Order>(`/orders/${id}`);
}

export function createOrder(data: CreateOrderPayload): Promise<Order> {
  if (isMock) return mockApi.createOrder(data);
  return api.post<Order>("/orders", data);
}

export function updateOrderStatus(id: number | string, data: UpdateStatusPayload): Promise<Order> {
  if (isMock) return mockApi.updateOrderStatus(id, data);
  return api.patch<Order>(`/orders/${id}/status`, data);
}

export function fetchOrderHistory(id: number | string): Promise<StatusHistoryEntry[]> {
  if (isMock) return mockApi.fetchOrderHistory(id);
  return api.get<StatusHistoryEntry[]>(`/orders/${id}/history`);
}
