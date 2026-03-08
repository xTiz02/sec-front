import { useEffect, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import {
  useGetSpecialServiceSchedulesQuery,
  useDeleteSpecialServiceScheduleMutation,
} from "./api/specialServiceScheduleApi"
import type { SpecialServiceScheduleSummaryDto } from "./api/specialServiceScheduleModel"
import { useDataTable } from "@/hooks/useDataTable"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CalendarDays, Eye, MoreHorizontal, Plus, Trash2 } from "lucide-react"
import { DataTable, type DataTableFilterField } from "@/components/custom/DataTable"
import { useNavigate } from "react-router-dom"

// ─── Filter fields ────────────────────────────────────────────────────────────

const FILTER_FIELDS: DataTableFilterField[] = [
  {
    id: "specialServiceUnityName",
    label: "Establecimiento",
    type: "text",
    queryKey: "specialServiceUnity.unityName",
    placeholder: "Buscar por establecimiento...",
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export const SpecialServiceSchedulePage = () => {
  const navigate = useNavigate()
  const [deleteId, setDeleteId] = useState<number | undefined>()

  const [deleteSchedule] = useDeleteSpecialServiceScheduleMutation()
  const { serverState, queryParams } = useDataTable({ filterFields: FILTER_FIELDS })
  const { data, isLoading, isFetching } = useGetSpecialServiceSchedulesQuery(queryParams)

  useEffect(() => {
    if (data) {
      ;(serverState as any)._setPageCount(data.totalPages)
      ;(serverState as any)._setTotalElements(data.totalElements)
    }
  }, [data])

  const columns: ColumnDef<SpecialServiceScheduleSummaryDto>[] = [
    {
      id: "unity",
      header: "Establecimiento",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-medium">
            {row.original.specialServiceUnityName ?? `#${row.original.specialServiceUnityId}`}
          </span>
        </div>
      ),
    },
    {
      id: "dateRange",
      header: "Rango de Fechas",
      enableSorting: false,
      cell: ({ row }) => {
        const { dateFrom, dateTo } = row.original
        if (!dateFrom) return <span className="text-muted-foreground text-sm">—</span>
        return (
          <span className="text-sm">
            {dateFrom} {dateTo && dateTo !== dateFrom ? `→ ${dateTo}` : ""}
          </span>
        )
      },
    },
    {
      id: "totalDays",
      header: "Días",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm">{row.original.totalDays ?? "—"}</span>
      ),
    },
    {
      id: "totalAssignments",
      header: "Asignaciones",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm">{row.original.totalAssignments ?? "—"}</span>
      ),
    },
    {
      id: "createdAt",
      header: "Creado",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.createdAt?.split("T")[0] ?? "—"}
        </span>
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
                navigate(`/modules/special-services/schedules/${row.original.id}`)
              }
            >
              <Eye className="mr-2 h-4 w-4" />
              Ver Detalle
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setDeleteId(row.original.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
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
          <h1 className="text-2xl font-bold">Servicios Especiales</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Horarios de guardia para eventos y ubicaciones temporales.
          </p>
        </div>
        <Button onClick={() => navigate("/modules/special-services/schedules/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Servicio
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.content ?? []}
        isLoading={isLoading || isFetching}
        filterFields={FILTER_FIELDS}
        serverState={serverState}
      />

      <AlertDialog open={deleteId != null} onOpenChange={() => setDeleteId(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar servicio especial?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible y eliminará el servicio junto con todas sus asignaciones de guardia.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (deleteId) await deleteSchedule(deleteId)
                setDeleteId(undefined)
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
