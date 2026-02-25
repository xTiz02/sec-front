import { useState, useCallback, useEffect } from "react"
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table"
import { useDebounce } from "./useDebounse"
import { buildQueryString, buildSortString, type DataTableFilterField, type DataTableServerState } from "@/components/custom/DataTable"


interface UseDataTableOptions {
  filterFields?: DataTableFilterField[]
  defaultPageSize?: number
}

interface UseDataTableReturn {
  serverState: DataTableServerState
  queryParams: {
    page: number
    size: number
    sort?: string
    query?: string
  }
}

export function useDataTable({
  filterFields = [],
  defaultPageSize = 10,
}: UseDataTableOptions = {}): UseDataTableReturn {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(defaultPageSize)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pageCount, setPageCount] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  // Debounce filters so text inputs don't fire on every keystroke
  const debouncedFilters = useDebounce(columnFilters, 400)

  // Reset to page 0 whenever filters or page size change
  useEffect(() => {
    setPage(0)
  }, [debouncedFilters, pageSize])

  const handlePageChange = useCallback((p: number) => setPage(p), [])
  const handlePageSizeChange = useCallback((s: number) => setPageSize(s), [])
  const handleSortingChange = useCallback((s: SortingState) => {
    setSorting(s)
    setPage(0)
  }, [])
  const handleFiltersChange = useCallback((f: ColumnFiltersState) => setColumnFilters(f), [])

  const queryString = buildQueryString(debouncedFilters, filterFields)
  const sortString = buildSortString(sorting)

  const serverState: DataTableServerState = {
    page,
    pageSize,
    pageCount,
    totalElements,
    sorting,
    columnFilters,
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleFiltersChange,
  }

  // Allow pages to set pageCount/totalElements from API response
  // They mutate serverState directly by calling these setters
  ;(serverState as any)._setPageCount = setPageCount
  ;(serverState as any)._setTotalElements = setTotalElements

  return {
    serverState,
    queryParams: {
      page,
      size: pageSize,
      ...(sortString ? { sort: sortString } : {}),
      ...(queryString ? { query: queryString } : {}),
    },
  }
}