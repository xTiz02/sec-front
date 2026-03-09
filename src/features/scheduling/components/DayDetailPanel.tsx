import { useCallback, useEffect, useMemo, useState } from "react"
import { X, CalendarDays, AlertTriangle, Loader2, Trash2, Bed, Umbrella, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { TurnType, DayOfWeek, DayOfWeekLabel } from "@/features/contractSchedule/api/contractScheduleModel"
import { GuardType, GuardTypeLabel } from "@/features/guard/api/guardModel"
import type { GuardDto } from "@/features/guard/api/guardModel"
import type { GuardSelection } from "@/components/custom/GuardPickerDialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type {
  DateGuardUnityAssignmentDto,
  GuardUnityScheduleAssignmentDto,
  ContractScheduleUnitTemplateDto,
} from "../api/monthlySchedulerModel"
import { ScheduleAssignmentType } from "../api/monthlySchedulerModel"
import { ShiftSection } from "./ShiftSection"

// ─── JS day → DayOfWeek ───────────────────────────────────────────────────────

const JS_TO_DOW: Record<number, DayOfWeek> = {
  0: DayOfWeek.SUNDAY, 1: DayOfWeek.MONDAY, 2: DayOfWeek.TUESDAY,
  3: DayOfWeek.WEDNESDAY, 4: DayOfWeek.THURSDAY, 5: DayOfWeek.FRIDAY,
  6: DayOfWeek.SATURDAY,
}

function jsDay(dateStr: string) {
  return JS_TO_DOW[new Date(dateStr + "T00:00:00").getDay()]
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })
}

function initials(first?: string, last?: string) {
  return `${(first?.[0] ?? "?").toUpperCase()}${(last?.[0] ?? "").toUpperCase()}`
}

// ─── Assign Free Day Dialog ───────────────────────────────────────────────────

interface AssignFreeDayDialogProps {
  open: boolean
  onClose: () => void
  date: string
  dow: DayOfWeek
  guardSchedules: GuardUnityScheduleAssignmentDto[]
  alreadyFreeTodayGuardIds: Set<number>
  onAssign: (guard: GuardDto, guardType: GuardType, allWeekday: boolean) => Promise<void>
}

function AssignFreeDayDialog({
  open,
  onClose,
  date,
  dow,
  guardSchedules,
  alreadyFreeTodayGuardIds,
  onAssign,
}: AssignFreeDayDialogProps) {
  const [allWeekday, setAllWeekday] = useState(false)
  const [assigning, setAssigning] = useState<number | null>(null)

  const handleAssign = async (gs: GuardUnityScheduleAssignmentDto) => {
    const guard = gs.guardAssignment?.guard
    if (!guard) return
    setAssigning(gs.id)
    try {
      await onAssign(guard, gs.guardType, allWeekday)
    } finally {
      setAssigning(null)
    }
  }

  const handleClose = () => {
    setAllWeekday(false)
    onClose()
  }

  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString("es-PE", {
    weekday: "long", day: "numeric", month: "long",
  })

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bed className="h-4 w-4 text-orange-500" />
            Asignar Día Libre
          </DialogTitle>
          <DialogDescription>
            Selecciona un guardia del mes y el alcance del día libre.
          </DialogDescription>
        </DialogHeader>

        {/* Scope toggle */}
        <div className="flex gap-2">
          <Button
            variant={!allWeekday ? "default" : "outline"}
            size="sm"
            className="flex-1 text-xs"
            onClick={() => setAllWeekday(false)}
          >
            Solo {formattedDate}
          </Button>
          <Button
            variant={allWeekday ? "default" : "outline"}
            size="sm"
            className="flex-1 text-xs"
            onClick={() => setAllWeekday(true)}
          >
            Todos los {DayOfWeekLabel[dow]} del mes
          </Button>
        </div>

        {allWeekday && (
          <p className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded">
            Se creará un día libre para cada {DayOfWeekLabel[dow]} del mes actual.
          </p>
        )}

        {/* Guard list from monthly pool */}
        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
          {guardSchedules.map(gs => {
            const emp = gs.guardAssignment?.guard?.employee
            const extGuard = gs.guardAssignment?.externalGuard
            const displayFirst = emp?.firstName ?? extGuard?.firstName ?? "Guardia"
            const displayLast = emp?.lastName ?? extGuard?.lastName ?? ""
            const guardId = gs.guardAssignment?.guardId ?? -1
            const isAlreadyFree = alreadyFreeTodayGuardIds.has(guardId)
            const isAssigning = assigning === gs.id

            return (
              <div
                key={gs.id}
                className={cn(
                  "flex items-center justify-between p-3 border border-border rounded-lg bg-card",
                  isAlreadyFree && "opacity-50",
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="size-8 shrink-0">
                    <AvatarImage src={gs.guardAssignment?.guard?.photoUrl} />
                    <AvatarFallback className="text-xs font-bold">
                      {initials(displayFirst, displayLast)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      {displayFirst} {displayLast}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {GuardTypeLabel[gs.guardType]}
                      {isAlreadyFree && " · Ya tiene día libre hoy"}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  disabled={isAlreadyFree || isAssigning || assigning !== null}
                  onClick={() => handleAssign(gs)}
                  className="shrink-0 ml-3"
                >
                  {isAssigning ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                  {isAlreadyFree ? "Asignado" : isAssigning ? "Asignando..." : "Asignar"}
                </Button>
              </div>
            )
          })}
          {guardSchedules.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Sin guardias asignados este mes
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Assign Vacation Dialog ───────────────────────────────────────────────────

interface AssignVacationDialogProps {
  open: boolean
  onClose: () => void
  date: string
  guardSchedules: GuardUnityScheduleAssignmentDto[]
  allCalendarAssignments: DateGuardUnityAssignmentDto[]
  onAssign: (guard: GuardDto, guardType: GuardType, dateFrom: string, dateTo: string) => Promise<void>
}

function formatShortDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
  })
}

function AssignVacationDialog({
  open,
  onClose,
  date,
  guardSchedules,
  allCalendarAssignments,
  onAssign,
}: AssignVacationDialogProps) {
  const [dateFrom, setDateFrom] = useState(date)
  const [dateTo, setDateTo] = useState(date)
  const [assigning, setAssigning] = useState<number | null>(null)

  useEffect(() => {
    if (open) {
      setDateFrom(date)
      setDateTo(date)
    }
  }, [open, date])

  const isRangeValid = !!dateFrom && !!dateTo && dateTo >= dateFrom

  /** For each gsId, find any existing assignment that overlaps [dateFrom, dateTo] */
  const conflictMap = useMemo(() => {
    const map = new Map<number, string>()
    if (!isRangeValid) return map
    for (const gs of guardSchedules) {
      const conflict = allCalendarAssignments.find(a => {
        if (a.guardUnityScheduleAssignmentId !== gs.id) return false
        const aStart = a.date ?? ""
        const aEnd = a.toDate ?? a.date ?? ""
        return aStart <= dateTo && aEnd >= dateFrom
      })
      if (conflict) {
        const cStart = conflict.date ?? ""
        const cEnd = conflict.toDate ?? conflict.date ?? ""
        map.set(
          gs.id,
          cStart === cEnd
            ? `Ocupado el ${formatShortDate(cStart)}`
            : `Ocupado ${formatShortDate(cStart)} – ${formatShortDate(cEnd)}`,
        )
      }
    }
    return map
  }, [guardSchedules, allCalendarAssignments, dateFrom, dateTo, isRangeValid])

  const handleAssign = async (gs: GuardUnityScheduleAssignmentDto) => {
    const guard = gs.guardAssignment?.guard
    if (!guard || conflictMap.has(gs.id)) return
    setAssigning(gs.id)
    try {
      await onAssign(guard, gs.guardType, dateFrom, dateTo)
    } finally {
      setAssigning(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Umbrella className="h-4 w-4 text-purple-500" />
            Asignar Vacaciones
          </DialogTitle>
          <DialogDescription>
            Selecciona el rango de fechas. El rango debe estar libre para cada guardia.
          </DialogDescription>
        </DialogHeader>

        {/* Date range */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Desde</p>
            <Input
              type="date"
              value={dateFrom}
              onChange={e => {
                setDateFrom(e.target.value)
                if (dateTo < e.target.value) setDateTo(e.target.value)
              }}
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Hasta</p>
            <Input
              type="date"
              value={dateTo}
              min={dateFrom}
              onChange={e => setDateTo(e.target.value)}
            />
          </div>
        </div>

        {dateFrom && dateTo && dateFrom === dateTo && (
          <p className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded">
            Día único: {formatShortDate(dateFrom)}
          </p>
        )}
        {isRangeValid && dateFrom !== dateTo && (
          <p className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded">
            Rango: {formatShortDate(dateFrom)} – {formatShortDate(dateTo)}
          </p>
        )}

        {/* Guard list */}
        <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
          {guardSchedules.map(gs => {
            const emp = gs.guardAssignment?.guard?.employee
            const extGuard = gs.guardAssignment?.externalGuard
            const displayFirst = emp?.firstName ?? extGuard?.firstName ?? "Guardia"
            const displayLast = emp?.lastName ?? extGuard?.lastName ?? ""
            const conflict = conflictMap.get(gs.id)
            const isAssigning = assigning === gs.id
            const blocked = !!conflict

            return (
              <div
                key={gs.id}
                className={cn(
                  "flex items-center justify-between p-3 border border-border rounded-lg bg-card",
                  blocked && "opacity-60",
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="size-8 shrink-0">
                    <AvatarImage src={gs.guardAssignment?.guard?.photoUrl} />
                    <AvatarFallback className="text-xs font-bold">
                      {initials(displayFirst, displayLast)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      {displayFirst} {displayLast}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {conflict ?? GuardTypeLabel[gs.guardType]}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={blocked ? "outline" : "default"}
                  disabled={!isRangeValid || blocked || isAssigning || assigning !== null}
                  onClick={() => handleAssign(gs)}
                  className="shrink-0 ml-3"
                >
                  {isAssigning ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                  {blocked ? "Ocupado" : isAssigning ? "Asignando..." : "Asignar"}
                </Button>
              </div>
            )
          })}
          {guardSchedules.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Sin guardias asignados este mes
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface DayDetailPanelProps {
  date: string
  assignments: DateGuardUnityAssignmentDto[]
  guardSchedules: GuardUnityScheduleAssignmentDto[]
  contractSchedules: ContractScheduleUnitTemplateDto[]
  onClose: () => void
  onUpdateGuardType: (scheduleAssignmentId: number, guardType: GuardType) => Promise<void>
  onAddAssignment: (selection: GuardSelection, turnType: TurnType) => Promise<void>
  onRemoveAssignment: (assignmentId: number) => Promise<void>
  /** Remove guard from monthly pool entirely (cascades daily assignments) */
  onRemoveFromMonthlyPool: (gsId: number) => Promise<void>
  /** Assign FREE_DAY; allWeekday=true → create for every occurrence of this weekday in the month */
  onAddFreeDay: (guard: GuardDto, guardType: GuardType, allWeekday: boolean) => Promise<void>
  /** All calendar assignments for the month — used for vacation conflict detection */
  allCalendarAssignments?: DateGuardUnityAssignmentDto[]
  /** Assign VACATIONAL — single day (dateFrom===dateTo) or date range */
  onAddVacation: (guard: GuardDto, guardType: GuardType, dateFrom: string, dateTo: string) => Promise<void>
  /** Remove a vacation (VACATIONAL) daily assignment */
  onRemoveVacation: (assignmentId: number) => Promise<void>
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DayDetailPanel({
  date,
  assignments,
  guardSchedules,
  contractSchedules,
  onClose,
  onUpdateGuardType,
  onAddAssignment,
  onRemoveAssignment,
  onRemoveFromMonthlyPool,
  onAddFreeDay,
  allCalendarAssignments,
  onAddVacation,
  onRemoveVacation,
}: DayDetailPanelProps) {
  const dow = jsDay(date)

  // Confirm dialog for removing a guard from the monthly pool
  const [confirmRemoveGs, setConfirmRemoveGs] = useState<GuardUnityScheduleAssignmentDto | null>(null)
  const [removingGsId, setRemovingGsId] = useState<number | null>(null)
  const [freeDayDialogOpen, setFreeDayDialogOpen] = useState(false)
  const [vacationDialogOpen, setVacationDialogOpen] = useState(false)

  // ── Shift wrappers ────────────────────────────────────────────────────────
  const handleAddDay = useCallback(
    (selection: GuardSelection) => onAddAssignment(selection, TurnType.DAY),
    [onAddAssignment],
  )
  const handleAddNight = useCallback(
    (selection: GuardSelection) => onAddAssignment(selection, TurnType.NIGHT),
    [onAddAssignment],
  )

  // ── Monthly pool removal ───────────────────────────────────────────────────
  const handleConfirmRemoveFromPool = async () => {
    if (!confirmRemoveGs) return
    setRemovingGsId(confirmRemoveGs.id)
    try {
      await onRemoveFromMonthlyPool(confirmRemoveGs.id)
    } finally {
      setRemovingGsId(null)
      setConfirmRemoveGs(null)
    }
  }

  // ── Partition assignments ─────────────────────────────────────────────────
  const template = contractSchedules.find(t => t.dayOfWeek === dow)
  const hasTurnAndHours = (template?.turnAndHours?.length ?? 0) > 0
  const dayTurnAndHours = template?.turnAndHours?.filter(t => t.turnTemplate?.turnType === TurnType.DAY)
  const nightTurnAndHours = template?.turnAndHours?.filter(t => t.turnTemplate?.turnType === TurnType.NIGHT)
  const required = hasTurnAndHours
    ? template!.turnAndHours!.reduce((sum, t) => sum + (t.turnTemplate?.numGuards ?? 0), 0)
    : (template?.numOfGuards ?? 0)
  const requiredDay = hasTurnAndHours
    ? (dayTurnAndHours ?? []).reduce((sum, t) => sum + (t.turnTemplate?.numGuards ?? 0), 0)
    : (template?.numTurnDay ?? 0)
  const requiredNight = hasTurnAndHours
    ? (nightTurnAndHours ?? []).reduce((sum, t) => sum + (t.turnTemplate?.numGuards ?? 0), 0)
    : (template?.numTurnNight ?? 0)

  const { dayAssignments, nightAssignments, restAssignments, vacationAssignments } =
    useMemo(() => {
      const day: DateGuardUnityAssignmentDto[] = []
      const night: DateGuardUnityAssignmentDto[] = []
      const rest: DateGuardUnityAssignmentDto[] = []
      const vacation: DateGuardUnityAssignmentDto[] = []

      for (const a of assignments) {
        if (a.scheduleAssignmentType === ScheduleAssignmentType.FREE_DAY) {
          rest.push(a)
        } else if (
          a.scheduleAssignmentType === ScheduleAssignmentType.VACATIONAL ||
          a.hasVacation
        ) {
          vacation.push(a)
        } else if (a.turnAndHour?.turnTemplate?.turnType === TurnType.DAY) {
          day.push(a)
        } else if (a.turnAndHour?.turnTemplate?.turnType === TurnType.NIGHT) {
          night.push(a)
        } else {
          day.push(a)
        }
      }
      return { dayAssignments: day, nightAssignments: night, restAssignments: rest, vacationAssignments: vacation }
    }, [assignments])

  const totalAssigned = dayAssignments.length + nightAssignments.length
  const missing = Math.max(0, required - totalAssigned)

  /** Guard IDs that already have a FREE_DAY assignment today */
  const alreadyFreeTodayGuardIds = useMemo(() => {
    const ids = new Set<number>()
    for (const a of restAssignments) {
      const gs = guardSchedules.find(g => g.id === a.guardUnityScheduleAssignmentId)
      const gid = gs?.guardAssignment?.guardId
      if (gid != null) ids.add(gid)
    }
    return ids
  }, [restAssignments, guardSchedules])

  return (
    <div className="flex-1 flex flex-col bg-card shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.08)] z-20">
      {/* Panel header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-muted/30 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
              <span className="text-xl font-extrabold">
                {new Date(date + "T00:00:00").getDate()}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold capitalize">{formatDate(date)}</h2>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Centro de Control de Asignaciones
              </p>
            </div>
          </div>
          <Separator orientation="vertical" className="h-8 mx-2" />
          <div className="flex gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                Estado Global
              </span>
              <span
                className={
                  totalAssigned >= required
                    ? "text-sm font-bold text-green-600"
                    : "text-sm font-bold text-destructive"
                }
              >
                {totalAssigned >= required
                  ? `Completo (${totalAssigned}/${required})`
                  : `Incompleto (${totalAssigned}/${required})`}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                Día
              </span>
              <span className="text-sm capitalize text-foreground">
                {DayOfWeekLabel[dow]}
              </span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* 3-column body */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left: Summary & Vacations ────────────────────────────────────── */}
        <div className="w-1/4 min-w-[260px] border-r border-border p-5 overflow-y-auto bg-muted/20">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Resumen
          </h3>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-card p-3 rounded-lg border border-border shadow-sm">
              <span className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                Requeridos
              </span>
              <span className="text-lg font-extrabold text-primary">{required}</span>
              <span className="text-[10px] text-muted-foreground ml-1">Guardias</span>
            </div>
            <div
              className={
                missing > 0
                  ? "bg-destructive/5 p-3 rounded-lg border border-destructive/20 shadow-sm"
                  : "bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-200 dark:border-green-900/30 shadow-sm"
              }
            >
              <span
                className={
                  missing > 0
                    ? "block text-[10px] font-bold text-destructive uppercase mb-1"
                    : "block text-[10px] font-bold text-green-700 dark:text-green-400 uppercase mb-1"
                }
              >
                {missing > 0 ? "Faltantes" : "Cubiertos"}
              </span>
              <span
                className={
                  missing > 0
                    ? "text-lg font-extrabold text-destructive"
                    : "text-lg font-extrabold text-green-600"
                }
              >
                {missing > 0 ? missing : totalAssigned}
              </span>
              <span className="text-[10px] text-muted-foreground ml-1">
                {missing > 0 ? "Guardia" : "OK"}
              </span>
            </div>
          </div>

          {/* Vacations */}
          <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-purple-50/50 dark:bg-purple-900/10 flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                  Ausencias
                </h4>
                <p className="text-[10px] text-purple-700/70 dark:text-purple-300/60 mt-0.5">
                  Vacaciones activas
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 gap-1 text-xs border-purple-300 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                  onClick={() => setVacationDialogOpen(true)}
                >
                  <Plus className="h-3 w-3" />
                  Asignar
                </Button>
                <Badge variant="outline" className="text-[10px]">
                  {vacationAssignments.length}
                </Badge>
              </div>
            </div>
            <div className="p-2 space-y-2 max-h-48 overflow-y-auto">
              {vacationAssignments.length === 0 ? (
                <p className="text-xs text-muted-foreground px-2 py-3 text-center">
                  Sin ausencias
                </p>
              ) : (
                vacationAssignments.map(a => {
                  const gs = guardSchedules.find(g => g.id === a.guardUnityScheduleAssignmentId)
                  const emp = gs?.guardAssignment?.guard?.employee
                  const extGuard = gs?.guardAssignment?.externalGuard
                  const displayFirst = emp?.firstName ?? extGuard?.firstName ?? "?"
                  const displayLast = emp?.lastName ?? extGuard?.lastName ?? ""
                  return (
                    <div
                      key={a.id}
                      className="group flex items-center gap-3 p-2 bg-muted/40 rounded border border-border"
                    >
                      <Avatar className="size-8 shrink-0">
                        <AvatarImage src={gs?.guardAssignment?.guard?.photoUrl} />
                        <AvatarFallback className="text-xs font-bold">
                          {initials(displayFirst, displayLast)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">
                          {displayFirst} {displayLast}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {a.toDate && a.toDate !== a.date
                            ? `${formatShortDate(a.date!)} – ${formatShortDate(a.toDate)}`
                            : "Vacaciones"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        onClick={() => onRemoveVacation(a.id)}
                        title="Quitar vacaciones"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {missing > 0 && (
            <div className="mt-4 p-3 rounded-lg border border-destructive/30 bg-destructive/5 flex gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">
                Faltan <strong>{missing}</strong> guardia{missing > 1 ? "s" : ""} por asignar.
              </p>
            </div>
          )}
        </div>

        {/* ── Center: Shift Assignments ─────────────────────────────────────── */}
        <div className="w-2/4 min-w-[400px] border-r border-border flex flex-col bg-card">
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20 shrink-0">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Turnos y Asignaciones
            </h3>
            <div className="flex gap-2">
              <span
                className={
                  dayAssignments.length >= requiredDay
                    ? "text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-bold border border-green-200 dark:border-green-800"
                    : "text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-bold border border-destructive/20"
                }
              >
                Día: {dayAssignments.length}/{requiredDay}
              </span>
              <span
                className={
                  nightAssignments.length >= requiredNight
                    ? "text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-bold border border-green-200 dark:border-green-800"
                    : "text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-bold border border-destructive/20"
                }
              >
                Noche: {nightAssignments.length}/{requiredNight}
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <ShiftSection
              turnType={TurnType.DAY}
              assignments={dayAssignments}
              guardSchedules={guardSchedules}
              required={requiredDay}
              turnAndHours={dayTurnAndHours}
              onUpdateGuardType={onUpdateGuardType}
              onAddAssignment={dayTurnAndHours?.length ? handleAddDay : undefined}
              onRemoveAssignment={onRemoveAssignment}
            />
            <ShiftSection
              turnType={TurnType.NIGHT}
              assignments={nightAssignments}
              guardSchedules={guardSchedules}
              required={requiredNight}
              turnAndHours={nightTurnAndHours}
              onUpdateGuardType={onUpdateGuardType}
              onAddAssignment={nightTurnAndHours?.length ? handleAddNight : undefined}
              onRemoveAssignment={onRemoveAssignment}
            />
            <ShiftSection
              turnType={"REST"}
              assignments={restAssignments}
              guardSchedules={guardSchedules}
              required={0}
              onUpdateGuardType={onUpdateGuardType}
              onRemoveAssignment={onRemoveAssignment}
              onAddFreeDayClick={() => setFreeDayDialogOpen(true)}
            />
          </div>
        </div>

        {/* ── Right: Monthly Guard Pool ──────────────────────────────────────── */}
        <div className="w-1/4 min-w-[260px] flex flex-col bg-muted/10">
          <div className="p-4 border-b border-border bg-card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Guardias del Mes
              </h3>
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {guardSchedules.length} Total
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Cambia el tipo o quita guardias del mes
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {guardSchedules.map(gs => {
              const emp = gs.guardAssignment?.guard?.employee
              const guard = gs.guardAssignment?.guard
              const extGuard = gs.guardAssignment?.externalGuard
              const displayFirst = emp?.firstName ?? extGuard?.firstName ?? "Guardia"
              const displayLast = emp?.lastName ?? extGuard?.lastName ?? ""
              const dayAssign = assignments.find(
                a => a.guardUnityScheduleAssignmentId === gs.id &&
                     a.scheduleAssignmentType !== ScheduleAssignmentType.FREE_DAY &&
                     !a.hasVacation,
              )
              const isOnVacation = assignments.some(
                a => a.guardUnityScheduleAssignmentId === gs.id &&
                     (a.hasVacation || a.scheduleAssignmentType === ScheduleAssignmentType.VACATIONAL),
              )
              const isOnRest = assignments.some(
                a => a.guardUnityScheduleAssignmentId === gs.id &&
                     a.scheduleAssignmentType === ScheduleAssignmentType.FREE_DAY,
              )
              const isRemoving = removingGsId === gs.id

              return (
                <div
                  key={gs.id}
                  className="relative flex items-center justify-between p-2.5 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors group"
                >
                  {isOnVacation && (
                    <div className="absolute -right-2 -top-2 z-20">
                      <span className="text-[9px] font-bold bg-purple-500 text-white px-1.5 py-0.5 rounded shadow-sm">
                        VACACIONES
                      </span>
                    </div>
                  )}
                  <div className={`flex items-center gap-2 min-w-0 ${isOnVacation || isOnRest ? "opacity-50 grayscale" : ""}`}>
                    <Avatar className="size-8 shrink-0">
                      <AvatarImage src={guard?.photoUrl} />
                      <AvatarFallback className="text-xs font-bold">
                        {initials(displayFirst, displayLast)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">
                        {displayFirst} {displayLast}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {isOnVacation
                          ? "Vacaciones"
                          : isOnRest
                            ? "Descanso"
                            : dayAssign
                              ? "Asignado"
                              : "Sin asignar"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-1">
                    {/* Type selector */}
                    {!isOnVacation && (
                      <Select
                        value={gs.guardType}
                        onValueChange={val => onUpdateGuardType(gs.id, val as GuardType)}
                      >
                        <SelectTrigger className="h-6 w-24 text-[10px]">
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
                    )}

                    {/* Remove from monthly pool */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      disabled={isRemoving}
                      onClick={() => setConfirmRemoveGs(gs)}
                      title="Quitar del mes"
                    >
                      {isRemoving
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : <Trash2 className="h-3 w-3" />
                      }
                    </Button>
                  </div>
                </div>
              )
            })}
            {guardSchedules.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Sin guardias asignados este mes
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Vacation assignment dialog */}
      <AssignVacationDialog
        open={vacationDialogOpen}
        onClose={() => setVacationDialogOpen(false)}
        date={date}
        guardSchedules={guardSchedules}
        allCalendarAssignments={allCalendarAssignments ?? assignments}
        onAssign={onAddVacation}
      />

      {/* Free day assignment dialog */}
      <AssignFreeDayDialog
        open={freeDayDialogOpen}
        onClose={() => setFreeDayDialogOpen(false)}
        date={date}
        dow={dow}
        guardSchedules={guardSchedules}
        alreadyFreeTodayGuardIds={alreadyFreeTodayGuardIds}
        onAssign={onAddFreeDay}
      />

      {/* Confirm remove from monthly pool */}
      <AlertDialog
        open={confirmRemoveGs !== null}
        onOpenChange={open => { if (!open) setConfirmRemoveGs(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Quitar guardia del mes?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará a{" "}
              <strong>
                {confirmRemoveGs?.guardAssignment?.guard?.employee?.firstName
                  ?? confirmRemoveGs?.guardAssignment?.externalGuard?.firstName}{" "}
                {confirmRemoveGs?.guardAssignment?.guard?.employee?.lastName
                  ?? confirmRemoveGs?.guardAssignment?.externalGuard?.lastName}
              </strong>{" "}
              del horario de este mes y todas sus asignaciones diarias serán eliminadas.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmRemoveFromPool}
            >
              Quitar del mes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
