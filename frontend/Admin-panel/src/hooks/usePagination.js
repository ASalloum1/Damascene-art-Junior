import { useState, useMemo } from 'react';

export const PAGE_SIZE_OPTIONS = [10, 25, 50];

/**
 * Pagination state and derived data slice
 * @param {Array} data — full data array
 * @param {number} initialPageSize — initial page size (default 10)
 * @returns {{ page, pageSize, setPage, setPageSize, totalPages, paginatedData }}
 */
export function usePagination(data = [], initialPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  }, [data, page, pageSize]);

  const setPageSize = (newSize) => {
    setPageSizeState(newSize);
    setPage(1); // reset to first page when page size changes
  };

  // Ensure page doesn't exceed totalPages when data changes
  const safePage = Math.min(page, totalPages);
  if (safePage !== page) {
    setPage(safePage);
  }

  return {
    page: safePage,
    pageSize,
    setPage,
    setPageSize,
    totalPages,
    paginatedData,
    total: data.length,
  };
}
