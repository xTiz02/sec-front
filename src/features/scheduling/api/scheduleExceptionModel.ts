// ─── ScheduleExceptionType ────────────────────────────────────────────────────

export enum ScheduleExceptionType {
  MEDICAL = "MEDICAL",
  ABANDONED = "ABANDONED",
  OTHER = "OTHER",
}

export const ScheduleExceptionTypeLabel: Record<ScheduleExceptionType, string> = {
  [ScheduleExceptionType.MEDICAL]: "Médico / Parte Médico",
  [ScheduleExceptionType.ABANDONED]: "Abandono / Inasistencia",
  [ScheduleExceptionType.OTHER]: "Otro",
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface ScheduleExceptionDto {
  id: number
  /** The replacement guard's GuardUnityScheduleAssignment id */
  guardUnityScheduleAssignmentId: number
  motive?: string
  description?: string
  /** The absent guard's DateGuardUnityAssignment id */
  dateGuardUnityAssignmentId: number
  scheduleMonthlyId: number
  orderIndex?: number
  scheduleExceptionType: ScheduleExceptionType
}

// ─── Request Types ────────────────────────────────────────────────────────────

export interface CreateScheduleExceptionRequest {
  /** The replacement guard's GuardUnityScheduleAssignment id */
  guardUnityScheduleAssignmentId: number
  motive?: string
  description?: string
  /** The absent guard's DateGuardUnityAssignment id */
  dateGuardUnityAssignmentId: number
  scheduleMonthlyId: number
  scheduleExceptionType: ScheduleExceptionType
}
