// ─── Enums ────────────────────────────────────────────────────────────────────

import type { TurnType } from "@/features/contractSchedule/api/contractScheduleModel"

export enum AssistanceType {
  ENTRY = "ENTRY",
  EXIT = "EXIT",
  BREAK_START = "BREAK_START",
  BREAK_END = "BREAK_END",
}

export enum AssistanceProblemType {
  NORMAL = "NORMAL",
  LATE = "LATE",
  LATE_JUSTIFIED = "LATE_JUSTIFIED",
  SYSTEM = "SYSTEM",
  EARLY = "EARLY",
}

export enum RequestType {
  LATE_JUSTIFICATION = "LATE_JUSTIFICATION",
  OTHER = "OTHER",
}

export enum RequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

// ─── Labels ───────────────────────────────────────────────────────────────────

export const AssistanceTypeLabel: Record<AssistanceType, string> = {
  [AssistanceType.ENTRY]: "Entrada",
  [AssistanceType.EXIT]: "Salida",
  [AssistanceType.BREAK_START]: "Inicio de Almuerzo",
  [AssistanceType.BREAK_END]: "Fin de Almuerzo",
}

export const AssistanceProblemTypeLabel: Record<AssistanceProblemType, string> = {
  [AssistanceProblemType.NORMAL]: "Normal",
  [AssistanceProblemType.LATE]: "Tardanza",
  [AssistanceProblemType.LATE_JUSTIFIED]: "Tardanza Justificada",
  [AssistanceProblemType.SYSTEM]: "Sistema",
  [AssistanceProblemType.EARLY]: "Anticipado",
}

export const RequestStatusLabel: Record<RequestStatus, string> = {
  [RequestStatus.PENDING]: "Pendiente",
  [RequestStatus.APPROVED]: "Aprobado",
  [RequestStatus.REJECTED]: "Rechazado",
}

// ─── Embedded info shapes ─────────────────────────────────────────────────────

export interface TurnTemplateInfo {
  timeFrom: string   // "HH:mm"
  timeTo: string     // "HH:mm"
  turnType: TurnType
}

export interface ContractUnityInfo {
  id: number
  unityName: string
  address?: string
  /** Decimal degrees (may be stored as microdegrees / 1e6 by backend) */
  latitude?: number
  longitude?: number
  /** Allowed GPS radius in meters. Defaults to 1000. */
  allowedRadius?: number
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface GuardAssistanceEventDto {
  id: number
  dateGuardUnityAssignmentId: number
  photoUrl?: string
  markDate: string              // "yyyy-MM-dd"
  markTime: string              // "HH:mm:ss"
  systemMark: string            // ISO datetime
  differenceInMinutes?: number  // positive = late, negative = early
  numberOrder: number
  assistanceType: AssistanceType
  assistanceProblemType: AssistanceProblemType
}

export interface GuardExtraHoursDto {
  id: number
  startDate: string             // "yyyy-MM-dd"
  startTime: string             // "HH:mm:ss"
  endDate?: string
  endTime?: string
  extraHours?: number
  /** Name of the guard whose shift is being covered */
  coveredGuardName?: string
}

export interface GuardRequestDto {
  id: number
  guardAssistanceEventId: number
  assistanceType: AssistanceType
  description: string
  requestType: RequestType
  requestStatus: RequestStatus
  createdAt: string
}

/** Full response for the guard's current attendance state */
export interface GuardCurrentShiftDto {
  guardName: string
  guardDocumentNumber?: string
  guardPhotoUrl?: string
  /** RELEASE type = "descansero": only ENTRY + EXIT, no break */
  isDescansero: boolean
  shift?: {
    dateGuardUnityAssignmentId: number
    date: string
    contractUnity?: ContractUnityInfo
    turnTemplate?: TurnTemplateInfo
  }
  /** Today's events sorted by numberOrder ASC */
  todayEvents: GuardAssistanceEventDto[]
  /** Set by centro de control when guard must stay for extra hours */
  activeExtraHours?: GuardExtraHoursDto
  /** Existing late-justification requests for today's events */
  lateRequests: GuardRequestDto[]
}

// ─── Requests ─────────────────────────────────────────────────────────────────

export interface CreateAssistanceEventRequest {
  dateGuardUnityAssignmentId: number
  assistanceType: AssistanceType
  /** Base64 encoded photo (ENTRY and EXIT only) */
  photoBase64?: string
  latitude?: number
  longitude?: number
}

export interface CreateLateJustificationRequest {
  guardAssistanceEventId: number
  description: string
}
