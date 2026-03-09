import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { format, addDays, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { useCreateSpecialServiceScheduleMutation } from "./api/specialServiceScheduleApi"
import { useGetSpecialServiceUnitiesQuery } from "../unity/api/specialServiceUnityApi"
import { GuardType, GuardTypeLabel } from "@/features/guard/api/guardModel"
import { TurnType, TurnTypeLabel } from "@/features/contractSchedule/api/contractScheduleModel"
import type { CreateSpecialServiceAssignmentRequest } from "./api/specialServiceScheduleModel"
import { GuardPickerDialog } from "@/components/custom/GuardPickerDialog"
import type { GuardSelection } from "@/components/custom/GuardPickerDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, CalendarDays, ChevronDown, ChevronUp, Plus, Save, Trash2, Loader2, UserRound } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Local state types ─────────────────────────────────────────────────────────

type GuardRow = {
  _key: string
  /** "G:{id}" for internal guard, "E:{id}" for external guard */
  encodedGuard: string
  guardLabel: string
  guardType: GuardType
  timeFrom: string
  timeTo: string
  turnType: TurnType
}

type DayEntry = {
  date: string
  expanded: boolean
  guards: GuardRow[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function newGuardRow(): GuardRow {
  return {
    _key: Math.random().toString(36).slice(2),
    encodedGuard: "",
    guardLabel: "",
    guardType: GuardType.HOLDER,
    timeFrom: "08:00",
    timeTo: "20:00",
    turnType: TurnType.DAY,
  }
}

function parseDateStr(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function generateDays(from: string, to: string): DayEntry[] {
  const start = parseDateStr(from)
  const end = parseDateStr(to)
  if (start > end) return []
  const result: DayEntry[] = []
  let current = start
  while (current <= end) {
    const dateStr = format(current, "yyyy-MM-dd")
    result.push({ date: dateStr, expanded: result.length === 0, guards: [] })
    current = addDays(current, 1)
  }
  return result
}

function formatDayHeader(dateStr: string): string {
  try {
    return format(parseISO(dateStr + "T12:00:00"), "EEEE, d 'de' MMMM", { locale: es })
  } catch {
    return dateStr
  }
}

function formatDateBadge(dateStr: string): { month: string; day: string } {
  try {
    const d = parseISO(dateStr + "T12:00:00")
    return {
      month: format(d, "MMM", { locale: es }).toUpperCase(),
      day: format(d, "d"),
    }
  } catch {
    return { month: "???", day: "?" }
  }
}

// ─── DayCard ──────────────────────────────────────────────────────────────────

interface DayCardProps {
  day: DayEntry
  dayIdx: number
  onToggle: () => void
  onRemoveDay: () => void
  onAddGuard: () => void
  onPickGuard: (rowKey: string) => void
  onRemoveGuard: (key: string) => void
  onGuardChange: (key: string, field: keyof GuardRow, value: string) => void
}

function DayCard({
  day,
  onToggle,
  onRemoveDay,
  onAddGuard,
  onPickGuard,
  onRemoveGuard,
  onGuardChange,
}: DayCardProps) {
  const badge = formatDateBadge(day.date)
  const hasGuards = day.guards.length > 0

  return (
    <div
      className={cn(
        "rounded-xl border shadow-sm overflow-hidden bg-white dark:bg-slate-900",
        hasGuards
          ? "border-l-4 border-l-primary border-y border-r border-slate-200 dark:border-slate-800"
          : "border border-slate-200 dark:border-slate-800",
      )}
    >
      {/* Day header */}
      <div
        className={cn(
          "p-4 flex items-center justify-between cursor-pointer",
          day.expanded
            ? "border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50"
            : "",
        )}
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "h-10 w-10 rounded-lg flex flex-col items-center justify-center font-bold",
              hasGuards
                ? "bg-primary text-white"
                : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
            )}
          >
            <span className="text-[10px] leading-none uppercase">{badge.month}</span>
            <span className="text-lg leading-none">{badge.day}</span>
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-slate-100 capitalize">
              {formatDayHeader(day.date)}
            </p>
            <p className="text-xs text-slate-500">
              {hasGuards
                ? `${day.guards.length} guardia${day.guards.length !== 1 ? "s" : ""} asignado${day.guards.length !== 1 ? "s" : ""}`
                : "Sin personal asignado aún"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-destructive"
            onClick={e => {
              e.stopPropagation()
              onRemoveDay()
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          {day.expanded ? (
            <ChevronUp className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-400" />
          )}
        </div>
      </div>

      {/* Guard table */}
      {day.expanded && (
        <div className="p-5">
          {day.guards.length > 0 && (
            <table className="w-full text-left mb-4">
              <thead>
                <tr className="text-xs uppercase text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-3 font-semibold">Guardia</th>
                  <th className="pb-3 font-semibold w-28">Entrada</th>
                  <th className="pb-3 font-semibold w-28">Salida</th>
                  <th className="pb-3 font-semibold w-36">Rol</th>
                  <th className="pb-3 font-semibold w-28">Turno</th>
                  <th className="pb-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {day.guards.map(row => (
                  <tr key={row._key}>
                    {/* Guard picker button */}
                    <td className="py-3 pr-3">
                      <button
                        type="button"
                        onClick={() => onPickGuard(row._key)}
                        className="flex items-center gap-2 text-sm font-medium text-left hover:text-primary transition-colors"
                      >
                        <UserRound className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className={cn(row.encodedGuard ? "text-foreground" : "text-muted-foreground")}>
                          {row.guardLabel || "Seleccionar guardia..."}
                        </span>
                      </button>
                    </td>

                    {/* Entry time */}
                    <td className="py-3 pr-3">
                      <input
                        type="time"
                        value={row.timeFrom}
                        onChange={e => onGuardChange(row._key, "timeFrom", e.target.value)}
                        className="border-0 bg-transparent focus:ring-0 p-0 text-sm text-slate-600 dark:text-slate-400"
                      />
                    </td>

                    {/* Exit time */}
                    <td className="py-3 pr-3">
                      <input
                        type="time"
                        value={row.timeTo}
                        onChange={e => onGuardChange(row._key, "timeTo", e.target.value)}
                        className="border-0 bg-transparent focus:ring-0 p-0 text-sm text-slate-600 dark:text-slate-400"
                      />
                    </td>

                    {/* Guard type */}
                    <td className="py-3 pr-3">
                      <select
                        value={row.guardType}
                        onChange={e => onGuardChange(row._key, "guardType", e.target.value)}
                        className="text-xs bg-transparent border-0 focus:ring-0 p-0 text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        {Object.values(GuardType).map(gt => (
                          <option key={gt} value={gt}>{GuardTypeLabel[gt]}</option>
                        ))}
                      </select>
                    </td>

                    {/* Turn type */}
                    <td className="py-3 pr-3">
                      <select
                        value={row.turnType}
                        onChange={e => onGuardChange(row._key, "turnType", e.target.value)}
                        className="text-xs bg-transparent border-0 focus:ring-0 p-0 cursor-pointer"
                      >
                        {Object.values(TurnType).map(tt => (
                          <option key={tt} value={tt}>{TurnTypeLabel[tt]}</option>
                        ))}
                      </select>
                    </td>

                    {/* Remove */}
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onRemoveGuard(row._key)}
                        className="text-slate-400 hover:text-destructive transition-colors"
                      >
                        <span className="text-lg leading-none">&times;</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <button
            type="button"
            onClick={onAddGuard}
            className="flex items-center gap-2 text-primary text-sm font-bold hover:underline"
          >
            <Plus className="h-4 w-4" />
            Asignar otro guardia
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main Form Page ────────────────────────────────────────────────────────────

export const SpecialServiceScheduleFormPage = () => {
  const navigate = useNavigate()

  const { data: unitiesData } = useGetSpecialServiceUnitiesQuery({ page: 0, size: 200 })

  // ── Form state ────────────────────────────────────────────────────────────
  const [unityId, setUnityId] = useState<string>("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [days, setDays] = useState<DayEntry[]>([])
  const [manualDate, setManualDate] = useState("")
  const [showManualAdd, setShowManualAdd] = useState(false)
  const [formError, setFormError] = useState("")

  /** Which guard row is currently being edited via the picker */
  const [pickerTarget, setPickerTarget] = useState<{ dayIdx: number; rowKey: string } | null>(null)

  const [createSchedule, { isLoading: saving }] = useCreateSpecialServiceScheduleMutation()

  // ── Day management ────────────────────────────────────────────────────────

  const handleGenerateDays = () => {
    if (!dateFrom || !dateTo) {
      setFormError("Debes ingresar las fechas de inicio y fin.")
      return
    }
    setFormError("")
    const generated = generateDays(dateFrom, dateTo)
    if (generated.length === 0) {
      setFormError("La fecha de inicio debe ser anterior o igual a la fecha de fin.")
      return
    }
    setDays(generated)
  }

  const handleAddManualDay = () => {
    if (!manualDate) return
    if (days.some(d => d.date === manualDate)) {
      setManualDate("")
      setShowManualAdd(false)
      return
    }
    const newDay: DayEntry = { date: manualDate, expanded: true, guards: [] }
    setDays(prev =>
      [...prev, newDay].sort((a, b) => a.date.localeCompare(b.date)),
    )
    setManualDate("")
    setShowManualAdd(false)
  }

  const handleRemoveDay = (dayIdx: number) => {
    setDays(prev => prev.filter((_, i) => i !== dayIdx))
  }

  const handleToggleDay = (dayIdx: number) => {
    setDays(prev =>
      prev.map((d, i) => (i === dayIdx ? { ...d, expanded: !d.expanded } : d)),
    )
  }

  // ── Guard row management ──────────────────────────────────────────────────

  const handleAddGuard = (dayIdx: number) => {
    const row = newGuardRow()
    setDays(prev =>
      prev.map((d, i) =>
        i === dayIdx ? { ...d, expanded: true, guards: [...d.guards, row] } : d,
      ),
    )
    setPickerTarget({ dayIdx, rowKey: row._key })
  }

  const handlePickGuard = (dayIdx: number, rowKey: string) => {
    setPickerTarget({ dayIdx, rowKey })
  }

  const handleRemoveGuard = (dayIdx: number, key: string) => {
    setDays(prev =>
      prev.map((d, i) =>
        i === dayIdx ? { ...d, guards: d.guards.filter(g => g._key !== key) } : d,
      ),
    )
  }

  const handleGuardChange = (dayIdx: number, key: string, field: keyof GuardRow, value: string) => {
    setDays(prev =>
      prev.map((d, i) =>
        i === dayIdx
          ? {
              ...d,
              guards: d.guards.map(g => (g._key === key ? { ...g, [field]: value } : g)),
            }
          : d,
      ),
    )
  }

  const handleGuardSelected = async (selection: GuardSelection) => {
    if (!pickerTarget) return
    const { dayIdx, rowKey } = pickerTarget

    let encodedGuard: string
    let guardLabel: string
    let guardType: GuardType

    if (selection.kind === "GUARD") {
      const emp = selection.guard.employee
      encodedGuard = `G:${selection.guard.id}`
      guardLabel = [emp?.firstName, emp?.lastName].filter(Boolean).join(" ") || `Guardia #${selection.guard.id}`
      guardType = selection.guardType
    } else {
      encodedGuard = `E:${selection.externalGuard.id}`
      guardLabel = `${selection.externalGuard.firstName} ${selection.externalGuard.lastName}`.trim() || `Ext. #${selection.externalGuard.id}`
      guardType = selection.guardType
    }

    setDays(prev =>
      prev.map((d, i) =>
        i === dayIdx
          ? {
              ...d,
              guards: d.guards.map(g =>
                g._key === rowKey ? { ...g, encodedGuard, guardLabel, guardType } : g,
              ),
            }
          : d,
      ),
    )
    setPickerTarget(null)
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setFormError("")

    if (!unityId) {
      setFormError("Debes seleccionar una entidad o ubicación.")
      return
    }
    if (days.length === 0) {
      setFormError("Debes agregar al menos un día al servicio.")
      return
    }

    const assignments: CreateSpecialServiceAssignmentRequest[] = []
    for (const day of days) {
      for (const row of day.guards) {
        if (!row.encodedGuard) continue
        const [type, idStr] = row.encodedGuard.split(":")
        assignments.push({
          date: day.date,
          guardId: type === "G" ? Number(idStr) : null,
          externalGuardId: type === "E" ? Number(idStr) : null,
          guardType: row.guardType,
          timeFrom: row.timeFrom,
          timeTo: row.timeTo,
          turnType: row.turnType,
        })
      }
    }

    if (!dateFrom || !dateTo) {
      setFormError("Debes ingresar las fechas de inicio y fin.")
      return
    }

    try {
      const result = await createSchedule({
        specialServiceUnityId: Number(unityId),
        dateFrom,
        dateTo,
        assignments,
      }).unwrap()
      navigate(`/modules/special-services/schedules/${result.id}`)
    } catch (err) {
      console.error(err)
      setFormError("Error al guardar el servicio. Intenta nuevamente.")
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => navigate("/modules/special-services/schedules")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Configuración de Servicio Especial</h1>
          <p className="text-sm text-muted-foreground">
            Programe el personal de seguridad para eventos o ubicaciones temporales específicas.
          </p>
        </div>
      </div>

      {formError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {formError}
        </div>
      )}

      {/* Selection area */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Unity selector */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-semibold">Tercera Entidad / Ubicación</Label>
              <Select value={unityId} onValueChange={setUnityId}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Seleccione una entidad..." />
                </SelectTrigger>
                <SelectContent>
                  {(unitiesData?.content ?? []).map(u => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      {u.unityName}
                      {u.code ? ` (${u.code})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date range */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-semibold">Rango de Fechas</Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    className="pl-9 h-12"
                  />
                </div>
                <span className="text-muted-foreground text-sm">—</span>
                <div className="relative flex-1">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    className="pl-9 h-12"
                  />
                </div>
                <Button type="button" variant="secondary" onClick={handleGenerateDays}>
                  Generar Días
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Days list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Días Programados ({days.length} {days.length === 1 ? "día" : "días"})
          </h3>
          <button
            type="button"
            onClick={() => setShowManualAdd(v => !v)}
            className="text-primary hover:bg-primary/10 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors text-sm"
          >
            <Plus className="h-4 w-4" />
            Agregar Día Manualmente
          </button>
        </div>

        {/* Manual day add inline */}
        {showManualAdd && (
          <div className="flex items-center gap-3 rounded-lg border border-dashed border-primary/50 bg-primary/5 px-4 py-3">
            <CalendarDays className="h-4 w-4 text-primary" />
            <Input
              type="date"
              value={manualDate}
              onChange={e => setManualDate(e.target.value)}
              className="w-44 h-8"
            />
            <Button type="button" size="sm" onClick={handleAddManualDay} disabled={!manualDate}>
              Agregar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => { setShowManualAdd(false); setManualDate("") }}
            >
              Cancelar
            </Button>
          </div>
        )}

        {days.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
            <CalendarDays className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">
              Selecciona un rango de fechas y presiona <strong>Generar Días</strong>, o agrega días manualmente.
            </p>
          </div>
        )}

        {days.map((day, dayIdx) => (
          <DayCard
            key={day.date}
            day={day}
            dayIdx={dayIdx}
            onToggle={() => handleToggleDay(dayIdx)}
            onRemoveDay={() => handleRemoveDay(dayIdx)}
            onAddGuard={() => handleAddGuard(dayIdx)}
            onPickGuard={rowKey => handlePickGuard(dayIdx, rowKey)}
            onRemoveGuard={key => handleRemoveGuard(dayIdx, key)}
            onGuardChange={(key, field, value) => handleGuardChange(dayIdx, key, field, value)}
          />
        ))}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/modules/special-services/schedules")}
        >
          Cancelar
        </Button>
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Guardar Servicio Especial
        </Button>
      </div>

      {/* Guard picker — shared across all day rows */}
      <GuardPickerDialog
        open={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        title="Seleccionar Guardia"
        allowExternal
        onSelect={handleGuardSelected}
      />
    </div>
  )
}
