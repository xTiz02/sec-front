import { AlertTriangle, Timer } from "lucide-react"
import type {
  GuardAssistanceEventDto,
  GuardExtraHoursDto,
  GuardRequestDto,
  TurnTemplateInfo,
} from "../api/assistanceModel"
import { fmtHHMMSS, fmtTime } from "../utils/assistanceUtils"
import { LatenessAlert } from "../components/LatenessAlert"
import { QuickActions } from "../components/QuickActions"

interface ExtraHoursViewProps {
  activeExtraHours?: GuardExtraHoursDto
  turnTemplate?: TurnTemplateInfo
  extraHoursElapsedSeconds: number
  lateEvents: GuardAssistanceEventDto[]
  lateRequests: GuardRequestDto[]
  onJustify: (event: GuardAssistanceEventDto) => void
}

export function ExtraHoursView({
  activeExtraHours,
  turnTemplate,
  extraHoursElapsedSeconds,
  lateEvents,
  lateRequests,
  onJustify,
}: ExtraHoursViewProps) {
  return (
    <>
      {/* Alert card */}
      <div className="bg-white dark:bg-slate-800 border border-border rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-4 mb-5">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl shrink-0">
            <AlertTriangle className="h-7 w-7 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Relevo No Recibido</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Tu jornada ha finalizado pero no ha llegado tu relevo.
            </p>
          </div>
        </div>
        {activeExtraHours?.coveredGuardName && (
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground font-medium">Salida programada</span>
              <span className="font-bold">
                {turnTemplate ? fmtTime(turnTemplate.timeTo) : "—"} hrs
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground font-medium">Guardia relevante</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {activeExtraHours.coveredGuardName}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Extra hours timer */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500 rounded-2xl p-5 shadow-sm">
        <div className="text-center">
          <span className="inline-block px-4 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold rounded-full uppercase tracking-widest mb-3">
            Horas Extra Autorizadas
          </span>
          <h2 className="text-base font-bold text-emerald-900 dark:text-emerald-100 mb-1">
            Extensión de Turno en Curso
          </h2>
          <p className="text-emerald-700 dark:text-emerald-400 text-xs mb-5">
            El Centro de Control ha validado tu permanencia.
          </p>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-inner border border-emerald-200 dark:border-emerald-800">
            <p className="text-[10px] text-muted-foreground uppercase font-extrabold mb-1 tracking-wider">
              Tiempo Transcurrido
            </p>
            <div className="text-5xl font-mono font-extrabold text-slate-800 dark:text-slate-100 tabular-nums">
              {fmtHHMMSS(extraHoursElapsedSeconds)}
            </div>
          </div>
        </div>
      </div>

      {/* Info note */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
        <Timer className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
          Permanezca en su puesto. Sus horas extras están siendo registradas automáticamente
          desde las{" "}
          <span className="font-bold">
            {activeExtraHours?.startTime ? fmtTime(activeExtraHours.startTime) : "—"}
          </span>{" "}
          hrs. Su contador se detendrá cuando su relevo registre la entrada.
        </p>
      </div>

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

      <QuickActions />
    </>
  )
}
