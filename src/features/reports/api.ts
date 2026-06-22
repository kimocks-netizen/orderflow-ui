import { mockApi, isMock } from "@/mocks/mockApi";
import { api } from "@/lib/api-client";

export interface OrderTrendPoint {
  date: string;
  all: number;
  pending: number;
  paid: number;
  shipped: number;
  cancelled: number;
}

export interface ReportsSummary {
  trend: OrderTrendPoint[];
  topCustomers: { name: string; email: string; orders: number; total: number }[];
  avgFulfillmentDays: number;
  cancellationRate: number;
  revenueThisMonth: number;
  revenuePrevMonth: number;
  peakDay: string;
  peakDayCount: number;
}

export async function fetchReportsSummary(): Promise<ReportsSummary> {
  if (isMock) {
    const dashboard = await mockApi.fetchDashboardSummary();
    const orders = await mockApi.fetchOrders({ page_size: 200 });

    // Build 30-day trend
    const dayMap: Record<string, OrderTrendPoint> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dayMap[key] = { date: key, all: 0, pending: 0, paid: 0, shipped: 0, cancelled: 0 };
    }
    for (const o of orders.items) {
      const key = o.created_at.slice(0, 10);
      if (key in dayMap) {
        dayMap[key].all++;
        dayMap[key][o.status]++;
      }
    }
    const trend = Object.values(dayMap);

    // Top customers by order count
    const customerMap: Record<string, { name: string; email: string; orders: number; total: number }> = {};
    for (const o of orders.items) {
      if (!customerMap[o.customer_email]) {
        customerMap[o.customer_email] = { name: o.customer_name, email: o.customer_email, orders: 0, total: 0 };
      }
      customerMap[o.customer_email].orders++;
      if (o.status !== "cancelled") customerMap[o.customer_email].total += o.total_amount;
    }
    const topCustomers = Object.values(customerMap)
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5);

    // Peak day
    const peakEntry = trend.reduce((best, d) => (d.all > best.all ? d : best), trend[0]);

    // Revenue this vs prev month
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;
    let revenueThisMonth = 0, revenuePrevMonth = 0;
    for (const o of orders.items) {
      if (o.status === "cancelled") continue;
      if (o.created_at.startsWith(thisMonth)) revenueThisMonth += o.total_amount;
      if (o.created_at.startsWith(prevMonth)) revenuePrevMonth += o.total_amount;
    }

    const cancellationRate = dashboard.total_orders > 0
      ? Math.round((dashboard.orders_by_status.cancelled / dashboard.total_orders) * 100)
      : 0;

    return {
      trend,
      topCustomers,
      avgFulfillmentDays: 2.4,
      cancellationRate,
      revenueThisMonth,
      revenuePrevMonth,
      peakDay: peakEntry?.date ?? "",
      peakDayCount: peakEntry?.all ?? 0,
    };
  }
  return api.get<ReportsSummary>("/reports/summary");
}
