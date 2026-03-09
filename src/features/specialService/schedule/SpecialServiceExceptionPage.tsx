import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import {
  AlertTriangle,
  Loader2,
  Moon,
  Plus,
  Search,
  Sun,
  Trash2,
  UserRound,
  Users,
  ShieldAlert,
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { SpecialServiceScheduleSelector } from "@/components/select/SpecialServiceScheduleSelector"
import {
  useGetSpecialServiceScheduleByIdQuery,
  useCreateSpecialServiceExceptionMutation,
} from "./api/specialServiceScheduleApi"
import {
  useGetExceptionsByDateAssignmentQuery,
  useDeleteScheduleExceptionMutation,
} from "@/features/scheduling/api/scheduleExceptionApi"
import type { SpecialServiceDayAssignmentDto } from "./api/specialServiceScheduleModel"
import {
  ScheduleExceptionType,
  ScheduleExceptionTypeLabel,
} from "@/features/scheduling/api/scheduleExceptionModel"
import { GuardTypeLabel } from "@/features/guard/api/guardModel"
import {
  GuardPickerDialog,
  type GuardSelection,
} from "@/components/custom/GuardPickerDialog"

// ─── Turn tab ────────────────────────────────────────────────────────────────

type TurnTab = "ALL" | "DAY" | "NIGHT"

// ─── Guard name helpers ──────────────────────────────────────────────────────

function guardDisplayName(a: SpecialServiceDayAssignmentDto): string {
  const gusa = a.guardUnityScheduleAssignment
  if (!gusa) return "—"
  if (gusa.guardAssignment?.externalGuard) {
    const eg = gusa.guardAssignment.externalGuard
    return `${eg.firstName} ${eg.lastName}`.trim() || `Guardia Ext. #${eg.id}`
  }
  if (gusa.guardAssignment?.guard?.employee) {
    const emp = gusa.guardAssignment.guard.employee
    return `${emp.firstName} ${emp.lastName}`.trim()
  }
  return `Guardia #${gusa.id}`
}

function guardDoc(a: SpecialServiceDayAssignmentDto): string {
  const gusa = a.guardUnityScheduleAssignment
  if (!gusa) return ""
  if (gusa.guardAssignment?.externalGuard) return gusa.guardAssignment.externalGuard.documentNumber ?? ""
  return gusa.guardAssignment?.guard?.employee?.documentNumber ?? ""
}

function isExternal(a: SpecialServiceDayAssignmentDto): boolean {
  return !!a.guardUnityScheduleAssignment?.guardAssignment?.externalGuard
}

// ─── Sub-components ─────────────────────────────────────────────────────────

interface AssignmentCardProps {
  assignment: SpecialServiceDayAssignmentDto
  isSelected: boolean
  onSelect: () => void
}

function AssignmentCard({ assignment, isSelected, onSelect }: AssignmentCardProps) {
  const name = guardDisplayName(assignment)
  const doc = guardDoc(assignment)
  const external = isExternal(assignment)
  const guardType = assignment.guardUnityScheduleAssignment?.guardType
  const template = assignment.turnAndHour?.turnTemplate
  const turnType = template?.turnType
  const isDay = turnType === "DAY"

  return (
    <div
      className={cn(
        "bg-card rounded-xl p-4 shadow-sm border border-border border-l-4 transition-all border-l-primary",
        isSelected && "ring-2 ring-primary ring-offset-1",
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3 items-center">
          <div className="size-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <UserRound
              className={cn(
                "h-5 w-5",
                external ? "text-amber-500" : "text-muted-foreground",
              )}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="font-bold text-sm text-foreground">{name}</p>
              {external && (
                <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 shrink-0 text-amber-600 border-amber-300">
                  Ext
                </Badge>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              {guardType ? (GuardTypeLabel as any)[guardType] ?? guardType : "—"}
              {template ? ` • ${template.timeFrom ?? ""} - ${template.timeTo ?? ""}` : ""}
            </p>
            {doc && (
              <p className="text-[10px] text-muted-foreground mt-0.5">Doc: {doc}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
            Asignado
          </span>
          {turnType && (
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                isDay
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
              )}
            >
              {isDay ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
              {isDay ? "Día" : "Noche"}
            </span>
          )}
        </div>
      </div>

      <Button
        size="sm"
        variant={isSelected ? "default" : "outline"}
        className="w-full text-xs font-bold"
        onClick={onSelect}
      >
        <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
        {isSelected ? "Gestionar Excepción" : "Reportar Excepción"}
      </Button>
    </div>
  )
}

interface ExistingExceptionItemProps {
  exception: { id: number; scheduleExceptionType: ScheduleExceptionType; motive?: string; orderIndex?: number }
  onDelete: () => void
  isDeleting: boolean
}

function ExistingExceptionItem({ exception, onDelete, isDeleting }: ExistingExceptionItemProps) {
  return (
    <div className="flex items-start justify-between gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
            {ScheduleExceptionTypeLabel[exception.scheduleExceptionType]}
          </span>
          {exception.orderIndex != null && (
            <span className="text-[10px] text-muted-foreground">#{exception.orderIndex}</span>
          )}
        </div>
        {exception.motive && (
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{exception.motive}</p>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 h-7 w-7 text-destructive hover:bg-destructive/10"
        onClick={onDelete}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function SpecialServiceExceptionPage() {
  // ── Filter state ──────────────────────────────────────────────────────────
  const [scheduleId, setScheduleId] = useState<number | undefined>()
  const [selectedDate, setSelectedDate] = useState<string>("")

  // ── UI state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TurnTab>("ALL")
  const [selectedAssignment, setSelectedAssignment] = useState<SpecialServiceDayAssignmentDto | undefined>()

  // ── Exception form state ──────────────────────────────────────────────────
  const [exceptionType, setExceptionType] = useState<ScheduleExceptionType | "">("")
  const [motive, setMotive] = useState("")
  const [guardPickerOpen, setGuardPickerOpen] = useState(false)

  // ── API Queries ───────────────────────────────────────────────────────────
  const { data: schedule, isLoading: isLoadingSchedule } =
    useGetSpecialServiceScheduleByIdQuery(scheduleId ?? 0, { skip: !scheduleId })

  const { data: existingExceptions = [], isLoading: isLoadingExceptions } =
    useGetExceptionsByDateAssignmentQuery(selectedAssignment?.id ?? 0, {
      skip: !selectedAssignment,
    })

  // ── Mutations ─────────────────────────────────────────────────────────────
  const [createException] = useCreateSpecialServiceExceptionMutation()
  const [deleteException, { isLoading: isDeleting }] = useDeleteScheduleExceptionMutation()

  // ── Filter day assignments from the full schedule data ────────────────────
  const dayAssignments = useMemo(() => {
    if (!schedule || !selectedDate) return []
    return schedule.dayAssignments.filter(a => a.date === selectedDate)
  }, [schedule, selectedDate])

  // ── Filtered by turn tab ──────────────────────────────────────────────────
  const filteredAssignments = useMemo(() => {
    if (activeTab === "ALL") return dayAssignments
    return dayAssignments.filter(a => {
      const turnType = a.turnAndHour?.turnTemplate?.turnType
      if (!turnType) return false
      return activeTab === "DAY" ? turnType === "DAY" : turnType === "NIGHT"
    })
  }, [dayAssignments, activeTab])

  // ── IDs of internal guards already assigned for the selected day ──────────
  const alreadyInShiftGuardIds = useMemo(() => {
    return new Set(
      dayAssignments
        .map(a => a.guardUnityScheduleAssignment?.guardAssignment?.guard?.id)
        .filter((id): id is number => id != null),
    )
  }, [dayAssignments])

  // ── Date range constraints ────────────────────────────────────────────────
  const minDate = schedule?.dateFrom ?? ""
  const maxDate = schedule?.dateTo ?? ""

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleScheduleChange = (id: number | undefined) => {
    setScheduleId(id)
    setSelectedDate("")
    setSelectedAssignment(undefined)
  }

  const handleDateChange = (d: string) => {
    setSelectedDate(d)
    setSelectedAssignment(undefined)
  }

  const handleSelectAssignment = (a: SpecialServiceDayAssignmentDto) => {
    setSelectedAssignment(a)
    setExceptionType("")
    setMotive("")
  }

  const handleOpenGuardPicker = () => {
    if (!exceptionType) return
    setGuardPickerOpen(true)
  }

  const handleGuardSelected = async (selection: GuardSelection) => {
    if (!selectedAssignment || !exceptionType) return

    await createException({
      dateGuardUnityAssignmentId: selectedAssignment.id,
      guardId: selection.kind === "GUARD" ? selection.guard.id : null,
      externalGuardId: selection.kind === "EXTERNAL" ? selection.externalGuard.id : null,
      guardType: selection.guardType,
      scheduleExceptionType: exceptionType,
      scheduleId: scheduleId,
      motive: motive.trim() || undefined,
    }).unwrap()

    setGuardPickerOpen(false)
    setExceptionType("")
    setMotive("")
  }

  const handleDeleteException = async (id: number) => {
    await deleteException(id).unwrap()
  }

  // ── Readiness checks ──────────────────────────────────────────────────────
  const isReady = scheduleId != null && selectedDate !== "" && !isLoadingSchedule

  const absentGuardName = selectedAssignment ? guardDisplayName(selectedAssignment) : ""

  // ── Formatted date label ──────────────────────────────────────────────────
  const formattedDate = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Filter bar ────────────────────────────────────────────────────── */}
      <div className="shrink-0 p-4 bg-card border-b border-border shadow-sm z-10">
        <div className="mb-3">
          <h1 className="text-xl font-extrabold tracking-tight">Excepciones — Servicio Especial</h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            Seleccione un horario de servicio especial y una fecha para gestionar las excepciones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          {/* Schedule selector */}
          <div>
            <label className="block text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
              Horario de Servicio Especial
            </label>
            <SpecialServiceScheduleSelector
              value={scheduleId}
              onChange={handleScheduleChange}
              placeholder="Buscar servicio especial..."
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
              Fecha de Gestión
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={e => handleDateChange(e.target.value)}
              disabled={!scheduleId}
              min={minDate}
              max={maxDate}
              className="w-full"
            />
          </div>
        </div>

        {/* Schedule info */}
        {scheduleId && schedule && (
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-[10px]">
              <MapPin className="h-3 w-3 mr-1" />
              {schedule.specialServiceUnity?.unityName ?? `Servicio #${schedule.id}`}
            </Badge>
            {schedule.dateFrom && (
              <Badge variant="outline" className="text-[10px]">
                {schedule.dateFrom} → {schedule.dateTo ?? "?"}
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px]">
              {schedule.totalAssignments ?? schedule.dayAssignments.length} asignaciones totales
            </Badge>
          </div>
        )}
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      {isReady ? (
        <div className="flex-1 overflow-hidden flex gap-0">
          {/* Left column: guard list */}
          <div className="w-80 shrink-0 flex flex-col border-r border-border overflow-hidden">
            {/* Header */}
            <div className="shrink-0 px-4 pt-4 pb-2">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold">Personal Asignado</h2>
              </div>
              {formattedDate && (
                <span className="text-[10px] text-muted-foreground capitalize">
                  {formattedDate}
                </span>
              )}
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {filteredAssignments.length} asignaciones
              </p>
            </div>

            {/* Tabs */}
            <div className="shrink-0 flex border-b border-border px-4">
              {(["ALL", "DAY", "NIGHT"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex items-center gap-1 text-xs font-bold pb-2 px-2 border-b-2 transition-colors",
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab === "ALL" ? (
                    <Users className="h-3.5 w-3.5" />
                  ) : tab === "DAY" ? (
                    <Sun className="h-3.5 w-3.5" />
                  ) : (
                    <Moon className="h-3.5 w-3.5" />
                  )}
                  {tab === "ALL" ? "Todos" : tab === "DAY" ? "Día" : "Noche"}
                </button>
              ))}
            </div>

            {/* Guard cards */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {isLoadingSchedule ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : filteredAssignments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Users className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">Sin asignaciones para este día</p>
                </div>
              ) : (
                filteredAssignments.map(a => (
                  <AssignmentCard
                    key={a.id}
                    assignment={a}
                    isSelected={selectedAssignment?.id === a.id}
                    onSelect={() => handleSelectAssignment(a)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Right column: exception panel */}
          <div className="flex-1 flex flex-col overflow-hidden bg-muted/20">
            {!selectedAssignment ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <ShieldAlert className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <h3 className="text-base font-bold text-foreground mb-1">
                  Seleccione un guardia
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Haga clic en "Reportar Excepción" en una tarjeta de la izquierda para gestionar una ausencia.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden bg-card rounded-tl-xl border-t border-l border-border shadow-sm">
                {/* Panel header */}
                <div className="shrink-0 px-6 py-4 border-b border-border bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <h2 className="font-bold text-base">
                        Excepción: {absentGuardName}
                      </h2>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => setSelectedAssignment(undefined)}
                    >
                      Cerrar
                    </Button>
                  </div>
                  {/* Assignment info */}
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {selectedAssignment.turnAndHour?.turnTemplate && (
                      <Badge variant="outline" className="text-[10px]">
                        {selectedAssignment.turnAndHour.turnTemplate.timeFrom} - {selectedAssignment.turnAndHour.turnTemplate.timeTo}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px]">
                      {formattedDate}
                    </Badge>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {/* ── Existing exceptions ──────────────────────────────── */}
                  {isLoadingExceptions ? (
                    <div className="flex items-center gap-2 p-6 text-muted-foreground text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" /> Cargando excepciones...
                    </div>
                  ) : existingExceptions.length > 0 ? (
                    <div className="p-6 border-b border-border">
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                        Excepciones registradas ({existingExceptions.length})
                      </h3>
                      <div className="space-y-2">
                        {existingExceptions.map(ex => (
                          <ExistingExceptionItem
                            key={ex.id}
                            exception={ex}
                            onDelete={() => handleDeleteException(ex.id)}
                            isDeleting={isDeleting}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* ── New exception form ────────────────────────────────── */}
                  <div className="p-6 space-y-6">
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-bold">Nueva Excepción</h3>
                    </div>

                    {/* Exception type + motive */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Tipo de Excepción</Label>
                        <Select
                          value={exceptionType}
                          onValueChange={v => setExceptionType(v as ScheduleExceptionType)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(ScheduleExceptionType).map(t => (
                              <SelectItem key={t} value={t}>
                                {ScheduleExceptionTypeLabel[t]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Motivo / Descripción</Label>
                        <Textarea
                          rows={2}
                          placeholder="Detalles adicionales..."
                          value={motive}
                          onChange={e => setMotive(e.target.value)}
                          className="resize-none text-sm"
                        />
                      </div>
                    </div>

                    {/* Guard picker button */}
                    <div className="space-y-3 pt-4 border-t border-border">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Buscar Reemplazo
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Seleccione el tipo de excepción y luego busque un guardia de reemplazo.
                      </p>
                      <Button
                        variant="outline"
                        className="w-full"
                        disabled={!exceptionType}
                        onClick={handleOpenGuardPicker}
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Buscar Guardia de Reemplazo
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="shrink-0 px-6 py-4 bg-muted/30 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3">
                  <p className="text-xs text-muted-foreground italic">
                    {existingExceptions.length > 0
                      ? `${existingExceptions.length} excepción(es) registrada(s) para este guardia.`
                      : "Sin excepciones previas para este guardia en el día seleccionado."}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedAssignment(undefined)}
                  >
                    Cerrar Panel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── Empty / loading state ─────────────────────────────────────── */
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          {isLoadingSchedule ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Cargando datos...</p>
            </>
          ) : (
            <>
              <ShieldAlert className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <h3 className="text-base font-bold mb-1">Seleccione los filtros</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Elija un horario de servicio especial y una fecha para visualizar la dotación asignada del día.
              </p>
            </>
          )}
        </div>
      )}

      {/* ── Guard Picker Dialog ─────────────────────────────────────────── */}
      <GuardPickerDialog
        open={guardPickerOpen}
        onClose={() => setGuardPickerOpen(false)}
        title="Seleccionar Guardia de Reemplazo"
        description="Busca un guardia interno o externo para reemplazar al guardia ausente."
        allowExternal
        alreadyInShiftGuardIds={alreadyInShiftGuardIds}
        onSelect={handleGuardSelected}
      />
    </div>
  )
}
