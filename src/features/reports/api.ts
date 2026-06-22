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

export interface ReportsParams {
  date_from?: string;
  date_to?: string;
}

export function fetchReportsSummary(params: ReportsParams = {}): Promise<ReportsSummary> {
  const query = new URLSearchParams();
  if (params.date_from) query.set("date_from", params.date_from);
  if (params.date_to) query.set("date_to", params.date_to);
  const qs = query.toString();
  return api.get<ReportsSummary>(`/reports/summary${qs ? `?${qs}` : ""}`);
}
