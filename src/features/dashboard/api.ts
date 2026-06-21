import { api } from "@/lib/api-client";
import { mockApi, isMock } from "@/mocks/mockApi";
import type { DashboardSummary } from "@/types/dashboard";

export function fetchDashboardSummary(): Promise<DashboardSummary> {
  if (isMock) return mockApi.fetchDashboardSummary();
  return api.get<DashboardSummary>("/dashboard/summary");
}
