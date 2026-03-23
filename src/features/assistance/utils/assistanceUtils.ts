import { AssistanceType } from "../api/assistanceModel"
import type { GuardCurrentShiftDto } from "../api/assistanceModel"

// ─── Constants ────────────────────────────────────────────────────────────────

export const BREAK_TOLERANCE_MINUTES = 75 // 60 min + 15 min tolerance

// ─── View state ───────────────────────────────────────────────────────────────

export type ViewState =
  | "NO_SHIFT"
  | "AWAITING_ENTRY"
  | "IN_SHIFT"
  | "ON_BREAK"
  | "AWAITING_EXIT"
  | "SHIFT_ENDED"
  | "EXTRA_HOURS"

export function deriveViewState(data: GuardCurrentShiftDto): ViewState {
  if (!data.shift) return "NO_SHIFT"
  const events = data.todayEvents
  const entry = events.find(e => e.assistanceType === AssistanceType.ENTRY)
  const exit = events.find(e => e.assistanceType === AssistanceType.EXIT)
  const breakStart = events.find(e => e.assistanceType === AssistanceType.BREAK_START)
  const breakEnd = events.find(e => e.assistanceType === AssistanceType.BREAK_END)

  if (!entry) return "AWAITING_ENTRY"
  if (exit) return data.activeExtraHours ? "EXTRA_HOURS" : "SHIFT_ENDED"
  if (!data.isDescansero) {
    if (breakStart && !breakEnd) return "ON_BREAK"
    if (breakEnd) return "AWAITING_EXIT"
  }
  return "IN_SHIFT"
}

// ─── Time helpers ─────────────────────────────────────────────────────────────

export function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6_371_000
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** Parse "HH:mm:ss" or "HH:mm" → total seconds since midnight */
export function parseTimeStr(t: string): number {
  const [h = 0, m = 0, s = 0] = t.split(":").map(Number)
  return h * 3600 + m * 60 + s
}

export function nowSeconds(): number {
  const now = new Date()
  return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
}

/** Format total seconds as "HH:mm:ss" */
export function fmtHHMMSS(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return [h, m, sec].map(n => String(n).padStart(2, "0")).join(":")
}

/** "HH:mm:ss" → "HH:mm" */
export function fmtTime(t: string): string {
  return t.slice(0, 5)
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join("")
}
