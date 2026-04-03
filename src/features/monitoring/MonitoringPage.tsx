import { useCallback, useMemo, useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Activity,
  AlertTriangle,
  MapPin,
  ShieldCheck,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { MonitoringMap } from "./components/MonitoringMap"
import { UnitShiftModal } from "./components/UnitShiftModal"
import { AssistanceFeed } from "./components/AssistanceFeed"
import { useGetUnitMonitoringStatusQuery, useGetLiveAssistancesQuery } from "./api/monitoringApi"
import { useMonitoringWebSocket } from "./hooks/useMonitoringWebSocket"
import type { UnitMonitoringStatusDto, LiveAssistanceEventDto } from "./api/monitoringModel"

// ─── Today date string ────────────────────────────────────────────────────────

function todayStr() {
  return format(new Date(), "yyyy-MM-dd")
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MonitoringPage() {
  const today = todayStr()
  const [selectedUnit, setSelectedUnit] = useState<UnitMonitoringStatusDto | null>(null)
  const [liveEvents, setLiveEvents] = useState<LiveAssistanceEventDto[]>([])
  const [wsConnected, setWsConnected] = useState(false)

  // ── REST data ──────────────────────────────────────────────────────────────
  const {
    data: units = [],
    isFetching: isFetchingUnits,
    refetch: refetchUnits,
  } = useGetUnitMonitoringStatusQuery({ date: today })

  const { data: initialEvents = [], isLoading: isLoadingEvents } = useGetLiveAssistancesQuery(
    { date: today },
    {
      // Populate live feed on first load
      selectFromResult: result => ({
        ...result,
        data: result.data ?? [],
      }),
    },
  )

  // Merge initial REST events with live WebSocket events (WS events prepended)
  const allEvents = useMemo(() => {
    const ids = new Set(liveEvents.map(e => e.id))
    const dedupedInitial = initialEvents.filter(e => !ids.has(e.id))
    return [...liveEvents, ...dedupedInitial]
  }, [liveEvents, initialEvents])

  // ── WebSocket ──────────────────────────────────────────────────────────────
  const handleWsEvent = useCallback((event: LiveAssistanceEventDto) => {
    setWsConnected(true)
    setLiveEvents(prev => [event, ...prev].slice(0, 200)) // keep last 200
  }, [])

  const handleRefreshFlags = useCallback(() => {
    refetchUnits()
  }, [refetchUnits])

  useMonitoringWebSocket(handleWsEvent, handleRefreshFlags)

  // ── Aggregated stats ───────────────────────────────────────────────────────
  const totalShifts = units.reduce((s, u) => s + u.totalShifts, 0)
  const totalArrived = units.reduce((s, u) => s + u.arrivedGuards, 0)
  const totalAbsent = units.reduce((s, u) => s + u.absentGuards, 0)
  const unitsWithIssues = units.filter(u => u.absentGuards > 0).length

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Monitor de Asistencia en Tiempo Real
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Estado operacional de la red de seguridad ·{" "}
            {format(new Date(), "EEEE d 'de' MMMM yyyy", { locale: es })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {wsConnected ? (
            <Badge variant="outline" className="text-[10px] gap-1.5 border-green-500 text-green-600">
              <Wifi className="h-3 w-3" />
              WebSocket conectado
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] gap-1.5 text-muted-foreground">
              <WifiOff className="h-3 w-3" />
              Conectando...
            </Badge>
          )}
        </div>
      </div>

      {/* ── Stats cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="h-4 w-4 text-primary" />}
          label="Guardias programados"
          value={String(totalShifts)}
          sub={`${totalArrived} han marcado entrada`}
          accent="border-primary"
        />
        <StatCard
          icon={<ShieldCheck className="h-4 w-4 text-green-600" />}
          label="En Puesto"
          value={String(totalArrived)}
          sub={totalShifts > 0 ? `${Math.round((totalArrived / totalShifts) * 100)}% cobertura` : "—"}
          accent="border-green-500"
        />
        <StatCard
          icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
          label="Faltas"
          value={String(totalAbsent)}
          sub={`${unitsWithIssues} unidad${unitsWithIssues !== 1 ? "es" : ""} con problema`}
          accent="border-destructive"
        />
        <StatCard
          icon={<Activity className="h-4 w-4 text-blue-500" />}
          label="Marcaciones Hoy"
          value={String(allEvents.length)}
          sub="Actualizando en tiempo real"
          accent="border-blue-400"
        />
      </div>

      {/* ── Map ───────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm relative">
        <div className="absolute top-3 left-3 z-10 bg-background/90 backdrop-blur px-3 py-1.5 rounded-lg border border-border shadow-sm flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] font-semibold">
            {isFetchingUnits ? "Actualizando..." : `${units.length} unidades en mapa`}
          </span>
        </div>

        <div style={{ height: "450px" }}>
          {units.length > 0 ? (
            <MonitoringMap units={units} onUnitClick={setSelectedUnit} />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted/20">
              <div className="text-center space-y-2">
                <MapPin className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                <p className="text-sm text-muted-foreground">
                  {isFetchingUnits ? "Cargando unidades..." : "Sin unidades con ubicación configurada"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Map legend */}
        <div className="px-5 py-3 border-t border-border bg-muted/30 flex flex-wrap gap-5 text-[10px] font-medium text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: "#007a22" }} />
            Cobertura completa
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: "#000666" }} />
            En progreso
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: "#ba1a1a" }} />
            Con ausencias
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-muted-foreground/40" />
            Sin marcaciones
          </div>
        </div>
      </div>

      {/* ── Live assistance feed ───────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-bold text-sm">Marcaciones en Tiempo Real</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Entradas, salidas y breaks según van llegando
            </p>
          </div>
          <Badge variant="secondary" className="text-[10px]">
            {allEvents.length} marcaciones
          </Badge>
        </div>
        <AssistanceFeed events={allEvents} isLoading={isLoadingEvents} />
      </div>

      {/* ── Unit shift modal ───────────────────────────────────────────────── */}
      <UnitShiftModal
        unit={selectedUnit}
        date={today}
        onClose={() => setSelectedUnit(null)}
      />
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  accent: string
}) {
  return (
    <div className={`bg-card rounded-xl border-l-4 ${accent} border border-border p-5 shadow-sm`}>
      <div className="flex justify-between items-start mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        {icon}
      </div>
      <p className="text-3xl font-black">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>
    </div>
  )
}
