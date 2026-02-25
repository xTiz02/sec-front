import { useEffect, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import {
  useGetUnitiesQuery,
  useDeleteUnityMutation,
} from "./api/unityApi"
import type { UnityDto } from "./api/unityModel"
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
import {
  Eye,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"
import { DataTable, type DataTableFilterField } from "@/components/custom/DataTable"
import UnityFormDialog from "./UnityFormDialog"
import { useNavigate } from "react-router"

// ─── Filter fields ────────────────────────────────────────────────────────────

const FILTER_FIELDS: DataTableFilterField[] = [
  {
    id: "name",
    label: "Nombre",
    type: "text",
    queryKey: "name",
    placeholder: "Buscar unidad...",
  },
  {
    id: "code",
    label: "Código",
    type: "text",
    queryKey: "code",
    placeholder: "Código...",
  },
  {
    id: "clientName",
    label: "Cliente",
    type: "text",
    queryKey: "client.name",
    placeholder: "Nombre del cliente...",
  },
  {
    id: "active",
    label: "Estado",
    type: "select",
    queryKey: "active",
    options: [
      { label: "Activa", value: "true" },
      { label: "Inactiva", value: "false" },
    ],
    placeholder: "Estado",
  },
]

export const UnitiesPage = () => {
  const navigate = useNavigate()
  const [formOpen, setFormOpen] = useState(false)
  const [editUnity, setEditUnity] = useState<UnityDto | undefined>()
  const [deleteId, setDeleteId] = useState<number | undefined>()

  const [deleteUnity] = useDeleteUnityMutation()
  const { serverState, queryParams } = useDataTable({ filterFields: FILTER_FIELDS })
  const { data, isLoading, isFetching } = useGetUnitiesQuery(queryParams)

  useEffect(() => {
    if (data) {
      ;(serverState as any)._setPageCount(data.totalPages)
      ;(serverState as any)._setTotalElements(data.totalElements)
    }
  }, [data])

  const openCreate = () => {
    setEditUnity(undefined)
    setFormOpen(true)
  }

  const openEdit = (unity: UnityDto) => {
    setEditUnity(unity)
    setFormOpen(true)
  }

  const columns: ColumnDef<UnityDto>[] = [
    {
      id: "code",
      accessorKey: "code",
      header: "Código",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium">{row.original.code}</span>
      ),
    },
    {
      id: "name",
      accessorKey: "name",
      header: "Unidad",
      enableSorting: true,
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          {row.original.description && (
            <p className="text-xs text-muted-foreground">{row.original.description}</p>
          )}
        </div>
      ),
    },
    {
      id: "clientName",
      accessorKey: "clientName",
      header: "Cliente",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-sm">{row.original.clientName ?? "—"}</span>
      ),
    },
    {
      id: "direction",
      accessorKey: "direction",
      header: "Dirección",
      enableSorting: false,
      cell: ({ row }) =>
        row.original.direction ? (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {row.original.direction}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      id: "rangeCoverage",
      accessorKey: "rangeCoverage",
      header: "Cobertura",
      enableSorting: false,
      cell: ({ row }) =>
        row.original.rangeCoverage != null ? (
          <span className="text-sm">{row.original.rangeCoverage} m</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      id: "active",
      accessorKey: "active",
      header: "Estado",
      enableSorting: true,
      cell: ({ row }) =>
        row.original.active ? (
          <Badge variant="outline" className="border-green-500 text-green-600">
            Activa
          </Badge>
        ) : (
          <Badge variant="outline" className="border-destructive text-destructive">
            Inactiva
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
            <DropdownMenuItem onClick={() => navigate(`/modules/units/${row.original.id}`)}>
              <Eye className="mr-2 h-4 w-4" />
              Ver Detalle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openEdit(row.original)}>
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
          <h1 className="text-2xl font-bold">Unidades</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sedes y sucursales donde los guardias prestan servicio.
          </p>
        </div>
        <Button onClick={openCreate}>
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

      <UnityFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editUnity={editUnity}
      />

      <AlertDialog open={deleteId != null} onOpenChange={() => setDeleteId(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar unidad?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible y podría afectar los horarios y asignaciones asociadas.
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