import type {
  Gender,
  IdentificationType,
  Country,
} from "@/features/employee/api/employeeModel"

// Re-export labels for convenience
export {
  GenderLabel,
  IdentificationTypeLabel,
  CountryLabel,
  Gender,
  IdentificationType,
  Country,
} from "@/features/employee/api/employeeModel"

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface ExternalGuardDto {
  id: number
  userId?: number
  firstName: string
  lastName: string
  mobilePhone?: string
  email: string
  gender?: Gender
  documentNumber: string
  identificationType?: IdentificationType
  country?: Country
  businessName?: string
  birthDate?: string
  active: boolean
  createdAt?: string
  updatedAt?: string
}

// ─── Request Types ────────────────────────────────────────────────────────────

export interface CreateExternalGuardRequest {
  firstName: string
  lastName: string
  email: string
  mobilePhone?: string
  gender?: Gender
  documentNumber: string
  identificationType?: IdentificationType
  country?: Country
  businessName?: string
  birthDate?: string
  active: boolean
}

export type UpdateExternalGuardRequest = Partial<CreateExternalGuardRequest>
