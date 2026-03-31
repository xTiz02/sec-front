import { useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { CalendarDays, Eye, MoreHorizontal, Plus } from "lucide-react"
import { useGetScheduleMonthlysQuery } from "./api/monthlySchedulerApi"
import type { ScheduleMonthlyListParams } from "./api/monthlySchedulerApi"
import type { ScheduleMonthlyDto } from "./api/monthlySchedulerModel"
import { MonthLabel } from "@/features/assignment/api/assignmentModel"
import type { Month } from "./api/monthlySchedulerModel"
import { INDEX_TO_MONTH, MONTH_INDEX } from "./api/monthlySchedulerModel"
import { Button } from "@/components/ui/button"

function toMonthStr(month: Month | string | number): Month {
  if (typeof month === "string" && month in MONTH_INDEX) return month as Month
  const n = Number(month)
  if (n >= 1 && n <= 12) return INDEX_TO_MONTH[n - 1]
  if (n >= 0 && n <= 11) return INDEX_TO_MONTH[n]
  return month as Month
}
import { DataTable, type DataTableFilterField } from "@/components/custom/DataTable"
import { useDataTable } from "@/hooks/useDataTable"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ─── Filter fields ─────────────────────────────────────────────────────────────

const FILTER_FIELDS: DataTableFilterField[] = [
  {
    id: "name",
    label: "Nombre",
    type: "text",
    queryKey: "name",
    placeholder: "Buscar por nombre...",
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function ScheduleMonthlyListPage() {
  const navigate = useNavigate()
  const { serverState, queryParams } = useDataTable({ filterFields: FILTER_FIELDS })

  const params: ScheduleMonthlyListParams = {
    page: (queryParams as any).page ?? 0,
    size: (queryParams as any).size ?? 10,
    name: (queryParams as any).name,
  }

  const { data, isLoading, isFetching } = useGetScheduleMonthlysQuery(params)

  useEffect(() => {
    if (data) {
      ;(serverState as any)._setPageCount(data.totalPages)
      ;(serverState as any)._setTotalElements(data.totalElements)
    }
  }, [data])

  const columns: ColumnDef<ScheduleMonthlyDto>[] = [
    {
      id: "name",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      id: "period",
      header: "Período",
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {MonthLabel[toMonthStr(row.original.month)]} {row.original.year}
        </span>
      ),
    },
    {
      id: "description",
      header: "Descripción",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.description ?? "—"}
        </span>
      ),
    },
    {
      id: "createdAt",
      header: "Creado",
      cell: ({ row }) =>
        row.original.createdAt ? (
          <span className="text-sm text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleDateString("es-PE")}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      enableHiding: false,
      size: 48,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                navigate(`/modules/scheduling/monthly-scheduler/${row.original.id}`)
              }
            >
              <Eye className="mr-2 h-4 w-4" />
              Ver Detalle
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Programaciones Mensuales</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Planificaciones operativas por mes y año.
          </p>
        </div>
        <Button onClick={() => navigate("/modules/scheduling/monthly-scheduler/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Programación
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.content ?? []}
        isLoading={isLoading || isFetching}
        filterFields={FILTER_FIELDS}
        serverState={serverState}
      />
    </div>
  )
}
