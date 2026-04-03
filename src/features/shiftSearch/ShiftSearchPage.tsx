import { useState } from "react"
import { differenceInDays, format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Loader2,
  RotateCcw,
  Search,
  ShieldCheck,
} from "lucide-react"
import {
  ScheduleAssignmentType,
  ScheduleAssignmentTypeLabel,
} from "@/features/scheduling/api/monthlySchedulerModel"
import { ClientSelector } from "@/components/select/ClientSelector"
import { GuardSearchSelector } from "./components/GuardSearchSelector"
import { UnitySearchSelector } from "./components/UnitySearchSelector"
import { useSearchShiftsQuery } from "./api/shiftSearchApi"
import type { GuardLiteView, UnityLiteView, ShiftSearchResultDto } from "./api/shiftSearchModel"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

function fmt(t?: string) {
  return t ?? <span className="text-muted-foreground/40 text-xs">—</span>
}

function dateLabel(d: string) {
  try {
    return format(parseISO(d), "d MMM yyyy", { locale: es })
  } catch {
    return d
  }
}

function assignmentTypeBadge(type: ScheduleAssignmentType) {
  const map: Partial<Record<ScheduleAssignmentType, string>> = {
    [ScheduleAssignmentType.NORMAL]: "border-slate-400 text-slate-700",
    [ScheduleAssignmentType.EXCEPTIONAL]: "border-emerald-400 text-emerald-700",
    [ScheduleAssignmentType.ADITIONAL]: "border-purple-400 text-purple-700",
    [ScheduleAssignmentType.FREE_DAY]: "border-blue-400 text-blue-700",
    [ScheduleAssignmentType.VACATIONAL]: "border-cyan-400 text-cyan-700",
    [ScheduleAssignmentType.ABSENT]: "border-red-400 text-red-700",
  }
  return (
    <Badge variant="outline" className={`text-[10px] font-bold ${map[type] ?? ""}`}>
      {ScheduleAssignmentTypeLabel[type]}
    </Badge>
  )
}

// ─── Filter state type ────────────────────────────────────────────────────────

interface FilterState {
  dateFrom: string
  dateTo: string
  clientId?: number
  guard?: GuardLiteView | null
  unity?: UnityLiteView | null
  scheduleAssignmentType?: ScheduleAssignmentType
  hasExceptions: boolean
  hasExtraHours: boolean
  hasMarks: boolean
}

function emptyFilters(): FilterState {
  const today = format(new Date(), "yyyy-MM-dd")
  return {
    dateFrom: today,
    dateTo: today,
    clientId: undefined,
    guard: null,
    unity: null,
    scheduleAssignmentType: undefined,
    hasExceptions: false,
    hasExtraHours: false,
    hasMarks: false,
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ShiftSearchPage() {
  const [filters, setFilters] = useState<FilterState>(emptyFilters)
  const [submittedFilters, setSubmittedFilters] = useState<FilterState | null>(null)
  const [page, setPage] = useState(0)
  const [dateError, setDateError] = useState<string | null>(null)

  // Build query params from submitted filters
  const queryParams = submittedFilters
    ? {
        dateFrom: submittedFilters.dateFrom,
        dateTo: submittedFilters.dateTo,
        clientId: submittedFilters.clientId ?? undefined,
        guardId: submittedFilters.guard?.guardId ?? undefined,
        externalGuardId: submittedFilters.guard?.externalGuardId ?? undefined,
        unityId: submittedFilters.unity?.unityId ?? undefined,
        specialServiceUnityId: submittedFilters.unity?.specialServiceUnityId ?? undefined,
        scheduleAssignmentType: submittedFilters.scheduleAssignmentType ?? undefined,
        hasExceptions: submittedFilters.hasExceptions || undefined,
        hasExtraHours: submittedFilters.hasExtraHours || undefined,
        hasMarks: submittedFilters.hasMarks || undefined,
        page,
        size: PAGE_SIZE,
      }
    : null

  const { data, isLoading, isFetching } = useSearchShiftsQuery(queryParams!, {
    skip: queryParams === null,
  })

  const totalPages = data?.totalPages ?? 0
  const totalElements = data?.totalElements ?? 0

  // ── Handlers ────────────────────────────────────────────────────────────────

  const validateDates = (from: string, to: string): boolean => {
    if (!from || !to) {
      setDateError("Ingresa el rango de fechas")
      return false
    }
    if (from > to) {
      setDateError("La fecha de inicio no puede ser posterior a la de fin")
      return false
    }
    const diff = differenceInDays(parseISO(to), parseISO(from))
    if (diff > 6) {
      setDateError("El rango máximo es de 7 días")
      return false
    }
    setDateError(null)
    return true
  }

  const handleDateFromChange = (val: string) => {
    setFilters(f => ({ ...f, dateFrom: val }))
    if (val && filters.dateTo) validateDates(val, filters.dateTo)
  }

  const handleDateToChange = (val: string) => {
    setFilters(f => ({ ...f, dateTo: val }))
    if (filters.dateFrom && val) validateDates(filters.dateFrom, val)
  }

  const handleSearch = () => {
    if (!validateDates(filters.dateFrom, filters.dateTo)) return
    setSubmittedFilters({ ...filters })
    setPage(0)
  }

  const handleClear = () => {
    setFilters(emptyFilters())
    setSubmittedFilters(null)
    setDateError(null)
    setPage(0)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
          Operaciones · Registro de Asistencia
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight">Búsqueda General de Turnos</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Filtra y audita los turnos programados con sus marcaciones reales.
        </p>
      </div>

      {/* ── Filter panel ─────────────────────────────────────────────────── */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Filtros de Búsqueda
          </h2>
        </div>

        {/* Row 1: dates + client + guard + unity */}
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Date range */}
          <div className="space-y-1.5 lg:col-span-1 xl:col-span-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Fecha Desde
            </label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={e => handleDateFromChange(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Fecha Hasta
            </label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={e => handleDateToChange(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          {/* Client */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Cliente
            </label>
            <ClientSelector
              value={filters.clientId}
              onChange={v => setFilters(f => ({ ...f, clientId: v }))}
              placeholder="Buscar cliente..."
              className="h-9"
            />
          </div>

          {/* Guard */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Guardia / Externo
            </label>
            <GuardSearchSelector
              value={filters.guard}
              onChange={v => setFilters(f => ({ ...f, guard: v }))}
            />
          </div>

          {/* Unity */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Unidad
            </label>
            <UnitySearchSelector
              value={filters.unity}
              onChange={v => setFilters(f => ({ ...f, unity: v }))}
            />
          </div>
        </div>

        {/* Row 2: assignment type + checkboxes + buttons */}
        <div className="flex flex-wrap items-end gap-6">
          {/* Assignment type */}
          <div className="space-y-1.5 min-w-[200px]">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Tipo de Turno
            </label>
            <Select
              value={filters.scheduleAssignmentType ?? "__all__"}
              onValueChange={v =>
                setFilters(f => ({
                  ...f,
                  scheduleAssignmentType:
                    v === "__all__" ? undefined : (v as ScheduleAssignmentType),
                }))
              }
            >
              <SelectTrigger className="h-9 text-sm w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos los tipos</SelectItem>
                {Object.values(ScheduleAssignmentType).map(t => (
                  <SelectItem key={t} value={t}>
                    {ScheduleAssignmentTypeLabel[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap items-center gap-5 pb-0.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-full -mb-3">
              Estados
            </label>
            {(
              [
                { key: "hasExceptions", label: "Con excepciones" },
                { key: "hasExtraHours", label: "Con horas extra" },
                { key: "hasMarks", label: "Con marcaciones" },
              ] as const
            ).map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2">
                <Checkbox
                  id={key}
                  checked={filters[key]}
                  onCheckedChange={c =>
                    setFilters(f => ({ ...f, [key]: c === true }))
                  }
                />
                <Label htmlFor={key} className="text-sm font-medium cursor-pointer">
                  {label}
                </Label>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={handleClear} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" />
              Limpiar
            </Button>
            <Button size="sm" onClick={handleSearch} className="gap-1.5 px-5">
              <Search className="h-3.5 w-3.5" />
              Buscar
            </Button>
          </div>
        </div>

        {/* Date range error */}
        {dateError && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            {dateError}
          </div>
        )}
      </div>

      {/* ── Results table ─────────────────────────────────────────────────── */}
      {submittedFilters && (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isLoading || isFetching ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Buscando...
                </div>
              ) : (
                <Badge variant="secondary" className="font-bold">
                  {totalElements} resultado{totalElements !== 1 ? "s" : ""}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {submittedFilters.dateFrom === submittedFilters.dateTo
                  ? dateLabel(submittedFilters.dateFrom)
                  : `${dateLabel(submittedFilters.dateFrom)} → ${dateLabel(submittedFilters.dateTo)}`}
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1000px]">
              <thead className="bg-muted/40 border-b border-border">
                <tr>
                  {[
                    "Guardia",
                    "Unidad / Cliente",
                    "Fecha",
                    "Tipo",
                    "Entrada",
                    "Ini. Almuerzo",
                    "Fin Almuerzo",
                    "Salida",
                    "",
                  ].map(h => (
                    <th
                      key={h}
                      className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
                    </td>
                  </tr>
                ) : (data?.content ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <ShieldCheck className="h-8 w-8 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">
                          Sin resultados para los filtros seleccionados
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  (data?.content ?? []).map(row => (
                    <ShiftRow key={row.id} row={row} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-muted/20 border-t border-border flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Página {page + 1} de {totalPages} · {totalElements} turnos
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page === 0}
                  onClick={() => handlePageChange(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  // Show pages around current
                  let p = i
                  if (totalPages > 7) {
                    if (page < 4) p = i
                    else if (page > totalPages - 5) p = totalPages - 7 + i
                    else p = page - 3 + i
                  }
                  return (
                    <Button
                      key={p}
                      variant={p === page ? "default" : "ghost"}
                      size="icon"
                      className="h-8 w-8 text-xs font-bold"
                      onClick={() => handlePageChange(p)}
                    >
                      {p + 1}
                    </Button>
                  )
                })}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page >= totalPages - 1}
                  onClick={() => handlePageChange(page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state before first search */}
      {!submittedFilters && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="h-12 w-12 text-muted-foreground/20 mb-4" />
          <p className="text-sm font-medium text-muted-foreground">
            Configura los filtros y presiona <strong>Buscar</strong>
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Rango máximo de búsqueda: 7 días
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Table row ────────────────────────────────────────────────────────────────

function ShiftRow({ row }: { row: ShiftSearchResultDto }) {
  const unityName = row.contractUnityName ?? row.specialServiceUnityName

  return (
    <tr className="hover:bg-muted/30 transition-colors group">
      {/* Guardia */}
      <td className="px-5 py-3.5">
        <p className="text-sm font-semibold">{row.guardName}</p>
        <p className="text-[10px] text-muted-foreground">
          {row.isExternalGuard && (
            <span className="text-amber-600 font-medium mr-1">Externo ·</span>
          )}
          {row.guardCode && <span>{row.guardCode} · </span>}
          {row.documentNumber}
        </p>
      </td>

      {/* Unidad */}
      <td className="px-5 py-3.5">
        <p className="text-sm font-medium">{unityName ?? "—"}</p>
        <p className="text-[10px] text-muted-foreground">{row.clientName ?? ""}</p>
      </td>

      {/* Fecha */}
      <td className="px-5 py-3.5 text-sm font-medium whitespace-nowrap">
        {dateLabel(row.date)}
      </td>

      {/* Tipo */}
      <td className="px-5 py-3.5">
        <div className="flex flex-col gap-1">
          {assignmentTypeBadge(row.scheduleAssignmentType)}
          <div className="flex flex-wrap gap-1">
            {row.hasExceptions && (
              <Badge variant="outline" className="text-[8px] border-blue-300 text-blue-600">
                Excepción
              </Badge>
            )}
            {row.hasExtraHours && (
              <Badge variant="outline" className="text-[8px] border-amber-300 text-amber-600">
                H. Extra
              </Badge>
            )}
          </div>
        </div>
      </td>

      {/* Hora entrada */}
      <td className="px-5 py-3.5 text-center bg-muted/20">
        <TimeCell scheduled={row.scheduledEntry} actual={row.markEntry} />
      </td>

      {/* Inicio almuerzo */}
      <td className="px-5 py-3.5 text-center bg-muted/20">
        <span className="text-sm font-mono">{row.markBreakStart ?? "—"}</span>
      </td>

      {/* Fin almuerzo */}
      <td className="px-5 py-3.5 text-center bg-muted/20">
        <span className="text-sm font-mono">{row.markBreakEnd ?? "—"}</span>
      </td>

      {/* Salida */}
      <td className="px-5 py-3.5 text-center bg-muted/20">
        <TimeCell scheduled={row.scheduledExit} actual={row.markExit} />
      </td>

      {/* Acciones */}
      <td className="px-5 py-3.5 text-right">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
          disabled
          title="Vista de detalle de turno — próximamente"
        >
          Ver Detalle
        </Button>
      </td>
    </tr>
  )
}

// ─── Time cell (scheduled vs actual) ─────────────────────────────────────────

function TimeCell({ scheduled, actual }: { scheduled?: string; actual?: string }) {
  if (!actual && !scheduled) {
    return <span className="text-muted-foreground/40 text-xs">—</span>
  }
  return (
    <div className="flex flex-col items-center gap-0.5">
      {actual ? (
        <span className="text-sm font-mono font-semibold">{actual}</span>
      ) : (
        <span className="text-muted-foreground/40 text-xs">—</span>
      )}
      {scheduled && (
        <div className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
          <Clock className="h-2.5 w-2.5" />
          {scheduled}
        </div>
      )}
    </div>
  )
}
