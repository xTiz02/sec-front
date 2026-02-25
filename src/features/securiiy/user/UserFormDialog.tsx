import React, { useState } from "react"
import {
  useCreateUserMutation,
  useUpdateUserMutation,
} from "../api/securityApi"
import type {
  CreateUserRequest,
  UpdateUserRequest,
  UserWithEmployeeDto,
} from "../api/securityModel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"


interface UserFormDialogProps {
  open: boolean
  onClose: () => void
  editUser?: UserWithEmployeeDto
}


const UserFormDialog: React.FC<UserFormDialogProps> = ({
  open,
  onClose,
  editUser,
}) => {
  const isEdit = !!editUser
  const [form, setForm] = useState<CreateUserRequest>({
    username: editUser?.username ?? "",
    password: "",
    enabled: editUser?.enabled ?? true,
  })
  const [createUser, { isLoading: creating }] = useCreateUserMutation()
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation()

  const isLoading = creating || updating

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isEdit) {
        const body: UpdateUserRequest = { username: form.username, enabled: form.enabled }
        await updateUser({ id: editUser!.id, body }).unwrap()
      } else {
        await createUser(form).unwrap()
      }
      onClose()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Usuario" : "Crear Nuevo Usuario"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifica los datos del usuario."
              : "Completa los datos para crear el usuario."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="username">Usuario</Label>
            <Input
              id="username"
              placeholder="nombre.usuario"
              value={form.username}
              onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
              required
            />
          </div>
          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
              />
            </div>
          )}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label>Estado</Label>
              <p className="text-xs ">Usuario activo en el sistema</p>
            </div>
            <Switch
              checked={form.enabled}
              onCheckedChange={v => setForm(p => ({ ...p, enabled: v }))}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : isEdit ? "Guardar Cambios" : "Crear Usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default UserFormDialog