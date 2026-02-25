
// ─── Unity ────────────────────────────────────────────────────────────────────

export interface UnityDto {
  id: number
  clientId?: number
  clientName?: string
  active: boolean
  code: string
  name: string
  description?: string
  direction?: string
  latitude?: number
  longitude?: number
  rangeCoverage?: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateUnityRequest {
  clientId: number
  code: string
  name: string
  description?: string
  direction?: string
  latitude?: number
  longitude?: number
  rangeCoverage?: number
  active: boolean
}

export type UpdateUnityRequest = Partial<CreateUnityRequest>