import React, { useState, useEffect } from "react"
import {
  useGetProfilesQuery,
  useDeleteProfileMutation,
} from "../api/securityApi"
import type {
  SecurityProfileSummaryDto,
} from "../api/securityModel"
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
  Shield,
  Plus,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import ProfileDetail from "./ProfileDetail"
import ProfileFormDialog from "./ProfileFormDialog"

export const SecurityProfilesPage: React.FC = () => {
  const { data: profiles = [], isLoading } = useGetProfilesQuery()
  const [deleteProfile] = useDeleteProfileMutation()

  const [selectedId, setSelectedId] = useState<number | undefined>()
  const [createOpen, setCreateOpen] = useState(false)
  const [editProfile, setEditProfile] = useState<SecurityProfileSummaryDto | undefined>()
  const [deleteId, setDeleteId] = useState<number | undefined>()

  // Auto-select first profile
  useEffect(() => {
    if (profiles.length > 0 && !selectedId) {
      setSelectedId(profiles[0].id)
    }
  }, [profiles])

  const profileIcons: Record<string, React.ReactNode> = {
    admin: <Shield className="h-4 w-4 text-red-500" />,
    supervisor: <Shield className="h-4 w-4 text-blue-500" />,
    operator: <Shield className="h-4 w-4 text-slate-400" />,
  }

  const getIcon = (name: string) => {
    const key = name.toLowerCase()
    if (key.includes("admin")) return profileIcons.admin
    if (key.includes("super")) return profileIcons.supervisor
    return profileIcons.operator
  }

  const handleDelete = async () => {
    if (deleteId == null) return
    await deleteProfile(deleteId)
    if (selectedId === deleteId) setSelectedId(profiles.find(p => p.id !== deleteId)?.id)
    setDeleteId(undefined)
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold ">Perfiles de Seguridad</h1>
        <p className="mt-1 text-sm ">
          Configura los accesos a vistas y endpoints para cada perfil.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6 min-h-[600px]">
        {/* Left: Profile list */}
        <div className="w-72 shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold ">Perfiles</h3>
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Nuevo
            </Button>
          </div>

          <div className="space-y-1.5">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-lg"
                  />
                ))
              : profiles.map(profile => (
                  <button
                    key={profile.id}
                    onClick={() => setSelectedId(profile.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                        selectedId === profile.id ? "bg-gray-900" : "bg-slate-700",
                      )}
                    >
                      {getIcon(profile.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold ">
                        {profile.name}
                      </p>
                      <p className="truncate text-xs">
                        {profile.description || "Sin descripción"}
                      </p>
                    </div>
                    {selectedId === profile.id && (
                      <ChevronRight className="h-4 w-4 shrink-0 " />
                    )}
                  </button>
                ))}
          </div>

          {/* Usage tip */}
          <div className="rounded-lg border ">
            <p className="text-xs font-semibold uppercase tracking-wide ">
              Consejo
            </p>
            <p className="mt-1 text-xs  leading-relaxed">
              Los cambios en un perfil se aplican a todos los usuarios asignados en su próximo inicio de sesión.
            </p>
          </div>
        </div>

        {/* Right: Profile detail */}
        <div className="flex-1 rounded-xl border ">
          {selectedId ? (
            <ProfileDetail
              profileId={selectedId}
              onEdit={p => setEditProfile(p)}
              onDelete={id => setDeleteId(id)}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3">
              <Shield className="h-10 w-10" />
              <p className="text-sm">Selecciona un perfil para ver sus permisos</p>
              <Button variant="outline" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Crear primer perfil
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <ProfileFormDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      {editProfile && (
        <ProfileFormDialog
          open={!!editProfile}
          onClose={() => setEditProfile(undefined)}
          editProfile={editProfile}
        />
      )}
      <AlertDialog open={deleteId != null} onOpenChange={() => setDeleteId(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar perfil?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el perfil y revocará el acceso a todos los usuarios asignados.
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
  )
}