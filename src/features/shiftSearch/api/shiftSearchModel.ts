import type { GuardType } from "@/features/guard/api/guardModel"
import type { ScheduleAssignmentType } from "@/features/scheduling/api/monthlySchedulerModel"
import type { TurnType } from "@/features/contractSchedule/api/contractScheduleModel"
import type {
  AssistanceType,
  AssistanceProblemType,
  RequestStatus,
} from "@/features/assistance/api/assistanceModel"
import type { ScheduleExceptionType } from "@/features/scheduling/api/scheduleExceptionModel"

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

// ─── Shift detail DTO (full) ──────────────────────────────────────────────────

export interface ShiftAssistanceEventDetailDto {
  id: number
  assistanceType: AssistanceType
  assistanceProblemType: AssistanceProblemType
  /** null when the mark was system auto-closed */
  markDate?: string        // "yyyy-MM-dd"
  markTime?: string        // "HH:mm:ss"
  systemMark: string       // ISO datetime (always present)
  limitTimeToMark?: string // ISO datetime — deadline for this mark
  toleranceMinutes?: number
  /** Computed by service layer: positive = late, negative = early */
  differenceInMinutes?: number
  numberOrder: number
  photoUrl?: string
  latitude?: number
  longitude?: number
  ipAddress?: string
  justification?: {
    id: number
    description: string
    requestStatus: RequestStatus
    createdAt: string
  }
}

export interface ShiftExceptionDetailDto {
  id: number
  scheduleExceptionType: ScheduleExceptionType
  motive?: string
  description?: string
  replacementGuardName?: string
  replacementGuardCode?: string
  replacementGuardType?: GuardType
  replacementDocumentNumber?: string
}

export interface ShiftExtraHoursDetailDto {
  id: number
  startDate: string        // "yyyy-MM-dd"
  startTime: string        // "HH:mm"
  endDate?: string         // "yyyy-MM-dd"
  endTime?: string         // "HH:mm"
  extraHours?: number
  /** The shift being fulfilled (principalDateGuardUnityAssignment) */
  principalGuardName?: string
  principalShiftDate?: string
  /** The shift being covered (coverDateGuardUnityAssignment) */
  coverGuardName?: string
  coverShiftDate?: string
  /** Operator who created/enabled the extra hours */
  operatorUserName?: string
  createdAt?: string
}

export interface ShiftDetailDto {
  // ── Assignment ──────────────────────────────────────────────────────────────
  id: number
  date: string             // "yyyy-MM-dd"
  scheduleAssignmentType: ScheduleAssignmentType
  hasVacation: boolean
  hasExceptions: boolean
  hasExtraHours: boolean
  hasMarks: boolean
  finalized: boolean

  // ── Guard ───────────────────────────────────────────────────────────────────
  guardName: string
  guardCode?: string
  documentNumber: string
  identificationType?: string
  guardType?: GuardType
  isExternalGuard: boolean
  guardPhotoUrl?: string

  // ── Turn ────────────────────────────────────────────────────────────────────
  turnName?: string
  turnType?: TurnType
  scheduledEntry?: string     // ISO datetime "yyyy-MM-ddTHH:mm:ss"
  scheduledExit?: string      // ISO datetime "yyyy-MM-ddTHH:mm:ss"
  maxScheduledEntry?: string  // ISO datetime — latest allowed entry mark
  maxScheduledExit?: string   // ISO datetime — latest allowed exit mark

  // ── Unity & Client ──────────────────────────────────────────────────────────
  contractUnityId?: number
  contractUnityName?: string
  contractUnityCode?: string
  specialServiceUnityId?: number
  specialServiceUnityName?: string
  clientName?: string
  clientContractName?: string
  unityAddress?: string

  // ── Schedule (monthly) ──────────────────────────────────────────────────────
  scheduleMonthlyId?: number
  scheduleMonthlyName?: string

  // ── Nested data ─────────────────────────────────────────────────────────────
  assistanceEvents: ShiftAssistanceEventDetailDto[]
  exceptions: ShiftExceptionDetailDto[]
  extraHours: ShiftExtraHoursDetailDto[]
}

// ─── Next shifts to cover (for extra-hours form) ─────────────────────────────

export interface NextShiftToCoverDto {
  id: number
  date: string           // "yyyy-MM-dd"
  guardName: string
  guardCode?: string
  scheduledEntry?: string  // "HH:mm"
  scheduledExit?: string   // "HH:mm"
  turnName?: string
  turnType?: TurnType
}

// ─── Create extra hours request ───────────────────────────────────────────────

export interface CreateExtraHoursRequest {
  principalDateGuardUnityAssignmentId: number
  /** The shift being covered. Omit when guard stays extra time without covering a specific shift. */
  coverDateGuardUnityAssignmentId?: number
  startDate: string  // "yyyy-MM-dd"
  startTime: string  // "HH:mm:ss"
  /** Required only when no coverDateGuardUnityAssignmentId */
  endDate?: string
  endTime?: string
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
