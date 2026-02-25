
// ─── Client ───────────────────────────────────────────────────────────────────

export interface ClientDto {
  id: number
  active: boolean
  code: string
  name: string
  description?: string
  direction?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateClientRequest {
  code: string
  name: string
  description?: string
  direction?: string
  active: boolean
}

export type UpdateClientRequest = Partial<CreateClientRequest>