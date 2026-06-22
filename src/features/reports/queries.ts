import { useQuery } from "@tanstack/react-query";
import { fetchReportsSummary } from "./api";

export function useReportsQuery() {
  return useQuery({
    queryKey: ["reports", "summary"],
    queryFn: fetchReportsSummary,
    staleTime: 60_000,
  });
}
