import { CalendarDays, CheckCircle, Clock, MapPin } from "lucide-react"
import type {
  ContractUnityInfo,
  GuardAssistanceEventDto,
  GuardRequestDto,
  TurnTemplateInfo,
} from "../api/assistanceModel"
import { fmtHHMMSS, fmtTime, parseTimeStr } from "../utils/assistanceUtils"
import { LatenessAlert } from "../components/LatenessAlert"

function fmtDate(dateStr: string): string {
  // "YYYY-MM-DD" → "Lunes, 20 de marzo de 2026"
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

interface ShiftEndedViewProps {
  shiftDate?: string
  turnTemplate?: TurnTemplateInfo
  unity?: ContractUnityInfo
  entryEvent?: GuardAssistanceEventDto
  exitEvent?: GuardAssistanceEventDto
  breakStartEvent?: GuardAssistanceEventDto
  breakEndEvent?: GuardAssistanceEventDto
  lateEvents: GuardAssistanceEventDto[]
  lateRequests: GuardRequestDto[]
  onJustify: (event: GuardAssistanceEventDto) => void
}

export function ShiftEndedView({
  shiftDate,
  turnTemplate,
  unity,
  entryEvent,
  exitEvent,
  breakStartEvent,
  breakEndEvent,
  lateEvents,
  lateRequests,
  onJustify,
}: ShiftEndedViewProps) {
  const totalWorkedSeconds = exitEvent
    ? parseTimeStr(exitEvent.markTime) -
      parseTimeStr(entryEvent?.markTime ?? exitEvent.markTime) -
      (breakStartEvent && breakEndEvent
        ? parseTimeStr(breakEndEvent.markTime) - parseTimeStr(breakStartEvent.markTime)
        : 0)
    : 0

  return (
    <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
      <div className="size-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
        <CheckCircle className="h-10 w-10 text-emerald-500" />
      </div>
      <div>
        <h2 className="text-xl font-extrabold text-foreground mb-1">Turno Completado</h2>
        <p className="text-sm text-muted-foreground">
          Has registrado todas tus marcaciones del día. ¡Hasta mañana!
        </p>
      </div>

      {/* Shift assignment info */}
      {(shiftDate || turnTemplate || unity) && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border shadow-sm w-full text-sm overflow-hidden">
          {shiftDate && (
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <CalendarDays className="h-4 w-4 text-blue-500 shrink-0" />
              <span className="text-muted-foreground capitalize">{fmtDate(shiftDate)}</span>
            </div>
          )}
          {turnTemplate && (
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-muted-foreground">Horario</span>
              </div>
              <span className="font-bold">
                {fmtTime(turnTemplate.timeFrom)} – {fmtTime(turnTemplate.timeTo)}
              </span>
            </div>
          )}
          {unity && (
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-rose-500 shrink-0" />
                <span className="text-muted-foreground">Unidad</span>
              </div>
              <span className="font-bold text-right max-w-[55%]">{unity.unityName}</span>
            </div>
          )}
        </div>
      )}

      {exitEvent && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-border shadow-sm w-full text-sm space-y-2">
          {entryEvent && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Entrada</span>
              <span className="font-bold">{fmtTime(entryEvent.markTime)}</span>
            </div>
          )}
          {breakStartEvent && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Almuerzo</span>
              <span className="font-bold">
                {fmtTime(breakStartEvent.markTime)} –{" "}
                {breakEndEvent ? fmtTime(breakEndEvent.markTime) : "—"}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Salida</span>
            <span className="font-bold">{fmtTime(exitEvent.markTime)}</span>
          </div>
          <div className="pt-2 border-t border-border flex justify-between">
            <span className="text-muted-foreground">Total trabajado</span>
            <span className="font-extrabold">{fmtHHMMSS(Math.max(0, totalWorkedSeconds))}</span>
          </div>
        </div>
      )}

      {lateEvents.length > 0 && (
        <div className="w-full space-y-2">
          {lateEvents.map(ev => (
            <LatenessAlert
              key={ev.id}
              event={ev}
              request={lateRequests.find(r => r.guardAssistanceEventId === ev.id)}
              onJustify={onJustify}
            />
          ))}
        </div>
      )}
    </div>
  )
}
