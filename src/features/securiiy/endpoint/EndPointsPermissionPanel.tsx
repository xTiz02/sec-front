import React, { useState, useEffect } from "react"
import {
  useAssignEndpointsToProfileMutation,
  useGetAllEndpointsQuery,
} from "../api/securityApi"
import type {
  SecurityProfileDto,
  EndpointDto,
} from "../api/securityModel"
import { PermissionTypeLabel } from "../api/securityModel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Save,
  AlertCircle,
  Filter,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { methodColor } from "@/utils/helpers"

interface EndpointsPermissionPanelProps {
  profile: SecurityProfileDto
}

const EndpointsPermissionPanel: React.FC<EndpointsPermissionPanelProps> = ({
  profile,
}) => {
  const { data: allEndpoints = [] } = useGetAllEndpointsQuery()
  const [assignEndpoints, { isLoading }] = useAssignEndpointsToProfileMutation()
  const [filter, setFilter] = useState("")
  const [dirty, setDirty] = useState(false)

  const initialSelected = profile.authorizedEndpointList.map(e => e.endpoint.id)
  const [selected, setSelected] = useState<number[]>(initialSelected)

  useEffect(() => {
    setSelected(profile.authorizedEndpointList.map(e => e.endpoint.id))
    setDirty(false)
  }, [profile.id])

  const toggle = (id: number) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    )
    setDirty(true)
  }

  const handleSave = async () => {
    await assignEndpoints({
      profileId: profile.id,
      body: { endpointIds: selected },
    }).unwrap()
    setDirty(false)
  }

  const handleDiscard = () => {
    setSelected(initialSelected)
    setDirty(false)
  }

  const filtered = allEndpoints.filter(
    ep =>
      !filter ||
      ep.name.toLowerCase().includes(filter.toLowerCase()) ||
      ep.route.toLowerCase().includes(filter.toLowerCase()),
  )

  // Group by route prefix (first segment after /api/v1/)
  const grouped = filtered.reduce<Record<string, EndpointDto[]>>((acc, ep) => {
    const parts = ep.route.split("/").filter(Boolean)
    const group = parts[2] ?? "general"
    if (!acc[group]) acc[group] = []
    acc[group].push(ep)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Filter className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
          <Input
            className="pl-8 h-8 text-sm"
            placeholder="Filtrar endpoints..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
        <Badge variant="outline" className="text-xs">
          {selected.length}/{allEndpoints.length} activos
        </Badge>
      </div>

      <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
        {Object.entries(grouped).map(([group, endpoints]) => {
          const allSel = endpoints.every(ep => selected.includes(ep.id))
          return (
            <div key={group} className="rounded-lg border">
              <div className="flex items-center justify-between border-b  px-3 py-2">
                <span className="text-xs font-semibold uppercase tracking-wider ">
                  {group}
                </span>
                <button
                  className="text-xs hover:underline"
                  onClick={() => {
                    const ids = endpoints.map(e => e.id)
                    setSelected(prev =>
                      allSel
                        ? prev.filter(id => !ids.includes(id))
                        : [...new Set([...prev, ...ids])],
                    )
                    setDirty(true)
                  }}
                >
                  {allSel ? "Desmarcar todo" : "Seleccionar todo"}
                </button>
              </div>
              <div className="divide-y">
                {endpoints.map(ep => (
                  <div
                    key={ep.id}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 transition-colors",
                      selected.includes(ep.id) && "",
                    )}
                    onClick={() => toggle(ep.id)}
                  >
                    <Checkbox
                      checked={selected.includes(ep.id)}
                      onCheckedChange={() => toggle(ep.id)}
                    />
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-xs font-bold",
                        methodColor[ep.permissionType],
                      )}
                    >
                      {PermissionTypeLabel[ep.permissionType]}
                    </span>
                    <span className="flex-1 font-mono text-xs ">
                      {ep.route}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <p className="py-6 text-center text-sm ">
            No se encontraron endpoints
          </p>
        )}
      </div>

      {dirty && (
        <div className="flex items-center justify-between rounded-lg border-amber-200 px-4 py-3">
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

export default EndpointsPermissionPanel