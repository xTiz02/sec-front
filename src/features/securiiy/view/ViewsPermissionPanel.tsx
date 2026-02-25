import React, { useState, useEffect } from "react"
import {
  useAssignViewsToProfileMutation,
  useGetAllViewsQuery,
} from "../api/securityApi"
import type {
  SecurityProfileDto,
  ViewDto,
} from "../api/securityModel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { AlertCircle, Filter, Save } from "lucide-react"
interface ViewsPermissionPanelProps {
  profile: SecurityProfileDto
}

const ViewsPermissionPanel: React.FC<ViewsPermissionPanelProps> = ({ profile }) => {
  const { data: allViews = [] } = useGetAllViewsQuery()
  const [assignViews, { isLoading }] = useAssignViewsToProfileMutation()
  const [filter, setFilter] = useState("")
  const [dirty, setDirty] = useState(false)

  const initialSelected = profile.viewAuthorizationList.map(v => v.view.id)
  const [selected, setSelected] = useState<number[]>(initialSelected)

  // reset when profile changes
  useEffect(() => {
    setSelected(profile.viewAuthorizationList.map(v => v.view.id))
    setDirty(false)
  }, [profile.id])

  const toggle = (id: number) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    )
    setDirty(true)
  }

  const toggleAll = (views: ViewDto[]) => {
    const ids = views.map(v => v.id)
    const allSelected = ids.every(id => selected.includes(id))
    setSelected(prev =>
      allSelected ? prev.filter(id => !ids.includes(id)) : [...new Set([...prev, ...ids])],
    )
    setDirty(true)
  }

  const handleSave = async () => {
    await assignViews({ profileId: profile.id, body: { viewIds: selected } }).unwrap()
    setDirty(false)
  }

  const handleDiscard = () => {
    setSelected(initialSelected)
    setDirty(false)
  }

  const filtered = allViews.filter(
    v =>
      !filter ||
      v.name.toLowerCase().includes(filter.toLowerCase()) ||
      v.route.toLowerCase().includes(filter.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Filter className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 " />
          <Input
            className="pl-8 h-8 text-sm"
            placeholder="Filtrar vistas..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
        <Badge variant="outline" className="text-xs">
          {selected.length}/{allViews.length} activas
        </Badge>
      </div>

      <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
        {filtered.map(view => (
          <div
            key={view.id}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-3 transition-colors ",
              selected.includes(view.id) && "",
            )}
            onClick={() => toggle(view.id)}
          >
            <Checkbox
              checked={selected.includes(view.id)}
              onCheckedChange={() => toggle(view.id)}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium ">{view.name}</p>
              <p className="truncate text-xs  font-mono">{view.route}</p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-6 text-center text-sm">
            No se encontraron vistas
          </p>
        )}
      </div>

      {dirty && (
        <div className="flex items-center justify-between rounded-lg  border-amber-200 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-amber-700">
            <AlertCircle className="h-4 w-4" />
            Tienes cambios sin guardar
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleDiscard}>
              Descartar
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isLoading}>
              <Save className="mr-1.5 h-3.5 w-3.5" />
              {isLoading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ViewsPermissionPanel