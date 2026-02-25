import React, { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useToggleUserStatusMutation,
} from "../api/securityApi";
import type { UserWithEmployeeDto } from "../api/securityModel.ts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  UserPlus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  ShieldCheck,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounse.tsx";
import { avatarColor, fullName, initials } from "@/utils/helpers.ts";
import UserFormDialog from "./UserFormDialog.tsx";
import AssignProfilesDialog from "../securityProfile/AssignProfilesDialog.tsx";

export const UsersPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 400);

  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserWithEmployeeDto | undefined>();
  const [assignUser, setAssignUser] = useState<
    UserWithEmployeeDto | undefined
  >();
  const [deleteId, setDeleteId] = useState<number | undefined>();

  const { data, isLoading, isFetching, refetch } = useGetUsersQuery({
    page,
    size: 10,
    search,
  });

  const [deleteUser] = useDeleteUserMutation();
  const [toggleStatus] = useToggleUserStatusMutation();

  const handleDelete = async () => {
    if (deleteId == null) return;
    await deleteUser(deleteId);
    setDeleteId(undefined);
  };

  const handleToggleStatus = (user: UserWithEmployeeDto) => {
    toggleStatus({ id: user.id, enabled: !user.enabled });
  };

  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold ">
            Gestión de Usuarios
          </h1>
          <p className="mt-1 text-sm ">
            Administra el acceso y los perfiles de seguridad de cada usuario.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {data && (
            <div className="hidden text-right sm:block">
              <p className="text-xs ">TOTAL USUARIOS ACTIVOS</p>
              <p className="text-2xl font-bold text-blue-600">
                {data.totalElements.toLocaleString()}
              </p>
            </div>
          )}
          <Button onClick={() => setCreateOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Crear Usuario
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            className="pl-9"
            placeholder="Buscar por nombre, usuario o ID..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border ">
        <Table>
          <TableHeader>
            <TableRow className="">
              <TableHead>Empleado</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Perfil de Seguridad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Último Acceso</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 animate-pulse rounded " />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : data?.content.map((user) => (
                  <TableRow key={user.id} className="">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback
                            className={`text-xs  ${avatarColor(user.username)}`}
                          >
                            {initials(user)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium ">
                            {fullName(user)}
                          </p>
                          {user.employeeEmail && (
                            <p className="text-xs ">
                              {user.employeeEmail}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {user.username}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.securityProfileSet.length > 0 ? (
                          user.securityProfileSet.map((p) => (
                            <Badge
                              key={p.id}
                              variant="secondary"
                              className="text-xs"
                            >
                              {p.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs ">
                            Sin perfil
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div
                        className="flex cursor-pointer items-center gap-1.5"
                        onClick={() => handleToggleStatus(user)}
                      >
                        <div
                          className={`h-2 w-2 rounded-full ${user.enabled ? "bg-emerald-500" : "bg-slate-300"}`}
                        />
                        <span
                          className={`text-xs font-medium ${user.enabled ? "text-emerald-600" : "text-slate-400"}`}
                        >
                          {user.enabled ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm ">
                      {user.lastLogin
                        ? format(
                            new Date(user.lastLogin),
                            "dd MMM yyyy · HH:mm",
                            {
                              locale: es,
                            },
                          )
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setEditUser(user)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setAssignUser(user)}>
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Asignar Perfiles
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setDeleteId(user.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-sm ">
            {data
              ? `Mostrando ${data.number * data.size + 1}–${Math.min((data.number + 1) * data.size, data.totalElements)} de ${data.totalElements} resultados`
              : "—"}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const pageNum =
                totalPages <= 5
                  ? i
                  : page < 3
                    ? i
                    : page > totalPages - 4
                      ? totalPages - 5 + i
                      : page - 2 + i;
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8 text-sm"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum + 1}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <UserFormDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      {editUser && (
        <UserFormDialog
          open={!!editUser}
          onClose={() => setEditUser(undefined)}
          editUser={editUser}
        />
      )}
      {assignUser && (
        <AssignProfilesDialog
          open={!!assignUser}
          onClose={() => setAssignUser(undefined)}
          user={assignUser}
        />
      )}
      <AlertDialog
        open={deleteId != null}
        onOpenChange={() => setDeleteId(undefined)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El usuario será eliminado
              permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
