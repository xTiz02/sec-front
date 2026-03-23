import { useState, useCallback, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Clock, RefreshCw, ShieldCheck } from "lucide-react"
import {
  useGetCurrentShiftQuery,
  useMarkAttendanceMutation,
  useSubmitLateJustificationMutation,
} from "./api/assistanceApi"
import { AssistanceType, AssistanceProblemType } from "./api/assistanceModel"
import type { GuardAssistanceEventDto } from "./api/assistanceModel"
import {
  BREAK_TOLERANCE_MINUTES,
  deriveViewState,
  nowSeconds,
  parseTimeStr,
  initials,
} from "./utils/assistanceUtils"
import type { ViewState } from "./utils/assistanceUtils"
import { useGps } from "./hooks/useGps"
import { useTick } from "./hooks/useTick"
import { GpsStatusBar } from "./components/GpsStatusBar"
import { LateJustifyDialog } from "./components/LateJustifyDialog"
import { CameraDialog } from "./components/CameraDialog"
import { AwaitingEntryView } from "./views/AwaitingEntryView"
import { ActiveShiftView } from "./views/ActiveShiftView"
import { ExtraHoursView } from "./views/ExtraHoursView"
import { ShiftEndedView } from "./views/ShiftEndedView"

export function GuardAssistancePage() {
  const tick = useTick()

  // ── API ──────────────────────────────────────────────────────────────────────
  const { data, isLoading, isFetching, refetch } = useGetCurrentShiftQuery(undefined, {
    pollingInterval: 180_000, // 30 sec
  })
  const [markAttendance, { isLoading: isMarking }] = useMarkAttendanceMutation()
  const [submitLateJustification, { isLoading: isJustifying }] =
    useSubmitLateJustificationMutation()

  // ── Camera state ─────────────────────────────────────────────────────────────
  const [pendingMarkType, setPendingMarkType] = useState<AssistanceType | null>(null)

  // ── Justify dialog state ──────────────────────────────────────────────────────
  const [justifyEvent, setJustifyEvent] = useState<GuardAssistanceEventDto | null>(null)

  // ── GPS ──────────────────────────────────────────────────────────────────────
  const unity = data?.shift?.contractUnity
  const { coords, distanceMeters, isInRange, error: gpsError } = useGps(
    unity?.latitude,
    unity?.longitude,
    unity?.allowedRadius ?? 1000,
  )

  // ── Derived state ─────────────────────────────────────────────────────────────
  const viewState = useMemo<ViewState>(() => {
    if (!data) return "AWAITING_ENTRY"
    return deriveViewState(data)
  }, [data])

  const events = data?.todayEvents ?? []
  const entryEvent = events.find(e => e.assistanceType === AssistanceType.ENTRY)
  const exitEvent = events.find(e => e.assistanceType === AssistanceType.EXIT)
  const breakStartEvent = events.find(e => e.assistanceType === AssistanceType.BREAK_START)
  const breakEndEvent = events.find(e => e.assistanceType === AssistanceType.BREAK_END)
  const lateEvents = events.filter(
    e =>
      e.assistanceProblemType === AssistanceProblemType.LATE ||
      e.assistanceProblemType === AssistanceProblemType.LATE_JUSTIFIED,
  )
  const lateRequests = data?.lateRequests ?? []
  const turnTemplate = data?.shift?.turnTemplate

  // Shift elapsed seconds (entry mark → now)
  const shiftElapsedSeconds = useMemo(() => {
    if (!entryEvent) return 0
    return Math.max(0, nowSeconds() - parseTimeStr(entryEvent.markTime))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryEvent, tick])

  // Break remaining seconds (75 min tolerance − elapsed since break start)
  const breakRemainingSeconds = useMemo(() => {
    if (!breakStartEvent || breakEndEvent) return 0
    const elapsed = Math.max(0, nowSeconds() - parseTimeStr(breakStartEvent.markTime))
    return Math.max(0, BREAK_TOLERANCE_MINUTES * 60 - elapsed)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breakStartEvent, breakEndEvent, tick])

  const breakIsOverdue = useMemo(() => {
    if (!breakStartEvent || breakEndEvent) return false
    return nowSeconds() - parseTimeStr(breakStartEvent.markTime) > BREAK_TOLERANCE_MINUTES * 60
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breakStartEvent, breakEndEvent, tick])

  // Extra hours elapsed (from startTime while endTime is not yet set)
  const extraHoursElapsedSeconds = useMemo(() => {
    const extra = data?.activeExtraHours
    if (!extra || extra.endTime) return 0
    return Math.max(0, nowSeconds() - parseTimeStr(extra.startTime))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.activeExtraHours, tick])

  // ── Camera handlers ───────────────────────────────────────────────────────────

  const triggerMark = useCallback(
    (type: AssistanceType) => {
      if (type === AssistanceType.ENTRY || type === AssistanceType.EXIT) {
        setPendingMarkType(type)
      } else {
        void doMark(type)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [coords, data],
  )

  const handleCameraCapture = useCallback(
    async (base64: string) => {
      if (!pendingMarkType) return
      await doMark(pendingMarkType, base64)
      setPendingMarkType(null)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pendingMarkType, coords, data],
  )

  const handleCameraCancel = useCallback(() => {
    setPendingMarkType(null)
  }, [])

  async function doMark(type: AssistanceType, photoBase64?: string) {
    if (!data?.shift) return
    await markAttendance({
      dateGuardUnityAssignmentId: data.shift.dateGuardUnityAssignmentId,
      assistanceType: type,
      photoBase64,
      latitude: coords?.lat,
      longitude: coords?.lon,
    }).unwrap()
  }

  // ── Justify handler ───────────────────────────────────────────────────────────

  const handleSubmitJustification = async (eventId: number, description: string) => {
    await submitLateJustification({ guardAssistanceEventId: eventId, description }).unwrap()
  }

  // ── Mark button disabled logic ────────────────────────────────────────────────
  const canMark = isInRange !== false

  // Exit is only allowed once the shift end datetime has passed.
  // Uses the assignment date (not today) so yesterday's incomplete shifts work correctly.
  // Night shifts that cross midnight: timeTo < timeFrom → end is on the next calendar day.
  const shiftEndReached = useMemo(() => {
    const shiftDate = data?.shift?.date
    if (!turnTemplate?.timeTo || !shiftDate) return true

    const [y, m, d] = shiftDate.split("-").map(Number)
    const [eh, em, es = 0] = turnTemplate.timeTo.split(":").map(Number)
    const endDate = new Date(y, m - 1, d, eh, em, es)

    const crossesMidnight =
      turnTemplate.timeFrom != null &&
      parseTimeStr(turnTemplate.timeTo) < parseTimeStr(turnTemplate.timeFrom)
    if (crossesMidnight) endDate.setDate(endDate.getDate() + 1)

    return new Date() >= endDate
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnTemplate?.timeTo, turnTemplate?.timeFrom, data?.shift?.date, tick])

  const canMarkExit = canMark && shiftEndReached

  // ── Header labels ─────────────────────────────────────────────────────────────
  const guardName = data?.guardName ?? "—"
  const guardDoc = data?.guardDocumentNumber

  const statusLabel: Record<ViewState, string> = {
    NO_SHIFT: "Sin Turno",
    AWAITING_ENTRY: "Fuera de Turno",
    IN_SHIFT: "En Turno",
    ON_BREAK: "En Almuerzo",
    AWAITING_EXIT: "En Turno",
    SHIFT_ENDED: "Turno Finalizado",
    EXTRA_HOURS: "Horas Extra",
  }

  const statusColor: Record<ViewState, string> = {
    NO_SHIFT: "bg-slate-500",
    AWAITING_ENTRY: "bg-slate-500",
    IN_SHIFT: "bg-emerald-500",
    ON_BREAK: "bg-amber-500",
    AWAITING_EXIT: "bg-emerald-500",
    SHIFT_ENDED: "bg-slate-400",
    EXTRA_HOURS: "bg-orange-500",
  }

  // ─────────────────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white gap-4">
        <ShieldCheck className="h-12 w-12 text-blue-400 animate-pulse" />
        <p className="text-sm text-slate-400">Cargando tu turno...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
      {/* Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg">
        <div className="flex items-center justify-between p-4 max-w-lg mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
              {initials(guardName)}
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">{guardName}</p>
              {guardDoc && (
                <p className="text-[10px] text-slate-400">
                  Doc: {guardDoc}
                  {unity && ` · ${unity.unityName}`}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="p-1.5 rounded-full text-slate-400 hover:text-white transition-colors"
              title="Actualizar"
            >
              <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            </button>
            <span
              className={cn(
                "text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full",
                statusColor[viewState],
              )}
            >
              {statusLabel[viewState]}
            </span>
          </div>
        </div>
      </header>

      {/* GPS bar */}
      {unity?.latitude != null && (
        <GpsStatusBar
          distanceMeters={distanceMeters}
          isInRange={isInRange}
          error={gpsError}
          allowedRadius={unity.allowedRadius ?? 1000}
        />
      )}

      {/* Page content */}
      <main className="flex-1 p-4 space-y-4 max-w-lg mx-auto w-full pb-8">
        {viewState === "NO_SHIFT" && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShieldCheck className="h-14 w-14 text-muted-foreground/30 mb-4" />
            <h2 className="text-lg font-bold mb-1">Sin turno asignado hoy</h2>
            <p className="text-sm text-muted-foreground">
              No tienes un turno programado para el día de hoy.
            </p>
          </div>
        )}

        {viewState === "AWAITING_ENTRY" && (
          <AwaitingEntryView
            turnTemplate={turnTemplate}
            unity={unity}
            isInRange={isInRange}
            distanceMeters={distanceMeters}
            canMark={canMark}
            isMarking={isMarking}
            onMark={triggerMark}
          />
        )}

        {(viewState === "IN_SHIFT" ||
          viewState === "ON_BREAK" ||
          viewState === "AWAITING_EXIT") && (
          <ActiveShiftView
            viewState={viewState}
            isDescansero={data?.isDescansero ?? false}
            turnTemplate={turnTemplate}
            entryEvent={entryEvent}
            breakStartEvent={breakStartEvent}
            breakEndEvent={breakEndEvent}
            shiftElapsedSeconds={shiftElapsedSeconds}
            breakRemainingSeconds={breakRemainingSeconds}
            breakIsOverdue={breakIsOverdue}
            lateEvents={lateEvents}
            lateRequests={lateRequests}
            canMark={canMark}
            canMarkExit={canMarkExit}
            isMarking={isMarking}
            onMark={triggerMark}
            onJustify={setJustifyEvent}
          />
        )}

        {viewState === "EXTRA_HOURS" && (
          <ExtraHoursView
            activeExtraHours={data?.activeExtraHours}
            turnTemplate={turnTemplate}
            extraHoursElapsedSeconds={extraHoursElapsedSeconds}
            lateEvents={lateEvents}
            lateRequests={lateRequests}
            onJustify={setJustifyEvent}
          />
        )}

        {viewState === "SHIFT_ENDED" && (
          <ShiftEndedView
            shiftDate={data?.shift?.date}
            turnTemplate={turnTemplate}
            unity={unity}
            entryEvent={entryEvent}
            exitEvent={exitEvent}
            breakStartEvent={breakStartEvent}
            breakEndEvent={breakEndEvent}
            lateEvents={lateEvents}
            lateRequests={lateRequests}
            onJustify={setJustifyEvent}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-border p-4 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase font-bold">
              Estado del Sistema
            </span>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "size-2 rounded-full",
                  gpsError ? "bg-destructive" : "bg-emerald-500",
                )}
              />
              <span className="text-sm font-medium text-foreground">
                {gpsError ? "GPS sin señal" : "GPS Conectado"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {new Date().toLocaleTimeString("es-PE", {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </footer>

      {/* Dialogs */}
      <CameraDialog
        open={pendingMarkType !== null}
        title={pendingMarkType === AssistanceType.ENTRY ? "Marcar Entrada" : "Marcar Salida"}
        isConfirming={isMarking}
        onCapture={handleCameraCapture}
        onCancel={handleCameraCancel}
      />
      <LateJustifyDialog
        event={justifyEvent}
        onClose={() => setJustifyEvent(null)}
        onSubmit={handleSubmitJustification}
        isSubmitting={isJustifying}
      />
    </div>
  )
}
