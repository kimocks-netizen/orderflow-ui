import { useQuery } from "@tanstack/react-query";
import { fetchDashboardSummary } from "./api";

export function useDashboardQuery() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: fetchDashboardSummary,
    staleTime: 10_000,
  });
}
