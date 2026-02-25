// ─── Enums ────────────────────────────────────────────────────────────────────

export enum TurnType {
  DAY = "DAY",
  NIGHT = "NIGHT",
}

export const TurnTypeLabel: Record<TurnType, string> = {
  [TurnType.DAY]: "Diurno",
  [TurnType.NIGHT]: "Nocturno",
}

export enum DayOfWeek {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

export const DayOfWeekLabel: Record<DayOfWeek, string> = {
  [DayOfWeek.MONDAY]: "Lunes",
  [DayOfWeek.TUESDAY]: "Martes",
  [DayOfWeek.WEDNESDAY]: "Miércoles",
  [DayOfWeek.THURSDAY]: "Jueves",
  [DayOfWeek.FRIDAY]: "Viernes",
  [DayOfWeek.SATURDAY]: "Sábado",
  [DayOfWeek.SUNDAY]: "Domingo",
}

export const DayOfWeekShortLabel: Record<DayOfWeek, string> = {
  [DayOfWeek.MONDAY]: "LUN",
  [DayOfWeek.TUESDAY]: "MAR",
  [DayOfWeek.WEDNESDAY]: "MIÉ",
  [DayOfWeek.THURSDAY]: "JUE",
  [DayOfWeek.FRIDAY]: "VIE",
  [DayOfWeek.SATURDAY]: "SÁB",
  [DayOfWeek.SUNDAY]: "DOM",
}

// ─── Turn Template ────────────────────────────────────────────────────────────

export interface TurnTemplateDto {
  id: number
  name: string
  numGuards: number
  timeFrom: string // HH:mm format
  timeTo: string // HH:mm format
  turnType: TurnType
}

export interface CreateTurnTemplateRequest {
  name: string
  numGuards: number
  timeFrom: string
  timeTo: string
  turnType: TurnType
}

export type UpdateTurnTemplateRequest = Partial<CreateTurnTemplateRequest>

// ─── Client Contract ──────────────────────────────────────────────────────────

export interface ClientContractDto {
  id: number
  clientId: number
  clientName?: string
  clientCode?: string
  name: string
  description?: string
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateClientContractRequest {
  clientId: number
  name: string
  description?: string
  active: boolean
}

export type UpdateClientContractRequest = Partial<CreateClientContractRequest>

// ─── Contract Unity (many-to-many relation) ───────────────────────────────────

export interface ContractUnityDto {
  id: number
  clientContractId: number
  clientContractName?: string
  unityId?: number
  unityName?: string
  unityCode?: string
  clientName?: string
}

export interface CreateContractUnityRequest {
  clientContractId: number
  unityId: number
}

// ─── Contract Schedule Unit Template ──────────────────────────────────────────

export interface ContractScheduleUnitTemplateDto {
  id: number
  contractUnityId: number
  dayOfWeek: DayOfWeek
  numOfGuards: number
  numTurnDay: number
  numTurnNight: number
}

export interface CreateContractScheduleUnitTemplateRequest {
  contractUnityId: number
  dayOfWeek: DayOfWeek
  numOfGuards: number
  numTurnDay: number
  numTurnNight: number
}

export type UpdateContractScheduleUnitTemplateRequest =
  Partial<CreateContractScheduleUnitTemplateRequest>

// ─── Turn and Hour (relation) ─────────────────────────────────────────────────

export interface TurnAndHourDto {
  id: number
  contractScheduleUnitTemplateId: number
  turnTemplateId: number
  turnTemplate?: TurnTemplateDto
}

export interface CreateTurnAndHourRequest {
  contractScheduleUnitTemplateId: number
  turnTemplateId: number
}

// ─── Weekly Schedule Summary ──────────────────────────────────────────────────

export interface WeeklyScheduleSummaryDto {
  contractUnityId?: number // Only if already saved
  unityId: number
  unityName: string
  unityCode?: string
  schedules: DayScheduleSummaryDto[]
}

export interface DayScheduleSummaryDto {
  dayOfWeek: DayOfWeek
  scheduleId?: number
  numOfGuards: number
  numTurnDay: number
  numTurnNight: number
  turns: TurnTemplateDto[]
}

export interface UnitSchedule {
  unityId: number           
  unityName: string
  unityCode?: string
  contractUnityId?: number  
  days: DaySchedule[]
}

export interface DaySchedule {
  dayOfWeek: DayOfWeek  // 0-6
  turns: TurnTemplateDto[]  // Array de turnos asignados
}

// ─── Bulk Assignment Request ──────────────────────────────────────────────────

export interface AssignTurnsToWeekRequest {
  contractId: number
  units: UnitWeeklySchedule[]
}

export interface UnitWeeklySchedule {
  contractUnityId?: number // Only if updating existing
  unityId: number
  days: DayTurnAssignment[]
}

export interface DayTurnAssignment {
  dayOfWeek: DayOfWeek
  turnTemplateIds: number[]
}