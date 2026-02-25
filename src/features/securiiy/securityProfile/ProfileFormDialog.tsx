import React, { useState } from "react"
import {
  useCreateProfileMutation,
  useUpdateProfileMutation,
} from "../api/securityApi"
import type {
  SecurityProfileSummaryDto,
} from "../api/securityModel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface ProfileFormDialogProps {
  open: boolean
  onClose: () => void
  editProfile?: SecurityProfileSummaryDto
}

const ProfileFormDialog: React.FC<ProfileFormDialogProps> = ({
  open,
  onClose,
  editProfile,
}) => {
  const isEdit = !!editProfile
  const [name, setName] = useState(editProfile?.name ?? "")
  const [description, setDescription] = useState(editProfile?.description ?? "")

  const [createProfile, { isLoading: creating }] = useCreateProfileMutation()
  const [updateProfile, { isLoading: updating }] = useUpdateProfileMutation()
  const isLoading = creating || updating

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isEdit) {
        await updateProfile({ id: editProfile!.id, body: { name, description } }).unwrap()
      } else {
        await createProfile({ name, description }).unwrap()
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
          <DialogTitle>
            {isEdit ? "Editar Perfil" : "Nuevo Perfil de Seguridad"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifica el nombre y descripción del perfil."
              : "Define el nombre y descripción del nuevo perfil."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Nombre</Label>
            <Input
              id="profile-name"
              placeholder="Ej: Supervisor de Operaciones"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-desc">Descripción</Label>
            <Textarea
              id="profile-desc"
              placeholder="Describe los accesos que tendrá este perfil..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : isEdit ? "Guardar" : "Crear Perfil"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ProfileFormDialog