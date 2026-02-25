import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"
import {
  useGetEmployeesQuery,
  useDeleteEmployeeMutation,
} from "./api/employeeApi"
import type { EmployeeDto } from "./api/employeeModel"
import {
  GenderLabel,
  CountryLabel,
  IdentificationTypeLabel,
} from "./api/employeeModel"
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
import { Eye, MoreHorizontal, Pencil, Trash2, UserPlus } from "lucide-react"
import { useState } from "react"
import { DataTable, type DataTableFilterField } from "@/components/custom/DataTable"

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
    id: "lastName",
    label: "Apellido",
    type: "text",
    queryKey: "lastName",
    placeholder: "Buscar por apellido...",
  },
  {
    id: "documentNumber",
    label: "Documento",
    type: "text",
    queryKey: "documentNumber",
    placeholder: "Nro. de documento...",
  },
  {
    id: "email",
    label: "Correo",
    type: "text",
    queryKey: "email",
    placeholder: "Buscar por correo...",
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export const EmployeesPage = () => {
  const navigate = useNavigate()
  const [deleteId, setDeleteId] = useState<number | undefined>()
  const [deleteEmployee] = useDeleteEmployeeMutation()

  const { serverState, queryParams } = useDataTable({ filterFields: FILTER_FIELDS })

  const { data, isLoading, isFetching } = useGetEmployeesQuery(queryParams)

  // Sync page count and total into serverState
  useEffect(() => {
    if (data) {
      ;(serverState as any)._setPageCount(data.totalPages)
      ;(serverState as any)._setTotalElements(data.totalElements)
    }
  }, [data])

  const columns: ColumnDef<EmployeeDto>[] = [
    {
      id: "firstName",
      accessorKey: "firstName",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.firstName} {row.original.lastName}
        </div>
      ),
      enableSorting: true,
    },
    {
      id: "documentNumber",
      accessorKey: "documentNumber",
      header: "Documento",
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-normal">
            {row.original.identificationType != null
              ? IdentificationTypeLabel[row.original.identificationType]
              : "—"}
          </Badge>
          <span className="font-mono text-sm">{row.original.documentNumber}</span>
        </div>
      ),
    },
    {
      id: "email",
      accessorKey: "email",
      header: "Correo",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.email}</span>
      ),
    },
    {
      id: "mobilePhone",
      accessorKey: "mobilePhone",
      header: "Teléfono",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm">{row.original.mobilePhone ?? "—"}</span>
      ),
    },
    {
      id: "gender",
      accessorKey: "gender",
      header: "Género",
      enableSorting: true,
      cell: ({ row }) =>
        row.original.gender != null ? (
          <span className="text-sm">{GenderLabel[row.original.gender]}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      id: "country",
      accessorKey: "country",
      header: "País",
      enableSorting: true,
      cell: ({ row }) =>
        row.original.country != null ? (
          <span className="text-sm">{CountryLabel[row.original.country]}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
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
                navigate(`/modules/personal/employees/${row.original.id}`)
              }
            >
              <Eye className="mr-2 h-4 w-4" />
              Ver Detalle
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                navigate(`/modules/personal/employees/${row.original.id}/edit`)
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

  const handleDelete = async () => {
    if (deleteId == null) return
    await deleteEmployee(deleteId)
    setDeleteId(undefined)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Empleados</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestiona el personal registrado en el sistema.
          </p>
        </div>
        <Button onClick={() => navigate("/modules/personal/employees/new")}>
          <UserPlus className="mr-2 h-4 w-4" />
          Nuevo Empleado
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.content ?? []}
        isLoading={isLoading || isFetching}
        filterFields={FILTER_FIELDS}
        serverState={serverState}
        toolbarExtra={null}
      />

      {/* Delete confirm */}
      <AlertDialog open={deleteId != null} onOpenChange={() => setDeleteId(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar empleado?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible. El empleado será eliminado permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
