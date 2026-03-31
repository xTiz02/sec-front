import { useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Loader2,
  Pencil,
  Users,
} from "lucide-react"
import {
  useGetScheduleMonthlyByIdQuery,
  useGetGuardUnitySchedulesByScheduleMonthlyQuery,
} from "./api/monthlySchedulerApi"
import { MonthLabel } from "@/features/assignment/api/assignmentModel"
import type { GuardUnityScheduleAssignmentDto } from "./api/monthlySchedulerModel"
import { INDEX_TO_MONTH, MONTH_INDEX } from "./api/monthlySchedulerModel"
import type { Month } from "./api/monthlySchedulerModel"

/** Backend may return month as a number (enum ordinal/value). Convert to enum string. */
function toMonthStr(month: Month | string | number): Month {
  if (typeof month === "string" && month in MONTH_INDEX) return month as Month
  // 1-indexed (Java Month.getValue()): JANUARY=1 … DECEMBER=12
  const n = Number(month)
  if (n >= 1 && n <= 12) return INDEX_TO_MONTH[n - 1]
  // 0-indexed fallback (Java enum ordinal)
  if (n >= 0 && n <= 11) return INDEX_TO_MONTH[n]
  return month as Month
}
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// ─── Group assignments by client → unity ──────────────────────────────────────

interface UnityGroup {
  contractUnityId: number
  unityName: string
  unityCode?: string
  clientContractId: number
  guardCount: number
  assignments: GuardUnityScheduleAssignmentDto[]
}

interface ClientGroup {
  clientContractId: number
  clientContractName: string
  clientName?: string
  unities: UnityGroup[]
}

function groupByClient(assignments: GuardUnityScheduleAssignmentDto[]): ClientGroup[] {
  const clientMap = new Map<number, ClientGroup>()

  for (const a of assignments) {
    const cu = a.contractUnity
    if (!cu) continue

    if (!clientMap.has(cu.clientContractId)) {
      clientMap.set(cu.clientContractId, {
        clientContractId: cu.clientContractId,
        clientContractName: cu.clientContractName ?? `Contrato #${cu.clientContractId}`,
        clientName: cu.clientName,
        unities: [],
      })
    }

    const client = clientMap.get(cu.clientContractId)!
    let unity = client.unities.find(u => u.contractUnityId === cu.id)
    if (!unity) {
      unity = {
        contractUnityId: cu.id,
        unityName: cu.unityName ?? `Unidad #${cu.id}`,
        unityCode: cu.unityCode,
        clientContractId: cu.clientContractId,
        guardCount: 0,
        assignments: [],
      }
      client.unities.push(unity)
    }
    unity.assignments.push(a)
    unity.guardCount++
  }

  return Array.from(clientMap.values())
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ScheduleMonthlyDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const scheduleId = Number(id)

  const { data: schedule, isLoading: loadingSchedule } = useGetScheduleMonthlyByIdQuery(scheduleId)
  const { data: assignments = [], isLoading: loadingAssignments } =
    useGetGuardUnitySchedulesByScheduleMonthlyQuery(scheduleId)

  const clientGroups = useMemo(() => groupByClient(assignments), [assignments])

  const isLoadingAll = loadingAssignments

  if (loadingSchedule) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!schedule) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground">Programación no encontrada</p>
        <Button
          variant="outline"
          onClick={() => navigate("/modules/scheduling/monthly-scheduler")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>
    )
  }

  const scheduleMonth = toMonthStr(schedule.month)

  const editUrl = (contractUnityId: number, contractId: number) =>
    `/modules/scheduling/monthly-scheduler/new?contractId=${contractId}&contractUnityId=${contractUnityId}&month=${scheduleMonth}&year=${schedule.year}`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/modules/scheduling/monthly-scheduler")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-6 w-6 text-muted-foreground" />
            <h1 className="text-2xl font-bold">{schedule.name}</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {MonthLabel[scheduleMonth]} {schedule.year}
            {schedule.description && ` · ${schedule.description}`}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded border border-border">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {clientGroups.length} cliente{clientGroups.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded border border-border">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {assignments.length} guardia{assignments.length !== 1 ? "s" : ""} asignado
            {assignments.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Loading assignments */}
      {loadingAssignments && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando asignaciones...
        </div>
      )}

      {/* Empty state */}
      {!isLoadingAll && clientGroups.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed rounded-xl text-center">
          <CalendarDays className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground font-medium">
            No hay unidades programadas en esta planificación
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Usa el planificador para agregar guardias a las unidades.
          </p>
        </div>
      )}

      {/* Client groups */}
      {clientGroups.map(client => (
        <Card key={client.clientContractId}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-500" />
              <span>{client.clientName ?? client.clientContractName}</span>
              <span className="text-muted-foreground font-normal text-sm">
                · {client.clientContractName}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {client.unities.map(unity => (
              <div
                key={unity.contractUnityId}
                className="flex items-center justify-between gap-4 p-3 bg-muted/50 rounded-lg border border-border"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{unity.unityName}</span>
                    {unity.unityCode && (
                      <Badge variant="outline" className="text-[10px]">
                        {unity.unityCode}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {unity.guardCount} guardia{unity.guardCount !== 1 ? "s" : ""} asignado
                    {unity.guardCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(editUrl(unity.contractUnityId, unity.clientContractId))}
                >
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  Editar programación
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
