import type { GuardType } from "@/features/guard/api/guardModel"
import type { ScheduleAssignmentType } from "@/features/scheduling/api/monthlySchedulerModel"

// ─── Guard / ExternalGuard unified lite view ──────────────────────────────────

export interface GuardLiteView {
  guardId?: number
  externalGuardId?: number
  code?: string
  documentNumber: string
  identificationType?: string
  fullName: string
  guardType?: GuardType
}

// ─── Unity / SpecialServiceUnity unified lite view ────────────────────────────

export interface UnityLiteView {
  unityId?: number
  specialServiceUnityId?: number
  unityName: string
  unityCode?: string
  address?: string
  clientName?: string
}

// ─── Search params ────────────────────────────────────────────────────────────

export interface ShiftSearchParams {
  dateFrom: string
  dateTo: string
  clientId?: number
  guardId?: number
  externalGuardId?: number
  unityId?: number
  specialServiceUnityId?: number
  scheduleAssignmentType?: ScheduleAssignmentType
  hasExceptions?: boolean
  hasExtraHours?: boolean
  hasMarks?: boolean
  page?: number
  size?: number
}

// ─── Result row ───────────────────────────────────────────────────────────────

export interface ShiftSearchResultDto {
  id: number
  date: string               // "yyyy-MM-dd"
  guardName: string
  guardCode?: string
  documentNumber: string
  guardType?: GuardType
  isExternalGuard: boolean
  contractUnityName?: string
  specialServiceUnityName?: string
  clientName?: string
  scheduledEntry?: string    // "HH:mm"
  scheduledExit?: string     // "HH:mm"
  scheduleAssignmentType: ScheduleAssignmentType
  hasExceptions: boolean
  hasExtraHours: boolean
  hasMarks: boolean
  hasVacation: boolean
  finalized: boolean
  // Actual attendance marks
  markEntry?: string         // "HH:mm"
  markBreakStart?: string    // "HH:mm"
  markBreakEnd?: string      // "HH:mm"
  markExit?: string          // "HH:mm"
}
