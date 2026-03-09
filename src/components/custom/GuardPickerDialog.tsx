import { useState } from "react"
import { useDebounce } from "@/hooks/useDebounse"
import { useGetGuardsQuery } from "@/features/guard/api/guardApi"
import { useGetExternalGuardsQuery } from "@/features/externalGuard/api/externalGuardApi"
import { GuardType, GuardTypeLabel } from "@/features/guard/api/guardModel"
import type { GuardDto } from "@/features/guard/api/guardModel"
import type { ExternalGuardDto } from "@/features/externalGuard/api/externalGuardModel"
import type { GuardUnityScheduleAssignmentDto } from "@/features/scheduling/api/monthlySchedulerModel"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Search, UserRound } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

export type GuardSelection =
  | { kind: "GUARD"; guard: GuardDto; guardType: GuardType }
  | { kind: "EXTERNAL"; externalGuard: ExternalGuardDto; guardType: GuardType }

export interface GuardPickerDialogProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  /**
   * When true, shows an "Externo" tab so the user can also search
   * for ExternalGuard records. Defaults to false.
   */
  allowExternal?: boolean
  /**
   * Monthly-pool records. Used to:
   *  - Show an "En el mes" badge
   *  - Inherit the guard's current monthly GuardType as default
   */
  guardSchedules?: GuardUnityScheduleAssignmentDto[]
  /**
   * Internal-guard IDs already present in the target shift/day.
   * They will be shown as disabled ("Ya asignado").
   */
  alreadyInShiftGuardIds?: Set<number>
  onSelect: (selection: GuardSelection) => Promise<void>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MIN_CHARS = 4

function initials(a?: string, b?: string) {
  return `${(a?.[0] ?? "?").toUpperCase()}${(b?.[0] ?? "").toUpperCase()}`
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GuardPickerDialog({
  open,
  onClose,
  title = "Seleccionar Guardia",
  description,
  allowExternal = false,
  guardSchedules = [],
  alreadyInShiftGuardIds = new Set(),
  onSelect,
}: GuardPickerDialogProps) {
  const [tab, setTab] = useState<"GUARD" | "EXTERNAL">("GUARD")
  const [search, setSearch] = useState("")
  /** Per-guard local type overrides (key = "G:id" or "E:id") */
  const [localTypes, setLocalTypes] = useState<Map<string, GuardType>>(new Map())
  const [selecting, setSelecting] = useState<string | null>(null)

  const debouncedSearch = useDebounce(search.trim(), 350)
  const shouldSearch = debouncedSearch.length >= MIN_CHARS

  // ── Queries ───────────────────────────────────────────────────────────────

  const { data: guardsPage, isFetching: fetchingGuards } = useGetGuardsQuery(
    { page: 0, size: 20, query: debouncedSearch },
    { skip: !open || !shouldSearch || tab !== "GUARD" },
  )

  const { data: extGuardsPage, isFetching: fetchingExt } = useGetExternalGuardsQuery(
    { page: 0, size: 20, query: debouncedSearch },
    { skip: !open || !shouldSearch || tab !== "EXTERNAL" || !allowExternal },
  )

  const guards = guardsPage?.content ?? []
  const extGuards = extGuardsPage?.content ?? []
  const isFetching = tab === "GUARD" ? fetchingGuards : fetchingExt

  // ── Helpers ───────────────────────────────────────────────────────────────

  function resolveGuardType(guardId: number, fallback: GuardType): GuardType {
    const key = `G:${guardId}`
    if (localTypes.has(key)) return localTypes.get(key)!
    const monthly = guardSchedules.find(gs => gs.guardAssignment?.guardId === guardId)
    return monthly?.guardType ?? fallback
  }

  function resolveExtType(extId: number): GuardType {
    return localTypes.get(`E:${extId}`) ?? GuardType.HOLDER
  }

  function setType(key: string, type: GuardType) {
    setLocalTypes(prev => new Map(prev).set(key, type))
  }

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSelect = async (selection: GuardSelection) => {
    const key = selection.kind === "GUARD"
      ? `G:${selection.guard.id}`
      : `E:${selection.externalGuard.id}`
    setSelecting(key)
    try {
      await onSelect(selection)
    } catch (err) {
      console.error("GuardPicker: error selecting guard", err)
    } finally {
      setSelecting(null)
    }
  }

  const handleClose = () => {
    setSearch("")
    setLocalTypes(new Map())
    onClose()
  }

  const handleTabChange = (next: "GUARD" | "EXTERNAL") => {
    setTab(next)
    setSearch("")
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  const emptyMsg = !shouldSearch
    ? `Escribe al menos ${MIN_CHARS} caracteres para buscar`
    : "Sin resultados"

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description ?? "Busca por nombre o número de documento."}
          </DialogDescription>
        </DialogHeader>

        {/* Tab switcher — only when external guards are allowed */}
        {allowExternal && (
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            <button
              type="button"
              className={cn(
                "flex-1 py-1.5 text-xs rounded-md font-medium transition-colors",
                tab === "GUARD"
                  ? "bg-white dark:bg-slate-800 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => handleTabChange("GUARD")}
            >
              Guardia Interno
            </button>
            <button
              type="button"
              className={cn(
                "flex-1 py-1.5 text-xs rounded-md font-medium transition-colors",
                tab === "EXTERNAL"
                  ? "bg-white dark:bg-slate-800 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => handleTabChange("EXTERNAL")}
            >
              Guardia Externo
            </button>
          </div>
        )}

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Nombre, apellido o documento..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto space-y-2 pr-1">

          {/* Loading */}
          {isFetching && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Empty / hint */}
          {!isFetching && (
            (tab === "GUARD" && guards.length === 0) ||
            (tab === "EXTERNAL" && extGuards.length === 0)
          ) && (
            <p className="text-sm text-muted-foreground text-center py-8">
              {emptyMsg}
            </p>
          )}

          {/* ── Internal guards ───────────────────────────────────────── */}
          {tab === "GUARD" && !isFetching && guards.map(guard => {
            const key = `G:${guard.id}`
            const emp = guard.employee
            const inShift = alreadyInShiftGuardIds.has(guard.id)
            const inPool = guardSchedules.some(gs => gs.guardAssignment?.guardId === guard.id)
            const currentType = resolveGuardType(guard.id, guard.guardType)
            const isSelecting = selecting === key

            return (
              <div
                key={guard.id}
                className={cn(
                  "flex items-center justify-between p-3 border border-border rounded-lg bg-card transition-opacity",
                  inShift && "opacity-50",
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="size-9 shrink-0">
                    <AvatarFallback className="text-xs font-bold">
                      {initials(emp?.firstName, emp?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-bold text-foreground truncate">
                        {emp?.firstName ?? "Guardia"} {emp?.lastName ?? ""}
                      </p>
                      {inPool && (
                        <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 shrink-0">
                          En el mes
                        </Badge>
                      )}
                      {inShift && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 shrink-0 text-muted-foreground">
                          Ya asignado
                        </Badge>
                      )}
                    </div>
                    {emp?.documentNumber && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Doc: {emp.documentNumber}
                      </p>
                    )}
                    {/* Guard type selector */}
                    <Select
                      value={currentType}
                      disabled={inShift}
                      onValueChange={val => setType(key, val as GuardType)}
                    >
                      <SelectTrigger className="h-5 w-28 text-[10px] mt-1 shadow-none focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(GuardType).map(t => (
                          <SelectItem key={t} value={t} className="text-xs">
                            {GuardTypeLabel[t]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  size="sm"
                  disabled={inShift || isSelecting || selecting !== null}
                  onClick={() =>
                    handleSelect({ kind: "GUARD", guard, guardType: currentType })
                  }
                  className="shrink-0 ml-3"
                >
                  {isSelecting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                  {inShift ? "Asignado" : isSelecting ? "Agregando..." : "Agregar"}
                </Button>
              </div>
            )
          })}

          {/* ── External guards ───────────────────────────────────────── */}
          {tab === "EXTERNAL" && !isFetching && extGuards.map(eg => {
            const key = `E:${eg.id}`
            const currentType = resolveExtType(eg.id)
            const isSelecting = selecting === key

            return (
              <div
                key={eg.id}
                className="flex items-center justify-between p-3 border border-border rounded-lg bg-card"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-9 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                    <UserRound className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-bold text-foreground truncate">
                        {eg.firstName} {eg.lastName}
                      </p>
                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 shrink-0 text-amber-600 border-amber-300">
                        Externo
                      </Badge>
                    </div>
                    {eg.documentNumber && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Doc: {eg.documentNumber}
                        {eg.businessName ? ` · ${eg.businessName}` : ""}
                      </p>
                    )}
                    {/* Guard type selector */}
                    <Select
                      value={currentType}
                      onValueChange={val => setType(key, val as GuardType)}
                    >
                      <SelectTrigger className="h-5 w-28 text-[10px] mt-1 shadow-none focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(GuardType).map(t => (
                          <SelectItem key={t} value={t} className="text-xs">
                            {GuardTypeLabel[t]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  size="sm"
                  disabled={isSelecting || selecting !== null}
                  onClick={() =>
                    handleSelect({ kind: "EXTERNAL", externalGuard: eg, guardType: currentType })
                  }
                  className="shrink-0 ml-3"
                >
                  {isSelecting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                  {isSelecting ? "Agregando..." : "Agregar"}
                </Button>
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
