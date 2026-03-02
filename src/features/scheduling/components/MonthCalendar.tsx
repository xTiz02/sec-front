import { useMemo } from "react"
import type { Month } from "@/features/assignment/api/assignmentModel"
import type {
  DateGuardUnityAssignmentDto,
  ContractScheduleUnitTemplateDto,
} from "../api/monthlySchedulerModel"
import { buildCalendarCells, getDayStats } from "../api/monthlySchedulerModel"
import { CalendarDayCell, CalendarEmptyCell } from "./CalendarDayCell"

// ─── Calendar header days ─────────────────────────────────────────────────────

const HEADER_DAYS = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"]

// ─── Props ────────────────────────────────────────────────────────────────────

interface MonthCalendarProps {
  month: Month
  year: number
  assignments: DateGuardUnityAssignmentDto[]
  contractSchedules: ContractScheduleUnitTemplateDto[]
  selectedDate: string | undefined
  hasSchedule: boolean
  onDayClick: (date: string) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MonthCalendar({
  month,
  year,
  assignments,
  contractSchedules,
  selectedDate,
  hasSchedule,
  onDayClick,
}: MonthCalendarProps) {
  const cells = useMemo(() => buildCalendarCells(month, year), [month, year])

  // Build a map date → stats once for the entire month
  const statsMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getDayStats>>()
    cells.forEach(cell => {
      if (cell.date) {
        map.set(cell.date, getDayStats(cell.date, assignments))
      }
    })
    return map
  }, [cells, assignments])

  return (
    <div className="flex-1 overflow-hidden bg-muted/30">
      <div className="h-full flex flex-col bg-card rounded-xl border border-border shadow-sm overflow-hidden mx-4 mb-3">
        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/50 shrink-0">
          {HEADER_DAYS.map(day => (
            <div
              key={day}
              className="p-2 text-center text-[10px] font-bold uppercase text-muted-foreground tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 flex-1 auto-rows-fr overflow-y-auto">
          {cells.map((cell, idx) =>
            cell.date && cell.dayNumber ? (
              <CalendarDayCell
                key={cell.date}
                dayNumber={cell.dayNumber}
                date={cell.date}
                jsDay={cell.jsDay}
                isSelected={cell.date === selectedDate}
                stats={statsMap.get(cell.date)}
                contractSchedules={contractSchedules}
                hasSchedule={hasSchedule}
                onClick={() => onDayClick(cell.date!)}
              />
            ) : (
              <CalendarEmptyCell key={`empty-${idx}`} />
            ),
          )}
        </div>
      </div>
    </div>
  )
}
