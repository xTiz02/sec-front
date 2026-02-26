import type { EmployeeDto } from "@/features/employee/api/employeeModel"

// ─── Guard ───────────────────────────────────────────────────────────────────

export interface GuardDto {
  id: number
  employeeId: number
  employee?: EmployeeDto
  licenseNumber: string
  photoUrl?: string
}

export interface CreateGuardRequest {
  employeeId: number
  licenseNumber: string
  photoUrl?: string
}

export type UpdateGuardRequest = Partial<CreateGuardRequest>
