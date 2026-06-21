import type { LoginRequest, LoginResponse } from "@/types/auth";
import type { Order, CreateOrderPayload, UpdateStatusPayload, StatusHistoryEntry, OrderStatus } from "@/types/order";
import type { PaginatedResponse } from "@/types/api";
import type { DashboardSummary } from "@/types/dashboard";
import type { OrdersParams } from "@/features/orders/api";
import { MOCK_USER, MOCK_TOKEN, MOCK_ORDERS, MOCK_HISTORY } from "./data";

// In-memory mutable copy so status updates persist during the session
let orders: Order[] = MOCK_ORDERS.map((o) => ({ ...o }));
let historyStore: Record<number, StatusHistoryEntry[]> = { ...MOCK_HISTORY };
let nextOrderId = orders.length + 1;
let nextHistoryId = 100;

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: [],
  cancelled: [],
};

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((res) => setTimeout(() => res(value), ms));
}

export const mockApi = {
  login(data: LoginRequest): Promise<LoginResponse> {
    if (data.email === MOCK_USER.email && data.password === "password") {
      return delay({ access_token: MOCK_TOKEN, user: MOCK_USER });
    }
    return Promise.reject(new Error("Invalid email or password"));
  },

  fetchOrders(params: OrdersParams = {}): Promise<PaginatedResponse<Order>> {
    let filtered = [...orders];

    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.customer_name.toLowerCase().includes(q) ||
          o.customer_email.toLowerCase().includes(q)
      );
    }

    if (params.status && params.status !== "all") {
      filtered = filtered.filter((o) => o.status === params.status);
    }

    const page = params.page ?? 1;
    const pageSize = params.page_size ?? 20;
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const items = filtered.slice((page - 1) * pageSize, page * pageSize);

    return delay({ items, total, page, page_size: pageSize, total_pages: totalPages });
  },

  fetchOrder(id: number | string): Promise<Order> {
    const order = orders.find((o) => o.id === Number(id));
    if (!order) return Promise.reject(new Error("Order not found"));
    return delay({ ...order });
  },

  createOrder(data: CreateOrderPayload): Promise<Order> {
    const now = new Date().toISOString();
    const order: Order = { id: nextOrderId++, ...data, status: "pending", created_at: now, updated_at: now };
    orders = [order, ...orders];
    historyStore[order.id] = [{ id: nextHistoryId++, order_id: order.id, from_status: null, to_status: "pending", changed_at: now }];
    return delay({ ...order });
  },

  updateOrderStatus(id: number | string, data: UpdateStatusPayload): Promise<Order> {
    const idx = orders.findIndex((o) => o.id === Number(id));
    if (idx === -1) return Promise.reject(new Error("Order not found"));

    const order = orders[idx];
    const allowed = TRANSITIONS[order.status];
    if (!allowed.includes(data.status)) {
      return Promise.reject(new Error(`Cannot transition from ${order.status} to ${data.status}`));
    }

    const now = new Date().toISOString();
    const updated = { ...order, status: data.status, updated_at: now };
    orders = orders.map((o) => (o.id === updated.id ? updated : o));

    const entry: StatusHistoryEntry = {
      id: nextHistoryId++,
      order_id: updated.id,
      from_status: order.status,
      to_status: data.status,
      changed_at: now,
    };
    historyStore[updated.id] = [...(historyStore[updated.id] ?? []), entry];

    return delay({ ...updated });
  },

  fetchOrderHistory(id: number | string): Promise<StatusHistoryEntry[]> {
    return delay([...(historyStore[Number(id)] ?? [])]);
  },

  fetchDashboardSummary(): Promise<DashboardSummary> {
    const byStatus = { pending: 0, paid: 0, shipped: 0, cancelled: 0 };
    let totalRevenue = 0;
    let revenueCount = 0;
    for (const o of orders) {
      byStatus[o.status]++;
      if (o.status !== "cancelled") { totalRevenue += o.total_amount; revenueCount++; }
    }
    const today = new Date().toDateString();
    const ordersToday = orders.filter((o) => new Date(o.created_at).toDateString() === today).length;

    // orders per day — last 7 days
    const dayMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      dayMap[d.toDateString()] = 0;
    }
    for (const o of orders) {
      const key = new Date(o.created_at).toDateString();
      if (key in dayMap) dayMap[key]++;
    }
    const orders_per_day = Object.entries(dayMap).map(([date, count]) => ({ date, count }));

    return delay({
      total_orders: orders.length,
      orders_by_status: byStatus,
      total_revenue: totalRevenue,
      orders_today: ordersToday,
      avg_order_value: revenueCount ? totalRevenue / revenueCount : 0,
      orders_per_day,
    });
  },
};

export const isMock = import.meta.env.VITE_USE_MOCK === "true";
