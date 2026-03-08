// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface SpecialServiceUnityDto {
  id: number
  code: string
  unityName: string
  unityDescription?: string
  address?: string
  active: boolean
  createdAt?: string
  updatedAt?: string
}

// ─── Request Types ────────────────────────────────────────────────────────────

export interface CreateSpecialServiceUnityRequest {
  code: string
  unityName: string
  unityDescription?: string
  address?: string
  active: boolean
}

export type UpdateSpecialServiceUnityRequest = Partial<CreateSpecialServiceUnityRequest>
