import { useState, useEffect } from "react";

export function usePagination<T>(items: T[], pageSize = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // Reset to page 1 whenever the list changes (e.g. after search / delete)
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  const paginatedItems = items.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    hasPrev: currentPage > 1,
    hasNext: currentPage < totalPages,
    from: items.length === 0 ? 0 : (currentPage - 1) * pageSize + 1,
    to: Math.min(currentPage * pageSize, items.length),
    total: items.length,
  };
}