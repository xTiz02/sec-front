import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { TurnType } from "@/features/contractSchedule/api/contractScheduleModel"
import type { TurnAndHourDto } from "@/features/contractSchedule/api/contractScheduleModel"
import { GuardType, GuardTypeLabel } from "@/features/guard/api/guardModel"
import type { DateGuardUnityAssignmentDto, GuardUnityScheduleAssignmentDto } from "../api/monthlySchedulerModel"
import type { GuardSelection } from "@/components/custom/GuardPickerDialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { MoonStar, Sun, Bed, Plus, X, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GuardPickerDialog } from "@/components/custom/GuardPickerDialog"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(first?: string, last?: string) {
  return `${(first?.[0] ?? "?").toUpperCase()}${(last?.[0] ?? "").toUpperCase()}`
}

function GuardTypeBadge({ type }: { type: GuardType }) {
  const colors: Record<GuardType, string> = {
    [GuardType.HOLDER]: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    [GuardType.RELEASE]: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    [GuardType.ROTATING]: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    [GuardType.BASE_AGENT]: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  }
  return (
    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", colors[type])}>
      {GuardTypeLabel[type]}
    </span>
  )
}

// ─── Guard Card ───────────────────────────────────────────────────────────────

interface GuardCardProps {
  assignment: DateGuardUnityAssignmentDto
  guardSchedule: GuardUnityScheduleAssignmentDto | undefined
  faded?: boolean
  onUpdateGuardType?: (scheduleAssignmentId: number, guardType: GuardType) => Promise<void>
  onRemove?: (assignmentId: number) => Promise<void>
}

function GuardCard({ assignment, guardSchedule, faded = false, onUpdateGuardType, onRemove }: GuardCardProps) {
  const [removing, setRemoving] = useState(false)
  const guard = guardSchedule?.guardAssignment?.guard
  const emp = guard?.employee
  const externalGuard = guardSchedule?.guardAssignment?.externalGuard
  const firstName = emp?.firstName ?? externalGuard?.firstName ?? "Guardia"
  const lastName = emp?.lastName ?? externalGuard?.lastName ?? `#${guard?.id ?? "?"}`
  const docNumber = emp?.documentNumber

  const handleRemove = async () => {
    if (!onRemove) return
    setRemoving(true)
    try {
      await onRemove(assignment.id)
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border border-border shadow-sm",
        "bg-card hover:border-primary/50 transition-colors group",
        faded && "opacity-60 grayscale",
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="size-9 shrink-0">
          {guard?.photoUrl && <AvatarImage src={guard.photoUrl} />}
          <AvatarFallback className="text-xs font-bold">
            {initials(firstName, lastName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground truncate">
            {firstName} {lastName}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <GuardTypeBadge type={guardSchedule?.guardType ?? GuardType.HOLDER} />
            {docNumber && (
              <span className="text-[10px] text-muted-foreground">#{docNumber}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 ml-2 shrink-0">
        {onUpdateGuardType && guardSchedule && !faded && (
          <Select
            value={guardSchedule.guardType}
            onValueChange={val => onUpdateGuardType(guardSchedule.id, val as GuardType)}
          >
            <SelectTrigger className="h-7 w-28 text-[10px]">
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
        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
            disabled={removing}
            onClick={handleRemove}
            title="Quitar del turno"
          >
            {removing ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
          </Button>
        )}
      </div>
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ShiftSectionProps {
  turnType: TurnType | "REST"
  /** Override the generic "Turno Día / Turno Noche" title with the specific turn name */
  label?: string
  assignments: DateGuardUnityAssignmentDto[]
  guardSchedules: GuardUnityScheduleAssignmentDto[]
  required: number
  /** TurnAndHour records for this shift from contractSchedules — used to show time ranges */
  turnAndHours?: TurnAndHourDto[]
  onUpdateGuardType?: (scheduleAssignmentId: number, guardType: GuardType) => Promise<void>
  onAddAssignment?: (selection: GuardSelection) => Promise<void>
  onRemoveAssignment?: (assignmentId: number) => Promise<void>
  /** Only for REST sections: opens the free-day assignment dialog */
  onAddFreeDayClick?: () => void
  faded?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ShiftSection({
  turnType,
  label,
  assignments,
  guardSchedules,
  required,
  turnAndHours,
  faded = false,
  onUpdateGuardType,
  onAddAssignment,
  onRemoveAssignment,
  onAddFreeDayClick,
}: ShiftSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const isRest = turnType === "REST" || !faded
  const assigned = assignments.length

  const statusText = isRest
    ? `${assigned} Asignados`
    : assigned >= required
      ? `${assigned}/${required} Completo`
      : `${assigned}/${required} Faltante`

  const statusColor = isRest
    ? "text-muted-foreground"
    : assigned >= required
      ? "text-green-600 dark:text-green-400"
      : "text-destructive"

  const icon =
    turnType === TurnType.DAY ? (
      <Sun className="h-4 w-4 text-amber-500" />
    ) : turnType === TurnType.NIGHT ? (
      <MoonStar className="h-4 w-4 text-blue-500" />
    ) : (
      <Bed className="h-4 w-4 text-muted-foreground" />
    )

  const title =
    label ??
    (turnType === TurnType.DAY
      ? "Turno Día"
      : turnType === TurnType.NIGHT
        ? "Turno Noche"
        : "Descansos")

  const dialogTitle =
    turnType === TurnType.DAY
      ? "Agregar al Turno Día"
      : turnType === TurnType.NIGHT
        ? "Agregar al Turno Noche"
        : "Agregar Descanso"

  const timeRange = (() => {
    if (turnAndHours && turnAndHours.length > 0) {
      return turnAndHours
        .map(t => t.turnTemplate ? `${t.turnTemplate.timeFrom} – ${t.turnTemplate.timeTo}` : "")
        .filter(Boolean)
        .join(" · ")
    }
    const firstTurn = assignments.find(a => a.turnAndHour?.turnTemplate)?.turnAndHour?.turnTemplate
    return firstTurn ? `${firstTurn.timeFrom} – ${firstTurn.timeTo}` : ""
  })()

  /** Guard IDs already assigned to THIS shift today (to disable in add dialog) */
  const alreadyInShiftGuardIds = useMemo(() => {
    const ids = new Set<number>()
    for (const a of assignments) {
      const gsId = a.guardUnityScheduleAssignment?.id ?? a.guardUnityScheduleAssignmentId
      const gs = guardSchedules.find(g => g.id === gsId)
      const gid = gs?.guardAssignment?.guardId
      if (gid != null) ids.add(gid)
    }
    return ids
  }, [assignments, guardSchedules])

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between sticky top-0 bg-card z-10 py-2 border-b border-dashed border-border">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-1.5 rounded",
            isRest ? "bg-muted" :
            turnType === TurnType.DAY ? "bg-amber-100 dark:bg-amber-900/30" :
            "bg-blue-100 dark:bg-blue-900/30",
          )}>
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground">{title}</h3>
            {timeRange && (
              <p className="text-[11px] text-muted-foreground">{timeRange}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-bold", statusColor)}>{statusText}</span>
          {onAddAssignment && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="h-3 w-3" />
              Agregar
            </Button>
          )}
          {onAddFreeDayClick && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={onAddFreeDayClick}
            >
              <Plus className="h-3 w-3" />
              Día Libre
            </Button>
          )}
        </div>
      </div>

      {/* Guard cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {assignments.map(a => {
          const gs = guardSchedules.find(
            g => g.id === (a.guardUnityScheduleAssignment?.id ?? a.guardUnityScheduleAssignmentId),
          )
          return (
            <GuardCard
              key={a.id}
              assignment={a}
              guardSchedule={gs}
              faded={isRest}
              onUpdateGuardType={onUpdateGuardType}
              onRemove={onRemoveAssignment}
            />
          )
        })}
        {assignments.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-2 py-2">Sin asignaciones</p>
        )}
      </div>

      {/* Add guard dialog */}
      {onAddAssignment && (
        <GuardPickerDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title={dialogTitle}
          allowExternal
          guardSchedules={guardSchedules}
          alreadyInShiftGuardIds={alreadyInShiftGuardIds}
          onSelect={async selection => onAddAssignment(selection)}
        />
      )}
    </div>
  )
}
