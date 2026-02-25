import React, { useState } from "react"
import {
  useAssignProfilesToUserMutation,
  useGetProfilesQuery,
} from "../api/securityApi"
import type {
  UserWithEmployeeDto,
} from "../api/securityModel"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface AssignProfilesDialogProps {
  open: boolean
  onClose: () => void
  user: UserWithEmployeeDto
}

const AssignProfilesDialog: React.FC<AssignProfilesDialogProps> = ({
  open,
  onClose,
  user,
}) => {
  const { data: profiles = [] } = useGetProfilesQuery()
  const [assignProfiles, { isLoading }] = useAssignProfilesToUserMutation()

  const currentProfileIds = user.securityProfileSet.map(p => p.id)
  const [selected, setSelected] = useState<number[]>(currentProfileIds)

  const toggle = (id: number) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    )
  }

  const handleSave = async () => {
    try {
      await assignProfiles({
        userId: user.id,
        body: { profileIds: selected },
      }).unwrap()
      onClose()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Perfiles de Seguridad</DialogTitle>
          <DialogDescription>
            Asigna uno o más perfiles al usuario <strong>{user.username}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-64 space-y-2 overflow-y-auto py-2">
          {profiles.map(profile => (
            <div
              key={profile.id}
              className="flex items-start gap-3 rounded-lg border p-3 "
            >
              <Checkbox
                id={`profile-${profile.id}`}
                checked={selected.includes(profile.id)}
                onCheckedChange={() => toggle(profile.id)}
              />
              <div className="flex-1">
                <Label
                  htmlFor={`profile-${profile.id}`}
                  className="cursor-pointer font-medium"
                >
                  {profile.name}
                </Label>
                {profile.description && (
                  <p className="text-xs">{profile.description}</p>
                )}
              </div>
            </div>
          ))}
          {profiles.length === 0 && (
            <p className="py-4 text-center text-sm">
              No hay perfiles disponibles
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AssignProfilesDialog