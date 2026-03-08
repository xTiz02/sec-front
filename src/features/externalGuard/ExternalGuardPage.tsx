import { useEffect, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { useGetExternalGuardsQuery, useDeleteExternalGuardMutation } from "./api/externalGuardApi"
import type { ExternalGuardDto } from "./api/externalGuardModel"
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
import { Eye, MoreHorizontal, Pencil, Plus, Trash2, UserRound } from "lucide-react"
import { DataTable, type DataTableFilterField } from "@/components/custom/DataTable"
import { useNavigate } from "react-router-dom"

// ─── Filter fields ────────────────────────────────────────────────────────────

const FILTER_FIELDS: DataTableFilterField[] = [
  {
    id: "firstName",
    label: "Nombre",
    type: "text",
    queryKey: "firstName",
    placeholder: "Buscar por nombre...",
  },
  {
    id: "documentNumber",
    label: "Documento",
    type: "text",
    queryKey: "documentNumber",
    placeholder: "Buscar por documento...",
  },
  {
    id: "businessName",
    label: "Empresa",
    type: "text",
    queryKey: "businessName",
    placeholder: "Buscar por empresa...",
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export const ExternalGuardPage = () => {
  const navigate = useNavigate()
  const [deleteId, setDeleteId] = useState<number | undefined>()

  const [deleteExternalGuard] = useDeleteExternalGuardMutation()
  const { serverState, queryParams } = useDataTable({ filterFields: FILTER_FIELDS })
  const { data, isLoading, isFetching } = useGetExternalGuardsQuery(queryParams)

  useEffect(() => {
    if (data) {
      ;(serverState as any)._setPageCount(data.totalPages)
      ;(serverState as any)._setTotalElements(data.totalElements)
    }
  }, [data])

  const columns: ColumnDef<ExternalGuardDto>[] = [
    {
      id: "name",
      header: "Guardia Externo",
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <UserRound className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-medium">
            {row.original.firstName} {row.original.lastName}
          </span>
        </div>
      ),
    },
    {
      id: "businessName",
      accessorKey: "businessName",
      header: "Empresa",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.businessName ?? "—"}
        </span>
      ),
    },
    {
      id: "documentNumber",
      accessorKey: "documentNumber",
      header: "Documento",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm font-mono">{row.original.documentNumber}</span>
      ),
    },
    {
      id: "email",
      accessorKey: "email",
      header: "Email",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.email}</span>
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
              onClick={() => navigate(`/modules/personal/external-guards/${row.original.id}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Ver Detalle
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                navigate(`/modules/personal/external-guards/${row.original.id}/edit`)
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
          <h1 className="text-2xl font-bold">Guardias Externos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestión de guardias contratados temporalmente.
          </p>
        </div>
        <Button onClick={() => navigate("/modules/personal/external-guards/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Guardia Externo
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
            <AlertDialogTitle>¿Eliminar guardia externo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible y eliminará el registro del guardia externo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (deleteId) await deleteExternalGuard(deleteId)
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
