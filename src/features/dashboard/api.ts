import { api } from "@/lib/api-client";
import type { DashboardSummary } from "@/types/dashboard";

export function fetchDashboardSummary(): Promise<DashboardSummary> {
  return api.get<DashboardSummary>("/dashboard/summary");
}
