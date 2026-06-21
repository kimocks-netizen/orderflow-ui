import { useState } from "react";

export function usePagination(initialPage = 1, initialPageSize = 10) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const goToPage = (p: number) => setPage(p);
  const reset = () => setPage(1);
  const changePageSize = (size: number) => { setPageSize(size); setPage(1); };

  return { page, pageSize, goToPage, reset, changePageSize };
}
