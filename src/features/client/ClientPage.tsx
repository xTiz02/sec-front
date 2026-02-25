import { useEffect, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import {
  useGetClientsQuery,
  useDeleteClientMutation,
} from "./api/clientApi"
import type { ClientDto } from "./api/clientModel"

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
import { Building2, Eye, MoreHorizontal, Pencil, Plus, Trash2, X } from "lucide-react"
import { DataTable, type DataTableFilterField } from "@/components/custom/DataTable"
import ClientFormDialog from "./ClientFormDialog"
import { useNavigate } from "react-router-dom"

// ─── Filter fields ────────────────────────────────────────────────────────────

const FILTER_FIELDS: DataTableFilterField[] = [
  {
    id: "name",
    label: "Nombre",
    type: "text",
    queryKey: "name",
    placeholder: "Buscar cliente...",
  },
  {
    id: "code",
    label: "Código",
    type: "text",
    queryKey: "code",
    placeholder: "Código...",
  },
  {
    id: "active",
    label: "Estado",
    type: "select",
    queryKey: "active",
    options: [
      { label: "Activo", value: "true" },
      { label: "Inactivo", value: "false" },
    ],
    placeholder: "Estado",
  },
]

export const ClientsPage = () => {
  const navigate = useNavigate()
  const [formOpen, setFormOpen] = useState(false)
  const [editClient, setEditClient] = useState<ClientDto | undefined>()
  const [deleteId, setDeleteId] = useState<number | undefined>()

  const [deleteClient] = useDeleteClientMutation()
  const { serverState, queryParams } = useDataTable({ filterFields: FILTER_FIELDS })
  const { data, isLoading, isFetching } = useGetClientsQuery(queryParams)

  useEffect(() => {
    if (data) {
      ;(serverState as any)._setPageCount(data.totalPages)
      ;(serverState as any)._setTotalElements(data.totalElements)
    }
  }, [data])

  const openCreate = () => {
    setEditClient(undefined)
    setFormOpen(true)
  }

  const openEdit = (client: ClientDto) => {
    setEditClient(client)
    setFormOpen(true)
  }

  const columns: ColumnDef<ClientDto>[] = [
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
      header: "Nombre",
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      id: "description",
      accessorKey: "description",
      header: "Descripción",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.description ?? "—"}
        </span>
      ),
    },
    {
      id: "direction",
      accessorKey: "direction",
      header: "Dirección",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.direction ?? "—"}
        </span>
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
            Activo
          </Badge>
        ) : (
          <Badge variant="outline" className="border-destructive text-destructive">
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
            <DropdownMenuItem onClick={() => navigate(`/modules/clients/${row.original.id}`)}>
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
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organizaciones contratantes del servicio de seguridad.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.content ?? []}
        isLoading={isLoading || isFetching}
        filterFields={FILTER_FIELDS}
        serverState={serverState}
      />

      <ClientFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editClient={editClient}
      />

      <AlertDialog open={deleteId != null} onOpenChange={() => setDeleteId(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible y podría afectar las unidades asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (deleteId) await deleteClient(deleteId)
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