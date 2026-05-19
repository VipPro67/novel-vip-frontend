"use client"

import { useMemo, useState } from "react"
import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table"

type UseServerTableOptions<TData> = {
  data: TData[]
  columns: ColumnDef<TData>[]
  pageCount: number
  initialPageSize?: number
  initialSorting?: SortingState
  initialGlobalFilter?: string
}

export function useServerTable<TData>({
  data,
  columns,
  pageCount,
  initialPageSize = 10,
  initialSorting = [],
  initialGlobalFilter = "",
}: UseServerTableOptions<TData>) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  })
  const [sorting, setSorting] = useState<SortingState>(initialSorting)
  const [globalFilter, setGlobalFilter] = useState(initialGlobalFilter)

  const params = useMemo(
    () => ({
      page: pagination.pageIndex,
      size: pagination.pageSize,
      sortBy: sorting[0]?.id,
      sortDir: sorting[0]?.desc ? "desc" : "asc",
      search: globalFilter.trim() || undefined,
    }),
    [globalFilter, pagination.pageIndex, pagination.pageSize, sorting],
  )

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      pagination,
      sorting,
      globalFilter,
    },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
  })

  return {
    table,
    pagination,
    sorting,
    globalFilter,
    setPagination,
    setSorting,
    setGlobalFilter,
    params,
    pageCount,
  }
}
