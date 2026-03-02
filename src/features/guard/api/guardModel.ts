import type { EmployeeDto } from "@/features/employee/api/employeeModel"

// ─── GuardType ────────────────────────────────────────────────────────────────

export enum GuardType {
  HOLDER = "HOLDER",
  RELEASE = "RELEASE",
  ROTATING = "ROTATING",
  BASE_AGENT = "BASE_AGENT",
}

export const GuardTypeLabel: Record<GuardType, string> = {
  [GuardType.HOLDER]: "Titular",
  [GuardType.RELEASE]: "Relevo",
  [GuardType.ROTATING]: "Rotativo",
  [GuardType.BASE_AGENT]: "Agente Base",
}

// ─── Guard ───────────────────────────────────────────────────────────────────

export interface GuardDto {
  id: number
  employeeId: number
  employee?: EmployeeDto
  licenseNumber: string
  guardType: GuardType
  photoUrl?: string
}

export interface CreateGuardRequest {
  employeeId: number
  licenseNumber: string
  guardType: GuardType
  photoUrl?: string
}

export type UpdateGuardRequest = Partial<CreateGuardRequest>
