import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import {
  AlertTriangle,
  CheckCircle,
  Loader2,
  Moon,
  Plus,
  Search,
  Sun,
  Trash2,
  UserRound,
  Users,
  ShieldAlert,
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
import { ClientContractSelector } from "@/components/select/ClientContractSelector"
import { ContractUnitySelector } from "@/components/select/ContractUnitySelector"
import {
  useGetScheduleMonthlyByPeriodQuery,
  useGetCalendarAssignmentsQuery,
  useGetGuardUnityScheduleAssignmentsQuery,
} from "./api/monthlySchedulerApi"
import { useGetContractSchedulesByContractIdQuery } from "@/features/contractSchedule/api/contractScheduleApi"
import {
  useGetExceptionsByDateAssignmentQuery,
  useCreateScheduleExceptionMutation,
  useDeleteScheduleExceptionMutation,
} from "./api/scheduleExceptionApi"
import type { DateGuardUnityAssignmentDto, GuardUnityScheduleAssignmentDto } from "./api/monthlySchedulerModel"
import { INDEX_TO_MONTH } from "./api/monthlySchedulerModel"
import { Month } from "@/features/assignment/api/assignmentModel"
import type { ScheduleExceptionDto } from "./api/scheduleExceptionModel"
import {
  ScheduleExceptionType,
  ScheduleExceptionTypeLabel,
} from "./api/scheduleExceptionModel"
import { GuardType, GuardTypeLabel } from "@/features/guard/api/guardModel"
import {
  GuardPickerDialog,
  type GuardSelection,
} from "@/components/custom/GuardPickerDialog"

// ─── Tab type ─────────────────────────────────────────────────────────────────

type TurnTab = "ALL" | "DAY" | "NIGHT"

// ─── Assignment status ────────────────────────────────────────────────────────

type AssignmentStatus = "ASSIGNED" | "EXCEPTION" | "FREE_DAY" | "VACATION" | "ADDITIONAL" | "EXCEPTIONAL"

function getStatus(a: DateGuardUnityAssignmentDto): AssignmentStatus {
  if (a.hasExceptions) return "EXCEPTION"
  if (a.scheduleAssignmentType === "VACATIONAL" || a.hasVacation) return "VACATION"
  if (a.scheduleAssignmentType === "FREE_DAY") return "FREE_DAY"
  if (a.scheduleAssignmentType === "ADITIONAL") return "ADDITIONAL"
  if (a.scheduleAssignmentType === "EXCEPTIONAL") return "EXCEPTIONAL"
  return "ASSIGNED"
}

const STATUS_BORDER: Record<AssignmentStatus, string> = {
  ASSIGNED: "border-l-primary",
  EXCEPTION: "border-l-amber-500",
  FREE_DAY: "border-l-orange-400",
  VACATION: "border-l-purple-500",
  ADDITIONAL: "border-l-green-500",
  EXCEPTIONAL: "border-l-indigo-500",
}

const STATUS_BADGE: Record<AssignmentStatus, string> = {
  ASSIGNED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  EXCEPTION: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  FREE_DAY: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  VACATION: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  ADDITIONAL: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  EXCEPTIONAL: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
}

const STATUS_LABEL: Record<AssignmentStatus, string> = {
  ASSIGNED: "Asignado",
  EXCEPTION: "Excepción",
  FREE_DAY: "Descanso",
  VACATION: "Vacaciones",
  ADDITIONAL: "Adicional",
  EXCEPTIONAL: "Excepcional",
}

// ─── Guard name helper ─────────────────────────────────────────────────────────

function getGuardName(pool: GuardUnityScheduleAssignmentDto[], id: number): string {
  const g = pool.find(p => p.id === id)
  const emp = g?.guardAssignment?.guard?.employee
  if (emp) return `${emp.firstName} ${emp.lastName}`
  const ext = g?.guardAssignment?.externalGuard
  if (ext) return `${ext.firstName} ${ext.lastName}`
  return `Guardia #${id}`
}

function getGuardType(pool: GuardUnityScheduleAssignmentDto[], id: number): GuardType | undefined {
  return pool.find(p => p.id === id)?.guardType
}

// ─── Exception replacement name from DTO ──────────────────────────────────────

function exceptionReplacementName(ex: ScheduleExceptionDto): string | null {
  const gusa = ex.guardUnityScheduleAssignment
  if (!gusa) return null
  const ext = gusa.guardAssignment?.externalGuard
  if (ext) return `${ext.firstName} ${ext.lastName}`.trim() || `Ext. #${ext.id}`
  const emp = gusa.guardAssignment?.guard?.employee
  if (emp) return `${emp.firstName} ${emp.lastName}`.trim()
  return null
}

function exceptionReplacementDoc(ex: ScheduleExceptionDto): string | null {
  const gusa = ex.guardUnityScheduleAssignment
  if (!gusa) return null
  const ext = gusa.guardAssignment?.externalGuard
  if (ext) return ext.documentNumber ?? null
  return gusa.guardAssignment?.guard?.employee?.documentNumber ?? null
}

// ─── Sub-components ────────────────────────────────────────────────────────────

interface AssignmentCardProps {
  assignment: DateGuardUnityAssignmentDto
  guardPool: GuardUnityScheduleAssignmentDto[]
  turnLabel?: string
  isSelected: boolean
  onSelect: () => void
}

function AssignmentCard({ assignment, guardPool, turnLabel, isSelected, onSelect }: AssignmentCardProps) {
  const status = getStatus(assignment)
  const name = getGuardName(guardPool, assignment.guardUnityScheduleAssignmentId)
  const guardType = getGuardType(guardPool, assignment.guardUnityScheduleAssignmentId)
  const canManage = status !== "FREE_DAY" && status !== "VACATION"

  return (
    <div
      className={cn(
        "bg-card rounded-xl p-4 shadow-sm border border-border border-l-4 transition-all",
        STATUS_BORDER[status],
        isSelected && "ring-2 ring-primary ring-offset-1",
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3 items-center">
          <div className="size-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <UserRound className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-bold text-sm text-foreground">{name}</p>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              {guardType ? GuardTypeLabel[guardType] : "—"}
              {turnLabel ? ` • ${turnLabel}` : ""}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0",
            STATUS_BADGE[status],
          )}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>

      <Button
        size="sm"
        variant={isSelected ? "default" : status === "EXCEPTION" ? "default" : "outline"}
        className={cn(
          "w-full text-xs font-bold",
          !canManage && "opacity-50 cursor-not-allowed",
        )}
        disabled={!canManage}
        onClick={canManage ? onSelect : undefined}
      >
        {status === "EXCEPTION" ? (
          <>
            <ShieldAlert className="h-3.5 w-3.5 mr-1.5" />
            Gestionar Excepción
          </>
        ) : (
          <>
            <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
            Reportar Excepción
          </>
        )}
      </Button>
    </div>
  )
}

interface ExistingExceptionItemProps {
  exception: ScheduleExceptionDto
  onDelete: () => void
  isDeleting: boolean
}

function ExistingExceptionItem({ exception, onDelete, isDeleting }: ExistingExceptionItemProps) {
  const replacementName = exceptionReplacementName(exception)
  const replacementDoc = exceptionReplacementDoc(exception)
  const replacementType = exception.guardUnityScheduleAssignment?.guardType

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
        {replacementName && (
          <p className="text-xs text-foreground font-semibold truncate">
            Reemplazo: {replacementName}
            {replacementDoc ? ` • ${replacementDoc}` : ""}
            {replacementType ? ` • ${GuardTypeLabel[replacementType as GuardType]}` : ""}
          </p>
        )}
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

export function ExceptionManagementPage() {
  // ── Filter state ──────────────────────────────────────────────────────────
  const [contractId, setContractId] = useState<number | undefined>()
  const [contractUnityId, setContractUnityId] = useState<number | undefined>()
  const [selectedDate, setSelectedDate] = useState<string>("")

  // ── UI state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TurnTab>("ALL")
  const [selectedAssignment, setSelectedAssignment] = useState<DateGuardUnityAssignmentDto | undefined>()

  // ── Exception form state ──────────────────────────────────────────────────
  const [exceptionType, setExceptionType] = useState<ScheduleExceptionType | "">("")
  const [motive, setMotive] = useState("")
  const [guardPickerOpen, setGuardPickerOpen] = useState(false)
  const [selectedGuardSelection, setSelectedGuardSelection] = useState<GuardSelection | null>(null)

  // ── Derived from selectedDate ─────────────────────────────────────────────
  const dateObj = useMemo(
    () => (selectedDate ? new Date(selectedDate + "T00:00:00") : null),
    [selectedDate],
  )
  const month = dateObj ? INDEX_TO_MONTH[dateObj.getMonth()] : null
  const year = dateObj ? dateObj.getFullYear() : null

  // ── API Queries ───────────────────────────────────────────────────────────
  const { data: scheduleMonthly, isLoading: isLoadingSchedule } =
    useGetScheduleMonthlyByPeriodQuery(
      { month: month ?? Month.JANUARY, year: year ?? 0 },
      { skip: !month || !year },
    )

  const { data: calendarAssignments = [], isLoading: isLoadingAssignments } =
    useGetCalendarAssignmentsQuery(
      { contractUnityId: contractUnityId ?? 0, scheduleMonthlyId: scheduleMonthly?.id ?? 0 },
      { skip: !contractUnityId || !scheduleMonthly },
    )

  const { data: guardPool = [], isLoading: isLoadingPool } =
    useGetGuardUnityScheduleAssignmentsQuery(
      { contractUnityId: contractUnityId ?? 0, scheduleMonthlyId: scheduleMonthly?.id ?? 0 },
      { skip: !contractUnityId || !scheduleMonthly },
    )

  const { data: contractSchedules = [] } = useGetContractSchedulesByContractIdQuery(
    contractUnityId ?? 0,
    { skip: !contractUnityId },
  )

  const { data: existingExceptions = [], isLoading: isLoadingExceptions } =
    useGetExceptionsByDateAssignmentQuery(selectedAssignment?.id ?? 0, {
      skip: !selectedAssignment,
    })

  // ── Mutations ─────────────────────────────────────────────────────────────
  const [createException, { isLoading: isCreating }] = useCreateScheduleExceptionMutation()
  const [deleteException, { isLoading: isDeleting }] = useDeleteScheduleExceptionMutation()

  // ── Day assignments filtered by selected date ─────────────────────────────
  const dayAssignments = useMemo(() => {
    if (!selectedDate) return []
    return calendarAssignments.filter(
      a =>
        a.date === selectedDate ||
        a.dayOfMonth?.date === selectedDate,
    )
  }, [calendarAssignments, selectedDate])

  // ── Turn ID sets from contract schedule templates ─────────────────────────
  const dayTurnAndHourIds = useMemo(() => {
    const ids = new Set<number>()
    contractSchedules.forEach(cs =>
      cs.turnAndHours
        ?.filter(t => t.turnTemplate?.turnType === "DAY")
        .forEach(t => ids.add(t.id)),
    )
    return ids
  }, [contractSchedules])

  const nightTurnAndHourIds = useMemo(() => {
    const ids = new Set<number>()
    contractSchedules.forEach(cs =>
      cs.turnAndHours
        ?.filter(t => t.turnTemplate?.turnType === "NIGHT")
        .forEach(t => ids.add(t.id)),
    )
    return ids
  }, [contractSchedules])

  // ── Filtered by tab ───────────────────────────────────────────────────────
  const filteredAssignments = useMemo(() => {
    if (activeTab === "ALL") return dayAssignments
    return dayAssignments.filter(a => {
      if (!a.turnAndHourId) return false
      return activeTab === "DAY"
        ? dayTurnAndHourIds.has(a.turnAndHourId)
        : nightTurnAndHourIds.has(a.turnAndHourId)
    })
  }, [dayAssignments, activeTab, dayTurnAndHourIds, nightTurnAndHourIds])

  // ── Turn label for each assignment ────────────────────────────────────────
  const getTurnLabel = (a: DateGuardUnityAssignmentDto): string | undefined => {
    if (!a.turnAndHourId) return undefined
    if (dayTurnAndHourIds.has(a.turnAndHourId)) return "Turno Día"
    if (nightTurnAndHourIds.has(a.turnAndHourId)) return "Turno Noche"
    return undefined
  }

  // ── IDs of internal guards already assigned today (for GuardPickerDialog) ─
  const alreadyInShiftGuardIds = useMemo(() => {
    return new Set(
      dayAssignments
        .map(a => {
          const gs = guardPool.find(g => g.id === a.guardUnityScheduleAssignmentId)
          return gs?.guardAssignment?.guardId
        })
        .filter((id): id is number => id != null),
    )
  }, [dayAssignments, guardPool])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSelectAssignment = (a: DateGuardUnityAssignmentDto) => {
    setSelectedAssignment(a)
    setExceptionType("")
    setMotive("")
    setSelectedGuardSelection(null)
  }

  const handleContractChange = (id: number | undefined) => {
    setContractId(id)
    setContractUnityId(undefined)
    setSelectedAssignment(undefined)
  }

  const handleUnityChange = (id: number | undefined) => {
    setContractUnityId(id)
    setSelectedAssignment(undefined)
  }

  const handleDateChange = (d: string) => {
    setSelectedDate(d)
    setSelectedAssignment(undefined)
  }

  const handleGuardSelected = async (selection: GuardSelection) => {
    setSelectedGuardSelection(selection)
    setGuardPickerOpen(false)
  }

  const handleConfirmException = async () => {
    if (!scheduleMonthly || !selectedAssignment || !exceptionType || !selectedGuardSelection) return
    await createException({
      guardId: selectedGuardSelection.kind === "GUARD" ? selectedGuardSelection.guard.id : null,
      externalGuardId: selectedGuardSelection.kind === "EXTERNAL" ? selectedGuardSelection.externalGuard.id : null,
      guardType: selectedGuardSelection.guardType,
      motive: motive.trim() || undefined,
      dateGuardUnityAssignmentId: selectedAssignment.id,
      scheduleMonthlyId: scheduleMonthly.id,
      scheduleExceptionType: exceptionType as ScheduleExceptionType,
    }).unwrap()
    setExceptionType("")
    setMotive("")
    setSelectedGuardSelection(null)
  }

  const handleDeleteException = async (id: number) => {
    await deleteException(id).unwrap()
  }

  // ── Readiness checks ──────────────────────────────────────────────────────
  const isLoadingData = isLoadingSchedule || isLoadingAssignments || isLoadingPool
  const hasSchedule = scheduleMonthly != null
  const isReady = contractUnityId != null && selectedDate !== "" && hasSchedule && !isLoadingData

  const abssentGuardName = selectedAssignment
    ? getGuardName(guardPool, selectedAssignment.guardUnityScheduleAssignmentId)
    : ""

  const canConfirm = !!exceptionType && !!selectedGuardSelection && !isCreating

  // ── Selected replacement display label ─────────────────────────────────────
  const selectedReplacementLabel = selectedGuardSelection
    ? selectedGuardSelection.kind === "GUARD"
      ? `${selectedGuardSelection.guard.employee?.firstName ?? ""} ${selectedGuardSelection.guard.employee?.lastName ?? ""}`.trim()
      : `${selectedGuardSelection.externalGuard.firstName} ${selectedGuardSelection.externalGuard.lastName}`.trim()
    : null

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
          <h1 className="text-xl font-extrabold tracking-tight">Gestión de Excepciones Diarias</h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            Seleccione un contrato, unidad y fecha para visualizar la dotación asignada.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Contract */}
          <div>
            <label className="block text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
              Contrato / Cliente
            </label>
            <ClientContractSelector
              value={contractId}
              onChange={handleContractChange}
              placeholder="Buscar contrato..."
            />
          </div>

          {/* Unity */}
          <div>
            <label className="block text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
              Unidad Operativa
            </label>
            <ContractUnitySelector
              contractId={contractId}
              value={contractUnityId}
              onChange={handleUnityChange}
              disabled={!contractId}
              placeholder="Seleccionar unidad..."
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
              disabled={!contractUnityId}
              className="w-full"
            />
          </div>
        </div>

        {/* Status line */}
        {contractUnityId && selectedDate && (
          <div className="mt-2 flex items-center gap-2">
            {isLoadingSchedule ? (
              <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Verificando período...
              </span>
            ) : hasSchedule ? (
              <Badge variant="outline" className="text-[10px]">
                <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                {scheduleMonthly!.name}
              </Badge>
            ) : (
              <span className="text-[10px] text-destructive font-medium">
                Sin horario generado para este período
              </span>
            )}
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
                {formattedDate && (
                  <span className="ml-auto text-[10px] text-muted-foreground capitalize">
                    {formattedDate}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground">
                {filteredAssignments.length} asignaciones
              </span>
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
              {isLoadingData ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : filteredAssignments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Users className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">Sin asignaciones para este filtro</p>
                </div>
              ) : (
                filteredAssignments.map(a => (
                  <AssignmentCard
                    key={a.id}
                    assignment={a}
                    guardPool={guardPool}
                    turnLabel={getTurnLabel(a)}
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
                        Excepción: {abssentGuardName}
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

                    {/* Guard picker */}
                    <div className="space-y-3 pt-4 border-t border-border">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Buscar Reemplazo
                      </h4>

                      {selectedReplacementLabel ? (
                        <div className="flex items-center justify-between p-3 rounded-lg border border-primary/40 bg-primary/5">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <UserRound className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-foreground truncate">
                                {selectedReplacementLabel}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {selectedGuardSelection?.kind === "EXTERNAL"
                                  ? "Guardia externo"
                                  : GuardTypeLabel[selectedGuardSelection!.guardType]}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs shrink-0"
                            onClick={() => setSelectedGuardSelection(null)}
                          >
                            Cambiar
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setGuardPickerOpen(true)}
                        >
                          <Search className="h-4 w-4 mr-2" />
                          Buscar Guardia de Reemplazo
                        </Button>
                      )}
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
                  <div className="flex gap-3 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none"
                      onClick={() => setSelectedAssignment(undefined)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 sm:flex-none"
                      disabled={!canConfirm}
                      onClick={handleConfirmException}
                    >
                      {isCreating ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Confirmar Excepción
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── Empty / loading state ─────────────────────────────────────── */
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          {isLoadingData ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Cargando datos...</p>
            </>
          ) : contractUnityId && selectedDate && !hasSchedule ? (
            <>
              <AlertTriangle className="h-10 w-10 text-amber-400 mb-3" />
              <h3 className="text-base font-bold mb-1">Sin horario para este período</h3>
              <p className="text-sm text-muted-foreground">
                Genere un horario mensual desde el Planificador Mensual antes de gestionar excepciones.
              </p>
            </>
          ) : (
            <>
              <ShieldAlert className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <h3 className="text-base font-bold mb-1">Seleccione los filtros</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Elija un contrato, unidad operativa y fecha para visualizar la dotación asignada del día.
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
        guardSchedules={guardPool}
        alreadyInShiftGuardIds={alreadyInShiftGuardIds}
        onSelect={handleGuardSelected}
      />
    </div>
  )
}
