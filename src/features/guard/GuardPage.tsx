import { useEffect, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { useGetGuardsQuery, useDeleteGuardMutation } from "./api/guardApi"
import type { GuardDto } from "./api/guardModel"

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
import { Eye, MoreHorizontal, Pencil, Plus, Shield, Trash2 } from "lucide-react"
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
    id: "code",
    label: "Código",
    type: "text",
    queryKey: "code",
    placeholder: "Buscar por código...",
  },
  {
    id: "licenseNumber",
    label: "N° Licencia",
    type: "text",
    queryKey: "licenseNumber",
    placeholder: "Buscar por licencia...",
  },
]

export const GuardPage = () => {
  const navigate = useNavigate()
  const [deleteId, setDeleteId] = useState<number | undefined>()

  const [deleteGuard] = useDeleteGuardMutation()
  const { serverState, queryParams } = useDataTable({ filterFields: FILTER_FIELDS })
  const { data, isLoading, isFetching } = useGetGuardsQuery(queryParams)

  useEffect(() => {
    if (data) {
      ;(serverState as any)._setPageCount(data.totalPages)
      ;(serverState as any)._setTotalElements(data.totalElements)
    }
  }, [data])

  const columns: ColumnDef<GuardDto>[] = [
    {
      id: "employee",
      header: "Guardia",
      enableSorting: true,
      cell: ({ row }) => {
        const emp = row.original.employee
        return (
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium">
              {emp ? `${emp.firstName} ${emp.lastName}` : `Empleado #${row.original.employeeId}`}
            </span>
          </div>
        )
      },
    },
    {
      id: "code",
      accessorKey: "code",
      header: "Código",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-sm font-mono font-medium">{row.original.code}</span>
      ),
    },
    {
      id: "documentNumber",
      header: "Documento",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm font-mono">
          {row.original.employee?.documentNumber ?? "—"}
        </span>
      ),
    },
    {
      id: "licenseNumber",
      accessorKey: "licenseNumber",
      header: "N° Licencia",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-sm font-mono font-medium">{row.original.licenseNumber}</span>
      ),
    },
    {
      id: "email",
      header: "Email",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.employee?.email ?? "—"}
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
            <DropdownMenuItem onClick={() => navigate(`/modules/personal/guards/${row.original.id}`)}>
              <Eye className="mr-2 h-4 w-4" />
              Ver Detalle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/modules/personal/guards/${row.original.id}/edit`)}>
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
          <h1 className="text-2xl font-bold">Guardias</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestión de guardias de seguridad.
          </p>
        </div>
        <Button onClick={() => navigate("/modules/personal/guards/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Guardia
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
            <AlertDialogTitle>¿Eliminar guardia?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible y eliminará el registro del guardia.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (deleteId) await deleteGuard(deleteId)
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
