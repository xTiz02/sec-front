import type { IdentificationType } from "@/features/employee/api/employeeModel"

// ─── DTO ─────────────────────────────────────────────────────────────────────

export interface EventAuditDto {
  eventId: number
  /** HTTP method: POST | PUT | DELETE */
  method: "POST" | "PUT" | "DELETE"
  uri: string
  responseStatus: number
  /** Request duration in milliseconds */
  duration: number
  /** ISO datetime string */
  startTime: string

  // Employee who triggered the event
  employeeName?: string
  documentNumber?: string
  identificationType?: IdentificationType

  description?: string
  /** Raw JSON string payload (may be null) */
  json?: string
}

// ─── Params ──────────────────────────────────────────────────────────────────

export interface EventAuditParams {
  term?: string
  page?: number
  size?: number
}
