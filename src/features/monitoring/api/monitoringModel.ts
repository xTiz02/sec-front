import type { GuardType } from "@/features/guard/api/guardModel"
import type { AssistanceType, AssistanceProblemType } from "@/features/assistance/api/assistanceModel"
import type { ScheduleAssignmentType } from "@/features/scheduling/api/monthlySchedulerModel"

// ─── Unit map marker status ───────────────────────────────────────────────────

export interface UnitMonitoringStatusDto {
  contractUnityId: number
  unityName: string
  unityCode: string
  clientName: string
  clientContractName: string
  address?: string
  latitude: number
  longitude: number
  totalShifts: number
  arrivedGuards: number
  absentGuards: number
  date: string
}

// ─── Guard shift detail (for unit shift modal) ────────────────────────────────

export interface GuardShiftDetailDto {
  dateGuardUnityAssignmentId: number
  guardName: string
  guardCode: string
  documentNumber: string
  guardType: GuardType
  scheduleAssignmentType: ScheduleAssignmentType
  turnStartTime: string   // "HH:mm"
  turnEndTime: string     // "HH:mm"
  isException: boolean    // hasExceptions flag
  hasExtraHours: boolean
  shouldBeOnPost: boolean // currently within shift hours
  absent: boolean       // scheduleAssignmentType === ABSENT
  hasArrived: boolean     // has at least one ENTRY assistance
  isFutureShift: boolean  // shift hasn't started yet
  lastAssistanceType?: AssistanceType
  lastMarkTime?: string   // "HH:mm"
}

// ─── Live assistance event (WebSocket + REST feed) ────────────────────────────

export interface LiveAssistanceEventDto {
  id: number
  dateGuardUnityAssignmentId: number
  guardAssignmentId: number
  guardName: string
  guardCode: string
  guardDocumentNumber: string
  contractUnityId: number
  unityName: string
  clientName: string
  photoUrl?: string
  latitude?: number
  longitude?: number
  markDate: string             // "yyyy-MM-dd"
  markTime: string             // "HH:mm:ss"
  systemMark: string           // ISO datetime
  assistanceType: AssistanceType
  assistanceProblemType?: AssistanceProblemType
  toleranceMinutes: number
  guardType: GuardType
  numberOrder: number
}
