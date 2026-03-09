import type { GuardDto } from "@/features/guard/api/guardModel"
import type { TurnTemplateDto } from "@/features/contractSchedule/api/contractScheduleModel"
import type { SpecialServiceUnityDto } from "../unity/api/specialServiceUnityModel"
import type { ExternalGuardDto } from "@/features/externalGuard/api/externalGuardModel"

// Re-export enums needed in pages
export { TurnType, TurnTypeLabel } from "@/features/contractSchedule/api/contractScheduleModel"
export { GuardType, GuardTypeLabel } from "@/features/guard/api/guardModel"

// ─── Response DTOs ─────────────────────────────────────────────────────────────

export interface SpecialServiceGuardUnityAssignmentDto {
  id: number
  guardType: string
  guardAssignment?: {
    id: number
    guard?: GuardDto
    externalGuardId?: number
    externalGuard?: ExternalGuardDto
  }
}

export interface SpecialServiceDayAssignmentDto {
  /** DateGuardUnityAssignment.id */
  id: number
  /** YYYY-MM-DD */
  date: string
  guardUnityScheduleAssignment?: SpecialServiceGuardUnityAssignmentDto
  turnAndHour?: {
    id: number
    turnTemplate?: TurnTemplateDto
  }
}

export interface SpecialServiceScheduleDto {
  id: number
  specialServiceUnityId: number
  specialServiceUnity?: SpecialServiceUnityDto
  /** YYYY-MM-DD */
  dateFrom?: string
  /** YYYY-MM-DD */
  dateTo?: string
  totalDays?: number
  totalAssignments?: number
  /** All DateGuardUnityAssignment records for this schedule */
  dayAssignments: SpecialServiceDayAssignmentDto[]
  createdAt?: string
}

/** Lightweight summary for list page */
export interface SpecialServiceScheduleSummaryDto {
  id: number
  specialServiceUnityId: number
  specialServiceUnityName?: string
  totalDays?: number
  totalAssignments?: number
  dateFrom?: string
  dateTo?: string
  createdAt?: string
}

// ─── Request Types ─────────────────────────────────────────────────────────────

export interface CreateSpecialServiceAssignmentRequest {
  /** YYYY-MM-DD */
  date: string
  /** Internal guard id — mutually exclusive with externalGuardId */
  guardId?: number | null
  /** External guard id — mutually exclusive with guardId */
  externalGuardId?: number | null
  guardType: string
  /** HH:mm */
  timeFrom: string
  /** HH:mm */
  timeTo: string
  turnType: string
}

export interface CreateSpecialServiceScheduleRequest {
  specialServiceUnityId: number
  /** YYYY-MM-DD */
  dateFrom: string
  /** YYYY-MM-DD */
  dateTo: string
  assignments: CreateSpecialServiceAssignmentRequest[]
}

export type AddSpecialServiceAssignmentRequest = CreateSpecialServiceAssignmentRequest

// ─── Exception Request ──────────────────────────────────────────────────────

export interface CreateSpecialServiceExceptionRequest {
  /** The absent guard's DateGuardUnityAssignment id */
  dateGuardUnityAssignmentId: number
  /** Internal guard id for replacement — mutually exclusive with externalGuardId */
  guardId?: number | null
  /** External guard id for replacement — mutually exclusive with guardId */
  externalGuardId?: number | null
  guardType: string
  scheduleExceptionType: string
  motive?: string
  scheduleId: number
  description?: string
}
