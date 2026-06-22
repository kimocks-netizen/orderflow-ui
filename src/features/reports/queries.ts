import { useQuery } from "@tanstack/react-query";
import { fetchReportsSummary, type ReportsParams } from "./api";

export function useReportsQuery(params: ReportsParams = {}) {
  return useQuery({
    queryKey: ["reports", "summary", params],
    queryFn: () => fetchReportsSummary(params),
    staleTime: 60_000,
  });
}
