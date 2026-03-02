import { cn } from "@/lib/utils"
import type { CalendarDayStats, ContractScheduleUnitTemplateDto } from "../api/monthlySchedulerModel"
import { DayOfWeek } from "@/features/contractSchedule/api/contractScheduleModel"

// ─── Day of week from JS date index to DayOfWeek enum ────────────────────────

const JS_DAY_TO_DOW: Record<number, DayOfWeek> = {
  0: DayOfWeek.SUNDAY,
  1: DayOfWeek.MONDAY,
  2: DayOfWeek.TUESDAY,
  3: DayOfWeek.WEDNESDAY,
  4: DayOfWeek.THURSDAY,
  5: DayOfWeek.FRIDAY,
  6: DayOfWeek.SATURDAY,
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface CalendarDayCellProps {
  dayNumber: number
  date: string
  jsDay: number // 0=Sun..6=Sat
  isSelected: boolean
  stats: CalendarDayStats | undefined
  contractSchedules: ContractScheduleUnitTemplateDto[]
  onClick: () => void
  hasSchedule: boolean // whether a schedule exists at all
}

// ─── Coverage badge variant ───────────────────────────────────────────────────

function CoverageBadge({ assigned, required }: { assigned: number; required: number }) {
  if (required === 0) return null
  const isComplete = assigned >= required
  const isOver = assigned > required
  const variant = isOver
    ? "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800"
    : isComplete
      ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
      : "bg-destructive/10 text-destructive border-destructive/20 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"

  return (
    <span className={cn("text-[9px] font-bold px-1 py-0.5 rounded border", variant)}>
      {assigned}/{required}
    </span>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CalendarDayCell({
  dayNumber,
  date: _date,
  jsDay,
  isSelected,
  stats,
  contractSchedules,
  onClick,
  hasSchedule,
}: CalendarDayCellProps) {
  const dow = JS_DAY_TO_DOW[jsDay]
  const template = contractSchedules.find(t => t.dayOfWeek === dow)
  const required =
    template?.turnAndHours && template.turnAndHours.length > 0
      ? template.turnAndHours.reduce((sum, t) => sum + (t.turnTemplate?.numGuards ?? 0), 0)
      : (template?.numOfGuards ?? 0)
  const assigned = stats?.normalCount ?? 0
  const dayCount = stats?.dayTurnCount ?? 0
  const nightCount = stats?.nightTurnCount ?? 0
  const vacCount = stats?.vacationCount ?? 0
  const restCount = stats?.freeDayCount ?? 0

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative border-b border-r min-h-[80px] flex flex-col p-1.5 transition-colors",
        "border-border cursor-pointer",
        isSelected
          ? "bg-primary/5 ring-2 ring-inset ring-primary z-10"
          : "bg-card hover:bg-muted/50",
      )}
    >
      {/* Day number + coverage */}
      <div className="flex justify-between items-start mb-1">
        <span
          className={cn(
            "text-xs font-bold",
            isSelected ? "text-primary" : "text-foreground",
          )}
        >
          {dayNumber}
        </span>
        {hasSchedule && <CoverageBadge assigned={assigned} required={required} />}
      </div>

      {/* D / N counts */}
      {hasSchedule && (dayCount > 0 || nightCount > 0) && (
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[9px] font-semibold text-muted-foreground">D:{dayCount}</span>
          <span className="text-[9px] font-semibold text-muted-foreground">N:{nightCount}</span>
        </div>
      )}

      {/* Rest / Vacation dots */}
      {hasSchedule && (
        <div className="mt-auto flex flex-col gap-0.5">
          {restCount > 0 && (
            <div className="flex items-center gap-1">
              <div className="size-1.5 rounded-full bg-orange-400" />
              <span className="text-[9px] text-muted-foreground font-medium">
                {restCount} Descanso{restCount > 1 ? "s" : ""}
              </span>
            </div>
          )}
          {vacCount > 0 && (
            <div className="flex items-center gap-1">
              <div className="size-1.5 rounded-full bg-purple-500" />
              <span className="text-[9px] text-purple-600 dark:text-purple-400 font-medium">
                {vacCount} Vacaciones
              </span>
            </div>
          )}
        </div>
      )}

      {/* Indicator line on selected */}
      {isSelected && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
      )}
    </div>
  )
}

// ─── Empty cell (outside current month) ──────────────────────────────────────

export function CalendarEmptyCell() {
  return (
    <div className="border-b border-r border-border min-h-[80px] bg-muted/20 p-1.5" />
  )
}
