export interface DashboardSummary {
  total_orders: number;
  orders_by_status: {
    pending: number;
    paid: number;
    shipped: number;
    cancelled: number;
  };
  total_revenue: number;
  orders_today: number;
}
