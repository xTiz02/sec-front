import { useNavigate, useParams } from "react-router-dom"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { useGetSpecialServiceScheduleByIdQuery } from "./api/specialServiceScheduleApi"
import type { SpecialServiceDayAssignmentDto } from "./api/specialServiceScheduleModel"
import { TurnTypeLabel } from "@/features/contractSchedule/api/contractScheduleModel"
import { GuardTypeLabel } from "@/features/guard/api/guardModel"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CalendarDays, Loader2, MapPin, Moon, Sun, UserRound } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDayHeader(dateStr: string): string {
  try {
    return format(parseISO(dateStr + "T12:00:00"), "EEEE, d 'de' MMMM yyyy", { locale: es })
  } catch {
    return dateStr
  }
}

function formatDateBadge(dateStr: string): { month: string; day: string } {
  try {
    const d = parseISO(dateStr + "T12:00:00")
    return {
      month: format(d, "MMM", { locale: es }).toUpperCase(),
      day: format(d, "d"),
    }
  } catch {
    return { month: "???", day: "?" }
  }
}

function guardDisplayName(a: SpecialServiceDayAssignmentDto): string {
  const gusa = a.guardUnityScheduleAssignment
  if (!gusa) return "—"
  if (gusa.guardAssignment?.externalGuard) {
    const eg = gusa.guardAssignment.externalGuard
    return `${eg.firstName} ${eg.lastName}`.trim() || `Guardia Ext. #${eg.id}`
  }
  if (gusa.guardAssignment?.guard?.employee) {
    const emp = gusa.guardAssignment.guard.employee
    return `${emp.firstName} ${emp.lastName}`.trim()
  }
  return `Guardia #${gusa.id}`
}

function isExternal(a: SpecialServiceDayAssignmentDto): boolean {
  return !!a.guardUnityScheduleAssignment?.guardAssignment?.externalGuard
}

// ─── Component ────────────────────────────────────────────────────────────────

export const SpecialServiceScheduleDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const scheduleId = Number(id)

  const { data: schedule, isLoading } = useGetSpecialServiceScheduleByIdQuery(scheduleId)

  // Group assignments by date, sorted chronologically
  const dayGroups = (() => {
    if (!schedule) return []
    const map = new Map<string, SpecialServiceDayAssignmentDto[]>()
    for (const a of schedule.dayAssignments) {
      const list = map.get(a.date) ?? []
      map.set(a.date, [...list, a])
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
  })()

  const dateRange = (() => {
    if (!schedule?.dateFrom) return null
    if (!schedule.dateTo || schedule.dateTo === schedule.dateFrom) return schedule.dateFrom
    return `${schedule.dateFrom} → ${schedule.dateTo}`
  })()

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!schedule) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground">Servicio no encontrado.</p>
        <Button variant="outline" onClick={() => navigate("/modules/special-services/schedules")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/modules/special-services/schedules")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-muted-foreground" />
            <h1 className="text-2xl font-bold">
              {schedule.specialServiceUnity?.unityName ?? `Servicio #${schedule.id}`}
            </h1>
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
            {schedule.specialServiceUnity?.code && (
              <span className="font-mono">{schedule.specialServiceUnity.code}</span>
            )}
            {dateRange && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {dateRange}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p>{schedule.totalDays ?? dayGroups.length} día{(schedule.totalDays ?? dayGroups.length) !== 1 ? "s" : ""}</p>
          <p>{schedule.totalAssignments ?? schedule.dayAssignments.length} asignación{(schedule.totalAssignments ?? schedule.dayAssignments.length) !== 1 ? "es" : ""}</p>
        </div>
      </div>

      {/* Day cards */}
      {dayGroups.length === 0 ? (
        <Card>
          <CardContent className="flex h-32 items-center justify-center">
            <p className="text-muted-foreground text-sm">Sin asignaciones registradas.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {dayGroups.map(([date, assignments]) => {
            const badge = formatDateBadge(date)
            return (
              <Card key={date} className="overflow-hidden">
                <CardHeader className="pb-3 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <div className="h-10 w-10 rounded-lg bg-primary text-white flex flex-col items-center justify-center font-bold shrink-0">
                      <span className="text-[10px] leading-none uppercase">{badge.month}</span>
                      <span className="text-lg leading-none">{badge.day}</span>
                    </div>
                    <div>
                      <p className="font-bold capitalize">{formatDayHeader(date)}</p>
                      <p className="text-xs font-normal text-muted-foreground">
                        {assignments.length} guardia{assignments.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-xs uppercase text-muted-foreground border-b border-slate-100 dark:border-slate-800">
                        <th className="pb-2 font-semibold">Guardia</th>
                        <th className="pb-2 font-semibold w-24">Entrada</th>
                        <th className="pb-2 font-semibold w-24">Salida</th>
                        <th className="pb-2 font-semibold w-28">Rol</th>
                        <th className="pb-2 font-semibold w-24">Turno</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {assignments.map(a => {
                        const template = a.turnAndHour?.turnTemplate
                        const turnType = template?.turnType
                        const isDay = turnType === "DAY"
                        const isNight = turnType === "NIGHT"
                        const guardType = a.guardUnityScheduleAssignment?.guardType
                        const external = isExternal(a)

                        return (
                          <tr key={a.id}>
                            <td className="py-3 pr-3">
                              <div className="flex items-center gap-2">
                                <UserRound
                                  className={cn(
                                    "h-4 w-4 shrink-0",
                                    external
                                      ? "text-amber-500"
                                      : "text-muted-foreground",
                                  )}
                                />
                                <span className="font-medium">{guardDisplayName(a)}</span>
                                {external && (
                                  <Badge variant="outline" className="text-[10px] px-1 py-0 text-amber-600 border-amber-300">
                                    Ext
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="py-3 pr-3 text-muted-foreground">
                              {template?.timeFrom ?? "—"}
                            </td>
                            <td className="py-3 pr-3 text-muted-foreground">
                              {template?.timeTo ?? "—"}
                            </td>
                            <td className="py-3 pr-3 text-muted-foreground">
                              {guardType ? (GuardTypeLabel as any)[guardType] ?? guardType : "—"}
                            </td>
                            <td className="py-3">
                              {turnType ? (
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold uppercase",
                                    isDay
                                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                      : isNight
                                      ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                      : "bg-slate-100 text-slate-500",
                                  )}
                                >
                                  {isDay ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
                                  {(TurnTypeLabel as any)[turnType] ?? turnType}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
