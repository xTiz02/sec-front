// ─── ScheduleExceptionType ────────────────────────────────────────────────────

import type { GuardType } from "@/features/guard/api/guardModel"

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
  /** Eagerly-loaded replacement guard assignment (includes guardAssignment.guard / externalGuard) */
  guardUnityScheduleAssignment?: {
    id: number
    guardType: GuardType
    guardAssignment?: {
      id: number
      guard?: { id: number; employee?: { firstName: string; lastName: string; documentNumber?: string } }
      externalGuard?: { id: number; firstName: string; lastName: string; documentNumber?: string }
    }
  }
  motive?: string
  description?: string
  /** The absent guard's DateGuardUnityAssignment id */
  dateGuardUnityAssignmentId: number
  scheduleMonthlyId?: number
  orderIndex?: number
  scheduleExceptionType: ScheduleExceptionType
}

// ─── Request Types ────────────────────────────────────────────────────────────

export interface CreateScheduleExceptionRequest {
  /** Internal replacement guard id. Backend creates GuardUnityScheduleAssignment if needed. */
  guardId?: number | null
  /** External replacement guard id. Backend creates GuardUnityScheduleAssignment if needed. */
  externalGuardId?: number | null
  guardType?: string
  motive?: string
  description?: string
  /** The absent guard's DateGuardUnityAssignment id */
  dateGuardUnityAssignmentId: number
  scheduleMonthlyId: number
  scheduleExceptionType: ScheduleExceptionType
}
