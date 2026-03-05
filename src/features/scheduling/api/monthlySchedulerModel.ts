import type { GuardType } from "@/features/guard/api/guardModel"
import type { Month } from "@/features/assignment/api/assignmentModel"
import type {
  ContractUnityDto,
  TurnAndHourDto,
  DayOfWeek,
  ContractScheduleUnitTemplateDto,
} from "@/features/contractSchedule/api/contractScheduleModel"
import type { GuardDto } from "@/features/guard/api/guardModel"
import type { ScheduleMonthlyDto } from "@/features/assignment/api/assignmentModel"

// ─── Re-export for convenience ────────────────────────────────────────────────
export type { DayOfWeek, ContractScheduleUnitTemplateDto, ContractUnityDto }
export type { ScheduleMonthlyDto, Month }

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum ScheduleAssignmentType {
  NORMAL = "NORMAL",
  ADITIONAL = "ADITIONAL",
  EXCEPTIONAL = "EXCEPTIONAL",
  FREE_DAY = "FREE_DAY",
  VACATIONAL = "VACATIONAL",
}

export const ScheduleAssignmentTypeLabel: Record<ScheduleAssignmentType, string> = {
  [ScheduleAssignmentType.NORMAL]: "Normal",
  [ScheduleAssignmentType.ADITIONAL]: "Adicional",
  [ScheduleAssignmentType.EXCEPTIONAL]: "Excepcional",
  [ScheduleAssignmentType.FREE_DAY]: "Día Libre",
  [ScheduleAssignmentType.VACATIONAL]: "Vacaciones",
}

// ─── WeekOfMonth ──────────────────────────────────────────────────────────────

export interface WeekOfMonthDto {
  id: number
  initDay: number
  initMonth: number
  endDay: number
  endMonth: number
  year: number
  otherYear?: number
  orderIndex: number
  dateFrom: string
  dateTo: string
}

// ─── DayOfMonth ───────────────────────────────────────────────────────────────

export interface DayOfMonthDto {
  id: number
  dayOfMonth: string
  month: Month
  year: number
  dayOfWeek: DayOfWeek
  date: string
  weekOfMonthId?: number
  weekOfMonth?: WeekOfMonthDto
}

// ─── GuardAssignment ──────────────────────────────────────────────────────────

export interface GuardAssignmentDto {
  id: number
  guardId: number
  guard?: GuardDto
  employeeUnitAssignmentId?: number
  active: boolean
  createdAt?: string
}

// ─── GuardUnityScheduleAssignment ────────────────────────────────────────────

export interface GuardUnityScheduleAssignmentDto {
  id: number
  scheduleMonthlyId: number
  scheduleMonthly?: ScheduleMonthlyDto
  guardAssignmentId?: number
  guardAssignment?: GuardAssignmentDto
  guardType: GuardType
  contractUnityId: number
  contractUnity?: ContractUnityDto
}

// ─── DateGuardUnityAssignment ─────────────────────────────────────────────────

export interface DateGuardUnityAssignmentDto {
  id: number
  dayOfMonthId?: number
  dayOfMonth?: DayOfMonthDto
  guardUnityScheduleAssignmentId: number
  guardUnityScheduleAssignment?: GuardUnityScheduleAssignmentDto
  turnAndHourId?: number
  turnAndHour?: TurnAndHourDto
  dayOfWeek?: DayOfWeek
  numDay?: number
  date?: string
  /** End date for vacation ranges; null/undefined = single-day assignment */
  toDate?: string
  scheduleAssignmentType: ScheduleAssignmentType
  hasVacation: boolean
  hasExceptions: boolean
}

// ─── Request Types ────────────────────────────────────────────────────────────

export interface GenerateMonthScheduleRequest {
  contractUnityId: number
  month: Month
  year: number
  scheduleName?: string
  scheduleDescription?: string
}

export interface UpdateGuardUnityScheduleRequest {
  guardType: GuardType
}

export interface CreateDailyAssignmentRequest {
  date: string
  guardUnityScheduleAssignmentId: number
  turnAndHourId: number | null
  scheduleAssignmentType: ScheduleAssignmentType
}

export interface CreateGuardMonthlyAssignmentRequest {
  guardId: number
  contractUnityId: number
  scheduleMonthlyId: number
  guardType: GuardType
}

export interface CreateBulkFreeDayRequest {
  guardUnityScheduleAssignmentId: number
  dates: string[]
}

export interface CreateVacationAssignmentRequest {
  guardUnityScheduleAssignmentId: number
  /** Start date (always required) */
  date: string
  /** End date for range vacations; omit or null for single-day */
  toDate?: string | null
}

// ─── Calendar Helper Types ────────────────────────────────────────────────────

export interface CalendarCell {
  date: string | null
  dayNumber: number | null
  jsDay: number // 0=Sun..6=Sat
}

export interface CalendarDayStats {
  date: string
  assignments: DateGuardUnityAssignmentDto[]
  normalCount: number
  freeDayCount: number
  vacationCount: number
  dayTurnCount: number
  nightTurnCount: number
}

// ─── Month helpers ────────────────────────────────────────────────────────────

export const MONTH_INDEX: Record<Month, number> = {
  JANUARY: 0,
  FEBRUARY: 1,
  MARCH: 2,
  APRIL: 3,
  MAY: 4,
  JUNE: 5,
  JULY: 6,
  AUGUST: 7,
  SEPTEMBER: 8,
  OCTOBER: 9,
  NOVEMBER: 10,
  DECEMBER: 11,
}

export const INDEX_TO_MONTH: Month[] = [
  "JANUARY" as Month,
  "FEBRUARY" as Month,
  "MARCH" as Month,
  "APRIL" as Month,
  "MAY" as Month,
  "JUNE" as Month,
  "JULY" as Month,
  "AUGUST" as Month,
  "SEPTEMBER" as Month,
  "OCTOBER" as Month,
  "NOVEMBER" as Month,
  "DECEMBER" as Month,
]

/** Build calendar grid for a given month/year (Sunday-first) */
export function buildCalendarCells(month: Month, year: number): CalendarCell[] {
  const monthIdx = MONTH_INDEX[month]
  const firstDay = new Date(year, monthIdx, 1)
  const totalDays = new Date(year, monthIdx + 1, 0).getDate()
  const firstJsDay = firstDay.getDay() // 0=Sunday

  const cells: CalendarCell[] = []

  // Empty leading cells
  for (let i = 0; i < firstJsDay; i++) {
    cells.push({ date: null, dayNumber: null, jsDay: i })
  }

  // Day cells
  for (let d = 1; d <= totalDays; d++) {
    const dt = new Date(year, monthIdx, d)
    const yyyy = dt.getFullYear()
    const mm = String(dt.getMonth() + 1).padStart(2, "0")
    const dd = String(dt.getDate()).padStart(2, "0")
    cells.push({ date: `${yyyy}-${mm}-${dd}`, dayNumber: d, jsDay: dt.getDay() })
  }

  // Trailing empty cells to complete last row
  while (cells.length % 7 !== 0) {
    cells.push({ date: null, dayNumber: null, jsDay: cells.length % 7 })
  }

  return cells
}

/** Get day stats from a flat list of DateGuardUnityAssignment for a single date */
export function getDayStats(
  date: string,
  allAssignments: DateGuardUnityAssignmentDto[],
): CalendarDayStats {
  const assignments = allAssignments.filter(
    a =>
      a.date === date ||
      a.dayOfMonth?.date === date ||
      // Range vacation: covers this date
      (a.toDate != null && a.date != null && a.date <= date && a.toDate >= date),
  )

  const normalCount = assignments.filter(
    a => a.scheduleAssignmentType === ScheduleAssignmentType.NORMAL ||
         a.scheduleAssignmentType === ScheduleAssignmentType.ADITIONAL ||
         a.scheduleAssignmentType === ScheduleAssignmentType.EXCEPTIONAL,
  ).length

  const freeDayCount = assignments.filter(
    a => a.scheduleAssignmentType === ScheduleAssignmentType.FREE_DAY,
  ).length

  const vacationCount = assignments.filter(
    a => a.scheduleAssignmentType === ScheduleAssignmentType.VACATIONAL || a.hasVacation,
  ).length

  const dayTurnCount = assignments.filter(
    a => a.turnAndHour?.turnTemplate?.turnType === "DAY" &&
         a.scheduleAssignmentType !== ScheduleAssignmentType.FREE_DAY &&
         !a.hasVacation,
  ).length

  const nightTurnCount = assignments.filter(
    a => a.turnAndHour?.turnTemplate?.turnType === "NIGHT" &&
         a.scheduleAssignmentType !== ScheduleAssignmentType.FREE_DAY &&
         !a.hasVacation,
  ).length

  return { date, assignments, normalCount, freeDayCount, vacationCount, dayTurnCount, nightTurnCount }
}
