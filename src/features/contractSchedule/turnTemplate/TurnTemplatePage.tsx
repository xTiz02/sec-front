import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"
import {
  useGetTurnTemplatesQuery,
  useDeleteTurnTemplateMutation,
} from "../api/contractScheduleApi"
import type { TurnTemplateDto } from "../api/contractScheduleModel"
import { TurnTypeLabel } from "../api/contractScheduleModel"
import { useDataTable } from "@/hooks/useDataTable"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Clock, Eye, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"
import { DataTable, type DataTableFilterField } from "@/components/custom/DataTable"

// ─── Filter fields ────────────────────────────────────────────────────────────

const FILTER_FIELDS: DataTableFilterField[] = [
  {
    id: "name",
    label: "Nombre",
    type: "text",
    queryKey: "name",
    placeholder: "Buscar plantilla...",
  },
  {
    id: "turnType",
    label: "Tipo",
    type: "select",
    queryKey: "turnType",
    options: [
      { label: "Diurno", value: "0" },
      { label: "Nocturno", value: "1" },
    ],
    placeholder: "Tipo de turno",
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export const TurnTemplatesPage = () => {
  const navigate = useNavigate()
  const [deleteId, setDeleteId] = useState<number | undefined>()

  const [deleteTurnTemplate] = useDeleteTurnTemplateMutation()
  const { serverState, queryParams } = useDataTable({ filterFields: FILTER_FIELDS })
  const { data, isLoading, isFetching } = useGetTurnTemplatesQuery(queryParams)

  useEffect(() => {
    if (data) {
      ;(serverState as any)._setPageCount(data.totalPages)
      ;(serverState as any)._setTotalElements(data.totalElements)
    }
  }, [data])

  const columns: ColumnDef<TurnTemplateDto>[] = [
    {
      id: "name",
      accessorKey: "name",
      header: "Nombre",
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      id: "turnType",
      accessorKey: "turnType",
      header: "Tipo de Turno",
      enableSorting: true,
      cell: ({ row }) => (
        <Badge variant={row.original.turnType === 0 ? "default" : "secondary"}>
          {TurnTypeLabel[row.original.turnType]}
        </Badge>
      ),
    },
    {
      id: "timeFrom",
      accessorKey: "timeFrom",
      header: "Hora Inicio",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.timeFrom}</span>
      ),
    },
    {
      id: "timeTo",
      accessorKey: "timeTo",
      header: "Hora Fin",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.timeTo}</span>
      ),
    },
    {
      id: "numGuards",
      accessorKey: "numGuards",
      header: "Guardias",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {row.original.numGuards} {row.original.numGuards === 1 ? "guardia" : "guardias"}
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
              onClick={() => navigate(`/modules/scheduling/turn-templates/${row.original.id}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Ver Detalle
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate(`/modules/scheduling/turn-templates/${row.original.id}/edit`)}
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
          <h1 className="text-2xl font-bold">Plantillas de Turno</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Plantillas reutilizables para asignar turnos a días de la semana.
          </p>
        </div>
        <Button onClick={() => navigate("/modules/scheduling/turn-templates/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Plantilla
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
            <AlertDialogTitle>¿Eliminar plantilla de turno?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible. La plantilla será eliminada y no podrá ser
              asignada a nuevos contratos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (deleteId) await deleteTurnTemplate(deleteId)
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