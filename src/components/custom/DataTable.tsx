import React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SelectFilterOption {
  label: string
  value: string
}

export interface DataTableFilterField {
  /** Must match the column id */
  id: string
  label: string
  /** "text" → free-text input, "select" → dropdown */
  type: "text" | "select"
  options?: SelectFilterOption[]
  /** backend field name if different from column id (e.g. "employee.firstName") */
  queryKey?: string
  placeholder?: string
}

export interface DataTableServerState {
  page: number
  pageSize: number
  pageCount: number
  totalElements: number
  sorting: SortingState
  columnFilters: ColumnFiltersState
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onSortingChange: (sorting: SortingState) => void
  onColumnFiltersChange: (filters: ColumnFiltersState) => void
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  isLoading?: boolean
  filterFields?: DataTableFilterField[]
  serverState: DataTableServerState
  /** Extra toolbar buttons (e.g. "Create" button) */
  toolbarExtra?: React.ReactNode
}

// ─── Sort Icon ─────────────────────────────────────────────────────────────────

export const SortIcon = ({ sorted }: { sorted: false | "asc" | "desc" }) => {
  if (sorted === "asc") return <ArrowUp className="ml-1.5 h-3.5 w-3.5" />
  if (sorted === "desc") return <ArrowDown className="ml-1.5 h-3.5 w-3.5" />
  return <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-40" />
}

// ─── Build query string for backend ───────────────────────────────────────────

export const buildQueryString = (
  filters: ColumnFiltersState,
  fields: DataTableFilterField[],
): string => {
  if (!filters.length) return ""

  return filters
    .map(f => {
      const field = fields.find(ff => ff.id === f.id)
      const key = field?.queryKey ?? f.id
      const val = f.value

      if (!val || (Array.isArray(val) && val.length === 0)) return ""

      if (Array.isArray(val)) {
        // multiple select → IN with | separator
        return `${key}:${val.join("|")},`
      }

      return `${key}:${val},`
    })
    .join("")
}

// ─── Build sort string for backend ────────────────────────────────────────────

export const buildSortString = (sorting: SortingState): string | undefined => {
  if (!sorting.length) return undefined
  return sorting.map(s => `${s.id},${s.desc ? "desc" : "asc"}`).join("&sort=")
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────

const SkeletonRows = ({ cols, rows = 8 }: { cols: number; rows?: number }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <TableRow key={i}>
        {Array.from({ length: cols }).map((_, j) => (
          <TableCell key={j}>
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
)

// ─── Active filters badge ─────────────────────────────────────────────────────

const ActiveFilterBadge = ({
  filters,
  fields,
  onRemove,
  onClearAll,
}: {
  filters: ColumnFiltersState
  fields: DataTableFilterField[]
  onRemove: (id: string) => void
  onClearAll: () => void
}) => {
  if (!filters.length) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {filters.map(f => {
        const field = fields.find(ff => ff.id === f.id)
        const val = Array.isArray(f.value) ? f.value.join(", ") : String(f.value)
        return (
          <span
            key={f.id}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs"
          >
            <span className="font-medium">{field?.label ?? f.id}:</span>
            <span className="text-muted-foreground">{val}</span>
            <button
              onClick={() => onRemove(f.id)}
              className="ml-0.5 rounded hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )
      })}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs text-muted-foreground"
        onClick={onClearAll}
      >
        Limpiar filtros
      </Button>
    </div>
  )
}

// ─── Main DataTable ───────────────────────────────────────────────────────────

export function DataTable<TData>({
  columns,
  data,
  isLoading,
  filterFields = [],
  serverState,
  toolbarExtra,
}: DataTableProps<TData>) {
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

  const table = useReactTable({
    data,
    columns,
    pageCount: serverState.pageCount,
    state: {
      sorting: serverState.sorting,
      columnFilters: serverState.columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: serverState.page,
        pageSize: serverState.pageSize,
      },
    },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    onSortingChange: updater => {
      const next =
        typeof updater === "function" ? updater(serverState.sorting) : updater
      serverState.onSortingChange(next)
    },
    onColumnFiltersChange: updater => {
      const next =
        typeof updater === "function"
          ? updater(serverState.columnFilters)
          : updater
      serverState.onColumnFiltersChange(next)
    },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
  })

  const removeFilter = (id: string) => {
    serverState.onColumnFiltersChange(
      serverState.columnFilters.filter(f => f.id !== id),
    )
  }

  const clearAllFilters = () => {
    serverState.onColumnFiltersChange([])
  }

  const PAGE_SIZES = [10, 20, 50, 100]

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          {/* Filter inputs */}
          <div className="flex flex-wrap items-center gap-2">
            {filterFields.map(field => {
              const currentVal =
                serverState.columnFilters.find(f => f.id === field.id)?.value

              if (field.type === "select" && field.options) {
                const selected = Array.isArray(currentVal)
                  ? (currentVal as string[])
                  : currentVal
                    ? [currentVal as string]
                    : []

                return (
                  <Select
                    key={field.id}
                    value={selected[0] ?? ""}
                    onValueChange={val => {
                      const next = serverState.columnFilters.filter(
                        f => f.id !== field.id,
                      )
                      if (val) next.push({ id: field.id, value: val })
                      serverState.onColumnFiltersChange(next)
                    }}
                  >
                    <SelectTrigger className="h-8 w-[160px] text-xs">
                      <SelectValue placeholder={field.placeholder ?? field.label} />
                    </SelectTrigger>
                    <SelectContent>
                      {/* <SelectItem value="">Todos</SelectItem> */}
                      {field.options.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )
              }

              return (
                <div key={field.id} className="relative">
                  <Input
                    placeholder={field.placeholder ?? `Buscar por ${field.label}...`}
                    value={(currentVal as string) ?? ""}
                    onChange={e => {
                      const val = e.target.value
                      const next = serverState.columnFilters.filter(
                        f => f.id !== field.id,
                      )
                      if (val) next.push({ id: field.id, value: val })
                      serverState.onColumnFiltersChange(next)
                    }}
                    className="h-8 w-[180px] text-xs"
                  />
                  {currentVal && (
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => removeFilter(field.id)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            {/* Column visibility */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />
                  Columnas
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>Visibilidad</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter(col => col.getCanHide())
                  .map(col => (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      checked={col.getIsVisible()}
                      onCheckedChange={val => col.toggleVisibility(val)}
                      className="capitalize text-xs"
                    >
                      {col.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {toolbarExtra}
          </div>
        </div>

        {/* Active filter pills */}
        <ActiveFilterBadge
          filters={serverState.columnFilters}
          fields={filterFields}
          onRemove={removeFilter}
          onClearAll={clearAllFilters}
        />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id}>
                {hg.headers.map(header => (
                  <TableHead key={header.id} style={{ width: header.getSize() }}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          "flex items-center",
                          header.column.getCanSort() &&
                            "cursor-pointer select-none hover:text-foreground",
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getCanSort() && (
                          <SortIcon sorted={header.column.getIsSorted()} />
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <SkeletonRows cols={columns.length} />
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  Sin resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer: rows info + page size + pagination */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            {serverState.totalElements > 0
              ? `${serverState.page * serverState.pageSize + 1}–${Math.min(
                  (serverState.page + 1) * serverState.pageSize,
                  serverState.totalElements,
                )} de ${serverState.totalElements}`
              : "Sin resultados"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Page size selector */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground hidden sm:inline">Filas por página</span>
            <Select
              value={String(serverState.pageSize)}
              onValueChange={v => serverState.onPageSizeChange(Number(v))}
            >
              <SelectTrigger className="h-8 w-[70px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map(s => (
                  <SelectItem key={s} value={String(s)}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Page navigation */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => serverState.onPageChange(0)}
              disabled={serverState.page === 0}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => serverState.onPageChange(serverState.page - 1)}
              disabled={serverState.page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 text-sm text-muted-foreground">
              {serverState.page + 1} / {serverState.pageCount || 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => serverState.onPageChange(serverState.page + 1)}
              disabled={serverState.page >= serverState.pageCount - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => serverState.onPageChange(serverState.pageCount - 1)}
              disabled={serverState.page >= serverState.pageCount - 1}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}