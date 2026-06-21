import { useState } from "react";

export function usePagination(initialPage = 1, initialPageSize = 20) {
  const [page, setPage] = useState(initialPage);
  const [pageSize] = useState(initialPageSize);

  const goToPage = (p: number) => setPage(p);
  const nextPage = () => setPage((p) => p + 1);
  const prevPage = () => setPage((p) => Math.max(1, p - 1));
  const reset = () => setPage(1);

  return { page, pageSize, goToPage, nextPage, prevPage, reset };
}
