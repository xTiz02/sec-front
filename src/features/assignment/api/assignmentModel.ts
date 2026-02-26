import type { EmployeeSummaryDto } from "@/features/employee/api/employeeModel"
import type { UnityDto } from "@/features/unity/api/unityModel"

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum ZoneType {
  NORTH = "NORTH",
  SOUTH = "SOUTH",
  EAST = "EAST",
  WEST = "WEST",
  CENTRAL = "CENTRAL",
}

export const ZoneTypeLabel: Record<ZoneType, string> = {
  [ZoneType.NORTH]: "Zona Norte",
  [ZoneType.SOUTH]: "Zona Sur",
  [ZoneType.EAST]: "Zona Este",
  [ZoneType.WEST]: "Zona Oeste",
  [ZoneType.CENTRAL]: "Centro",
}

export enum Month {
  JANUARY = "JANUARY",
  FEBRUARY = "FEBRUARY",
  MARCH = "MARCH",
  APRIL = "APRIL",
  MAY = "MAY",
  JUNE = "JUNE",
  JULY = "JULY",
  AUGUST = "AUGUST",
  SEPTEMBER = "SEPTEMBER",
  OCTOBER = "OCTOBER",
  NOVEMBER = "NOVEMBER",
  DECEMBER = "DECEMBER",
}

export const MonthLabel: Record<Month, string> = {
  [Month.JANUARY]: "Enero",
  [Month.FEBRUARY]: "Febrero",
  [Month.MARCH]: "Marzo",
  [Month.APRIL]: "Abril",
  [Month.MAY]: "Mayo",
  [Month.JUNE]: "Junio",
  [Month.JULY]: "Julio",
  [Month.AUGUST]: "Agosto",
  [Month.SEPTEMBER]: "Septiembre",
  [Month.OCTOBER]: "Octubre",
  [Month.NOVEMBER]: "Noviembre",
  [Month.DECEMBER]: "Diciembre",
}

// ─── Schedule Monthly ─────────────────────────────────────────────────────────

export interface ScheduleMonthlyDto {
  id: number
  name: string
  month: Month
  year: number
  description?: string
  createdAt?: string
  updatedAt?: string
}

// ─── Employee Assignment Monthly ──────────────────────────────────────────────

export interface EmployeeAssignmentMonthlyDto {
  id: number
  employeeId: number
  employee?: EmployeeSummaryDto
  scheduleMonthlyId?: number
  scheduleMonthly?: ScheduleMonthlyDto
  zoneType: ZoneType
  month: Month
  year: number
  createdAt?: string
  unitAssignments?: EmployeeUnitAssignmentDto[]
}

// ─── Employee Unit Assignment ─────────────────────────────────────────────────

export interface EmployeeUnitAssignmentDto {
  id: number
  employeeAssignmentMonthlyId: number
  unityId: number
  unity?: UnityDto
  zoneType: ZoneType
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface UnitAssignmentRequest {
  unityId: number
  zoneType: ZoneType
}

export interface CreateEmployeeAssignmentRequest {
  employeeId: number
  scheduleMonthlyId?: number
  zoneType: ZoneType
  month: Month
  year: number
  unitAssignments: UnitAssignmentRequest[]
}

export interface UpdateEmployeeAssignmentRequest {
  employeeId?: number
  scheduleMonthlyId?: number
  zoneType?: ZoneType
  month?: Month
  year?: number
  unitAssignments?: UnitAssignmentRequest[]
}
