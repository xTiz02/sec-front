import { useEffect, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import {
  useGetAssignmentsQuery,
  useDeleteAssignmentMutation,
} from "./api/assignmentApi"
import type { EmployeeAssignmentMonthlyDto } from "./api/assignmentModel"
import { ZoneTypeLabel, MonthLabel, Month, ZoneType } from "./api/assignmentModel"

import { useDataTable } from "@/hooks/useDataTable"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { Eye, MapPin, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"
import { DataTable, type DataTableFilterField } from "@/components/custom/DataTable"
import { useNavigate } from "react-router-dom"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (firstName?: string, lastName?: string) => {
  const f = firstName?.charAt(0)?.toUpperCase() ?? ""
  const l = lastName?.charAt(0)?.toUpperCase() ?? ""
  return `${f}${l}`
}

// ─── Filter fields ────────────────────────────────────────────────────────────

const FILTER_FIELDS: DataTableFilterField[] = [
  {
    id: "employee.firstName",
    label: "Jefe de Operaciones",
    type: "text",
    queryKey: "employee.firstName",
    placeholder: "Buscar por nombre...",
  },
  {
    id: "month",
    label: "Mes",
    type: "select",
    queryKey: "month",
    options: Object.values(Month).map(m => ({
      label: MonthLabel[m],
      value: m,
    })),
    placeholder: "Mes",
  },
  {
    id: "zoneType",
    label: "Zona",
    type: "select",
    queryKey: "zoneType",
    options: Object.values(ZoneType).map(z => ({
      label: ZoneTypeLabel[z],
      value: z,
    })),
    placeholder: "Zona",
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export const AssignmentPage = () => {
  const navigate = useNavigate()
  const [deleteId, setDeleteId] = useState<number | undefined>()

  const [deleteAssignment] = useDeleteAssignmentMutation()
  const { serverState, queryParams } = useDataTable({ filterFields: FILTER_FIELDS })
  const { data, isLoading, isFetching } = useGetAssignmentsQuery(queryParams)

  useEffect(() => {
    if (data) {
      ;(serverState as any)._setPageCount(data.totalPages)
      ;(serverState as any)._setTotalElements(data.totalElements)
    }
  }, [data])

  const columns: ColumnDef<EmployeeAssignmentMonthlyDto>[] = [
    {
      id: "employee.firstName",
      accessorKey: "employee.firstName",
      header: "Jefe de Operaciones",
      enableSorting: true,
      cell: ({ row }) => {
        const emp = row.original.employee
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="text-xs font-bold">
                {getInitials(emp?.firstName, emp?.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">
                {emp ? `${emp.firstName} ${emp.lastName}` : "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                {emp?.documentNumber ?? ""}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      id: "month",
      accessorKey: "month",
      header: "Mes/Año",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-sm">
          {MonthLabel[row.original.month]} {row.original.year}
        </span>
      ),
    },
    {
      id: "zoneType",
      accessorKey: "zoneType",
      header: "Zona Principal",
      enableSorting: true,
      cell: ({ row }) => (
        <Badge variant="secondary" className="gap-1.5">
          <MapPin className="h-3 w-3" />
          {ZoneTypeLabel[row.original.zoneType]}
        </Badge>
      ),
    },
    {
      id: "unitAssignments",
      header: "Unidades",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold">
            {row.original.unitAssignments?.length ?? 0}
          </span>
        </div>
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
              onClick={() => navigate(`/modules/scheduling/assignments/${row.original.id}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Ver Detalle
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate(`/modules/scheduling/assignments/${row.original.id}/edit`)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar
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
          <h1 className="text-2xl font-bold">Asignaciones de Supervisión</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestione y monitoree las asignaciones mensuales para los Jefes de Operaciones.
          </p>
        </div>
        <Button onClick={() => navigate("/modules/scheduling/assignments/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Asignación
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
            <AlertDialogTitle>¿Eliminar asignación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible. Se eliminarán todas las unidades asignadas a este
              jefe de operaciones para el período seleccionado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (deleteId) await deleteAssignment(deleteId)
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
