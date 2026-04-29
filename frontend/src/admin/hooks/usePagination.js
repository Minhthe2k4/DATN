import { useState, useMemo, useEffect } from 'react'

/**
 * Custom hook for client-side pagination with dynamic page size
 * @param {Array} data - The full list of items
 * @param {number} initialPageSize - Initial number of items per page
 * @returns {object} - Pagination state and methods
 */
export function usePagination(data = [], initialPageSize = 10) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const totalPages = useMemo(() => {
    return Math.ceil(data.length / pageSize) || 1
  }, [data.length, pageSize])

  // Reset to first page if current page becomes invalid (e.g., after filtering or changing page size)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return data.slice(start, end)
  }, [data, currentPage, pageSize])

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handlePageSizeChange = (newSize) => {
    setPageSize(Number(newSize))
    setCurrentPage(1) // Reset to first page when size changes
  }

  return {
    currentPage,
    totalPages,
    paginatedData,
    handlePageChange,
    handlePageSizeChange,
    setCurrentPage,
    pageSize
  }
}
