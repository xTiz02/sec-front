import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  useGetClientContractsQuery,
  useDeleteClientContractMutation,
} from "../api/contractScheduleApi"
import type { ClientContractDto } from "../api/contractScheduleModel"
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
  FileText,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"
import { DataTable, type DataTableFilterField } from "@/components/custom/DataTable"
import ClientContractFormDialog from "./ClientContractForm"
import type { ColumnDef } from "@tanstack/react-table"


// ─── Filter fields ────────────────────────────────────────────────────────────

const FILTER_FIELDS: DataTableFilterField[] = [
  {
    id: "name",
    label: "Nombre",
    type: "text",
    queryKey: "name",
    placeholder: "Buscar contrato...",
  },
  {
    id: "contractCode",
    label: "Código",
    type: "text",
    queryKey: "code",
    placeholder: "Buscar por código...",
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
      { label: "Activo", value: "true" },
      { label: "Inactivo", value: "false" },
    ],
    placeholder: "Estado",
  },
]


// ─── Main Page ────────────────────────────────────────────────────────────────

export const ClientContractsPage = () => {
  const navigate = useNavigate()
  const [formOpen, setFormOpen] = useState(false)
  const [editContract, setEditContract] = useState<ClientContractDto | undefined>()
  const [deleteId, setDeleteId] = useState<number | undefined>()

  const [deleteClientContract] = useDeleteClientContractMutation()
  const { serverState, queryParams } = useDataTable({ filterFields: FILTER_FIELDS })
  const { data, isLoading, isFetching } = useGetClientContractsQuery(queryParams)

  useEffect(() => {
    if (data) {
      ;(serverState as any)._setPageCount(data.totalPages)
      ;(serverState as any)._setTotalElements(data.totalElements)
    }
  }, [data])

  const openCreate = () => {
    setEditContract(undefined)
    setFormOpen(true)
  }

  const openEdit = (contract: ClientContractDto) => {
    setEditContract(contract)
    setFormOpen(true)
  }

  const columns: ColumnDef<ClientContractDto>[] = [
    {
      id: "name",
      accessorKey: "name",
      header: "Nombre del Contrato",
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      id: "contractCode",
      accessorKey: "contractCode",
      header: "Código",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-sm font-mono font-medium">{row.original.contractCode ?? "—"}</span>
      ),
    },
    {
      id: "clientName",
      accessorKey: "clientName",
      header: "Cliente",
      enableSorting: true,
      cell: ({ row }) => <span className="text-sm">{row.original.clientName ?? "—"}</span>,
    },
    {
      id: "clientCode",
      accessorKey: "clientCode",
      header: "Código Cliente",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm font-mono">{row.original.clientCode ?? "—"}</span>
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
            <DropdownMenuItem
              onClick={() => navigate(`/modules/scheduling/contracts/${row.original.id}`)}
            >
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
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contratos de Clientes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestiona los contratos de clientes y sus unidades asociadas.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Contrato
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.content ?? []}
        isLoading={isLoading || isFetching}
        filterFields={FILTER_FIELDS}
        serverState={serverState}
      />

      <ClientContractFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editContract={editContract}
      />

      <AlertDialog open={deleteId != null} onOpenChange={() => setDeleteId(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar contrato?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible y eliminará todas las unidades y configuraciones asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (deleteId) await deleteClientContract(deleteId)
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