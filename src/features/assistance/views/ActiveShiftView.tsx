import { cn } from "@/lib/utils"
import {
  CheckCircle,
  Clock,
  Loader2,
  LogOut,
  ShieldCheck,
  Utensils,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AssistanceType } from "../api/assistanceModel"
import type {
  GuardAssistanceEventDto,
  GuardRequestDto,
  TurnTemplateInfo,
} from "../api/assistanceModel"
import { fmtHHMMSS, fmtTime } from "../utils/assistanceUtils"
import type { ViewState } from "../utils/assistanceUtils"
import { LatenessAlert } from "../components/LatenessAlert"
import { QuickActions } from "../components/QuickActions"

interface ActiveShiftViewProps {
  viewState: ViewState
  isDescansero: boolean
  turnTemplate?: TurnTemplateInfo
  entryEvent?: GuardAssistanceEventDto
  breakStartEvent?: GuardAssistanceEventDto
  breakEndEvent?: GuardAssistanceEventDto
  shiftElapsedSeconds: number
  breakRemainingSeconds: number
  breakIsOverdue: boolean
  lateEvents: GuardAssistanceEventDto[]
  lateRequests: GuardRequestDto[]
  canMark: boolean
  canMarkExit: boolean
  isMarking: boolean
  onMark: (type: AssistanceType) => void
  onJustify: (event: GuardAssistanceEventDto) => void
}

export function ActiveShiftView({
  viewState,
  isDescansero,
  turnTemplate,
  entryEvent,
  breakStartEvent,
  breakEndEvent,
  shiftElapsedSeconds,
  breakRemainingSeconds,
  breakIsOverdue,
  lateEvents,
  lateRequests,
  canMark,
  canMarkExit,
  isMarking,
  onMark,
  onJustify,
}: ActiveShiftViewProps) {
  return (
    <>
      {/* Shift timer */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-border text-center">
        <h2 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">
          Tiempo Transcurrido
        </h2>
        <div className="text-5xl font-mono font-extrabold text-slate-800 dark:text-slate-100 tabular-nums">
          {fmtHHMMSS(shiftElapsedSeconds)}
        </div>
        {turnTemplate && (
          <div className="mt-3 flex justify-center gap-2 text-xs text-slate-400">
            <span>Entrada: {fmtTime(turnTemplate.timeFrom)}</span>
            <span>·</span>
            <span>Salida: {fmtTime(turnTemplate.timeTo)}</span>
          </div>
        )}
        {entryEvent && (
          <div className="mt-1 text-[10px] text-slate-400">
            Marcaste a las {fmtTime(entryEvent.markTime)}
            {entryEvent.differenceInMinutes != null && entryEvent.differenceInMinutes > 0 && (
              <span className="ml-1 text-amber-500 font-bold">
                (+{entryEvent.differenceInMinutes} min)
              </span>
            )}
          </div>
        )}
      </section>

      {/* Break section (non-descansero only) */}
      {!isDescansero && (
        <section className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-border">
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-b border-border flex justify-between items-center">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 text-sm">
              <Utensils className="h-4 w-4 text-blue-500" />
              Receso de Almuerzo
            </h3>
            <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 rounded uppercase">
              60m + 15m Tol.
            </span>
          </div>

          <div className="p-5">
            {/* Not started */}
            {viewState === "IN_SHIFT" && !breakStartEvent && (
              <div className="space-y-3">
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                  Inicie su periodo de descanso reglamentario.
                </p>
                <Button
                  className="w-full h-12 font-bold rounded-xl"
                  disabled={isMarking}
                  onClick={() => onMark(AssistanceType.BREAK_START)}
                >
                  {isMarking ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Utensils className="h-4 w-4 mr-2" />
                  )}
                  Iniciar Almuerzo
                </Button>
              </div>
            )}

            {/* Break active — countdown */}
            {viewState === "ON_BREAK" && (
              <div className="space-y-4 text-center">
                <p
                  className={cn(
                    "text-xs font-bold uppercase",
                    breakIsOverdue ? "text-destructive" : "text-amber-600 dark:text-amber-400",
                  )}
                >
                  {breakIsOverdue ? "¡Tiempo de almuerzo agotado!" : "Tiempo Restante de Almuerzo"}
                </p>
                <div
                  className={cn(
                    "text-6xl font-mono font-extrabold tabular-nums",
                    breakIsOverdue ? "text-destructive" : "text-amber-500",
                  )}
                >
                  {fmtHHMMSS(breakRemainingSeconds)}
                </div>
                {breakIsOverdue ? (
                  <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
                    <p className="text-xs text-destructive font-medium">
                      Has superado el tiempo máximo de almuerzo. Registra tu regreso.
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 p-3 rounded-lg">
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                      Estatus: <span className="font-bold">FUERA DE PUESTO</span>
                    </p>
                  </div>
                )}
                <Button
                  variant={breakIsOverdue ? "destructive" : "outline"}
                  className="w-full h-11 font-bold rounded-xl"
                  disabled={isMarking}
                  onClick={() => onMark(AssistanceType.BREAK_END)}
                >
                  {isMarking ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Finalizar Almuerzo
                </Button>
              </div>
            )}

            {/* Break done summary */}
            {viewState === "AWAITING_EXIT" && breakStartEvent && breakEndEvent && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span className="text-muted-foreground">
                  Almuerzo completado ·{" "}
                  <span className="font-bold text-foreground">
                    {fmtTime(breakStartEvent.markTime)} – {fmtTime(breakEndEvent.markTime)}
                  </span>
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Descansero info */}
      {isDescansero && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
          <ShieldCheck className="h-5 w-5 text-blue-500 shrink-0" />
          <p className="text-xs text-blue-800 dark:text-blue-300">
            <span className="font-bold">Perfil: Relevo</span> — Cubres las horas de almuerzo.
            No aplica sección de almuerzo para tu turno.
          </p>
        </div>
      )}

      {/* Lateness alerts */}
      {lateEvents.length > 0 && (
        <div className="space-y-2">
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

      {/* Exit button */}
      {(viewState === "AWAITING_EXIT" || (isDescansero && viewState === "IN_SHIFT")) && (
        <>
          {!canMarkExit && turnTemplate && (
            <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <Clock className="h-4 w-4 text-slate-500 shrink-0" />
              <p className="text-xs text-slate-600 dark:text-slate-400">
                La salida estará disponible a partir de las{" "}
                <span className="font-bold">{fmtTime(turnTemplate.timeTo)}</span> hrs.
              </p>
            </div>
          )}
          <Button
            size="lg"
            variant="destructive"
            className="w-full h-14 text-base font-bold rounded-2xl"
            disabled={!canMarkExit || isMarking}
            onClick={() => onMark(AssistanceType.EXIT)}
          >
            {isMarking ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <LogOut className="h-5 w-5 mr-2" />
            )}
            Marcar Salida del Turno
          </Button>
        </>
      )}

      <QuickActions />
    </>
  )
}
