import type { Order, StatusHistoryEntry } from "@/types/order";
import type { DashboardSummary } from "@/types/dashboard";
import type { User } from "@/types/auth";

export const MOCK_USER: User = {
  id: 1,
  email: "admin@orderflow.com",
  name: "Admin User",
};

export const MOCK_TOKEN = "mock-jwt-token-dev";

export const MOCK_ORDERS: Order[] = [
  { id: 1, customer_name: "Alice Johnson", customer_email: "alice@example.com", total_amount: 149.99, status: "pending", created_at: "2025-01-10T08:00:00Z", updated_at: "2025-01-10T08:00:00Z" },
  { id: 2, customer_name: "Bob Smith", customer_email: "bob@example.com", total_amount: 299.5, status: "paid", created_at: "2025-01-11T09:30:00Z", updated_at: "2025-01-11T11:00:00Z" },
  { id: 3, customer_name: "Carol White", customer_email: "carol@example.com", total_amount: 89.0, status: "shipped", created_at: "2025-01-12T10:00:00Z", updated_at: "2025-01-13T14:00:00Z" },
  { id: 4, customer_name: "David Brown", customer_email: "david@example.com", total_amount: 499.0, status: "cancelled", created_at: "2025-01-12T11:00:00Z", updated_at: "2025-01-12T15:00:00Z" },
  { id: 5, customer_name: "Eva Martinez", customer_email: "eva@example.com", total_amount: 75.25, status: "pending", created_at: "2025-01-13T07:00:00Z", updated_at: "2025-01-13T07:00:00Z" },
  { id: 6, customer_name: "Frank Lee", customer_email: "frank@example.com", total_amount: 320.0, status: "paid", created_at: "2025-01-13T08:30:00Z", updated_at: "2025-01-13T09:00:00Z" },
  { id: 7, customer_name: "Grace Kim", customer_email: "grace@example.com", total_amount: 210.0, status: "shipped", created_at: "2025-01-14T09:00:00Z", updated_at: "2025-01-14T12:00:00Z" },
  { id: 8, customer_name: "Henry Davis", customer_email: "henry@example.com", total_amount: 55.0, status: "pending", created_at: "2025-01-14T10:00:00Z", updated_at: "2025-01-14T10:00:00Z" },
  { id: 9, customer_name: "Iris Chen", customer_email: "iris@example.com", total_amount: 640.0, status: "paid", created_at: "2025-01-14T11:00:00Z", updated_at: "2025-01-14T13:00:00Z" },
  { id: 10, customer_name: "Jack Wilson", customer_email: "jack@example.com", total_amount: 189.99, status: "shipped", created_at: "2025-01-15T08:00:00Z", updated_at: "2025-01-15T10:00:00Z" },
  { id: 11, customer_name: "Karen Taylor", customer_email: "karen@example.com", total_amount: 99.0, status: "pending", created_at: "2025-01-15T09:00:00Z", updated_at: "2025-01-15T09:00:00Z" },
  { id: 12, customer_name: "Leo Garcia", customer_email: "leo@example.com", total_amount: 410.0, status: "cancelled", created_at: "2025-01-15T10:00:00Z", updated_at: "2025-01-15T11:00:00Z" },
];

export const MOCK_HISTORY: Record<number, StatusHistoryEntry[]> = {
  1: [{ id: 1, order_id: 1, from_status: null, to_status: "pending", changed_at: "2025-01-10T08:00:00Z" }],
  2: [
    { id: 2, order_id: 2, from_status: null, to_status: "pending", changed_at: "2025-01-11T09:30:00Z" },
    { id: 3, order_id: 2, from_status: "pending", to_status: "paid", changed_at: "2025-01-11T11:00:00Z" },
  ],
  3: [
    { id: 4, order_id: 3, from_status: null, to_status: "pending", changed_at: "2025-01-12T10:00:00Z" },
    { id: 5, order_id: 3, from_status: "pending", to_status: "paid", changed_at: "2025-01-12T12:00:00Z" },
    { id: 6, order_id: 3, from_status: "paid", to_status: "shipped", changed_at: "2025-01-13T14:00:00Z" },
  ],
  4: [
    { id: 7, order_id: 4, from_status: null, to_status: "pending", changed_at: "2025-01-12T11:00:00Z" },
    { id: 8, order_id: 4, from_status: "pending", to_status: "cancelled", changed_at: "2025-01-12T15:00:00Z" },
  ],
};

export function getMockDashboard(): DashboardSummary {
  const byStatus = { pending: 0, paid: 0, shipped: 0, cancelled: 0 };
  let totalRevenue = 0;
  for (const o of MOCK_ORDERS) {
    byStatus[o.status]++;
    if (o.status !== "cancelled") totalRevenue += o.total_amount;
  }
  const today = new Date().toDateString();
  const ordersToday = MOCK_ORDERS.filter(
    (o) => new Date(o.created_at).toDateString() === today
  ).length;
  return {
    total_orders: MOCK_ORDERS.length,
    orders_by_status: byStatus,
    total_revenue: totalRevenue,
    orders_today: ordersToday,
  };
}
