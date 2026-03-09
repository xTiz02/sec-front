import { useEffect, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import {
  useGetSpecialServiceUnitiesQuery,
  useDeleteSpecialServiceUnityMutation,
} from "./api/specialServiceUnityApi"
import type { SpecialServiceUnityDto } from "./api/specialServiceUnityModel"
import { useDataTable } from "@/hooks/useDataTable"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

// ─── Filter fields ────────────────────────────────────────────────────────────

const FILTER_FIELDS: DataTableFilterField[] = [
  {
    id: "unityName",
    label: "Nombre",
    type: "text",
    queryKey: "unityName",
    placeholder: "Buscar por nombre...",
  },
  {
    id: "code",
    label: "Código",
    type: "text",
    queryKey: "code",
    placeholder: "Buscar por código...",
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export const SpecialServiceUnityPage = () => {
  const navigate = useNavigate()
  const [deleteId, setDeleteId] = useState<number | undefined>()

  const [deleteUnity] = useDeleteSpecialServiceUnityMutation()
  const { serverState, queryParams } = useDataTable({ filterFields: FILTER_FIELDS })
  const { data, isLoading, isFetching } = useGetSpecialServiceUnitiesQuery(queryParams)

  useEffect(() => {
    if (data) {
      ;(serverState as any)._setPageCount(data.totalPages)
      ;(serverState as any)._setTotalElements(data.totalElements)
    }
  }, [data])

  const columns: ColumnDef<SpecialServiceUnityDto>[] = [
    {
      id: "unityName",
      header: "Establecimiento",
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <p className="font-medium">{row.original.unityName}</p>
            {row.original.unityDescription && (
              <p className="text-xs text-muted-foreground truncate max-w-48">
                {row.original.unityDescription}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "code",
      accessorKey: "code",
      header: "Código",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-sm font-mono">{row.original.code}</span>
      ),
    },
    {
      id: "address",
      accessorKey: "address",
      header: "Dirección",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.address ?? "—"}</span>
      ),
    },
    {
      id: "active",
      accessorKey: "active",
      header: "Estado",
      enableSorting: true,
      cell: ({ row }) =>
        row.original.active ? (
          <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50 dark:bg-green-900/20">
            Activo
          </Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            Inactivo
          </Badge>
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
                navigate(`/modules/special-services/unities/${row.original.id}`)
              }
            >
              <Eye className="mr-2 h-4 w-4" />
              Ver Detalle
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                navigate(`/modules/special-services/unities/${row.original.id}/edit`)
              }
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
          <h1 className="text-2xl font-bold">Unidades de Servicio Especial</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Lugares y establecimientos para servicios de guardia eventuales.
          </p>
        </div>
        <Button onClick={() => navigate("/modules/special-services/unities/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Unidad
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
            <AlertDialogTitle>¿Eliminar unidad?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible y eliminará el registro del establecimiento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (deleteId) await deleteUnity(deleteId)
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
