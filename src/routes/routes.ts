export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  ORDERS: "/orders",
  ORDER_DETAIL: (id: number | string) => `/orders/${id}`,
  CREATE_ORDER: "/orders/new",
  REPORTS: "/reports",
} as const;
