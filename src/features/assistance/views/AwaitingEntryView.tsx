import { cn } from "@/lib/utils"
import { AlertTriangle, CalendarDays, Clock, Fingerprint, Loader2, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AssistanceType } from "../api/assistanceModel"
import type { ContractUnityInfo, TurnTemplateInfo } from "../api/assistanceModel"
import { fmtTime } from "../utils/assistanceUtils"

interface AwaitingEntryViewProps {
  shiftDate?: string
  turnTemplate?: TurnTemplateInfo
  unity?: ContractUnityInfo
  isInRange: boolean | null
  distanceMeters: number | null
  entryWindowReached: boolean
  canMarkEntry: boolean
  isMarking: boolean
  onMark: (type: AssistanceType) => void
}

/** Compute the time when entry becomes available (timeFrom − 15 min) */
function entryAvailableAt(timeFrom: string): string {
  const [h, m] = timeFrom.split(":").map(Number)
  const total = h * 60 + m - 15
  const hh = Math.floor(((total % 1440) + 1440) % 1440 / 60)
  const mm = ((total % 60) + 60) % 60
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`
}

function fmtDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function AwaitingEntryView({
  shiftDate,
  turnTemplate,
  unity,
  isInRange,
  distanceMeters,
  entryWindowReached,
  canMarkEntry,
  isMarking,
  onMark,
}: AwaitingEntryViewProps) {
  return (
    <>
      {/* Shift date */}
      {shiftDate && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-border flex items-center gap-3">
          <CalendarDays className="h-4 w-4 text-blue-500 shrink-0" />
          <span className="text-sm font-bold text-foreground capitalize">{fmtDate(shiftDate)}</span>
        </div>
      )}

      {/* Shift info cards */}
      {turnTemplate && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-border">
            <div className="flex items-center gap-1.5 text-blue-600 mb-1.5">
              <Clock className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Turno</span>
            </div>
            <p className="text-sm font-bold text-foreground">
              {fmtTime(turnTemplate.timeFrom)} – {fmtTime(turnTemplate.timeTo)}
            </p>
          </div>
          {unity && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-border">
              <div className="flex items-center gap-1.5 text-emerald-600 mb-1.5">
                <MapPin className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Unidad</span>
              </div>
              <p className="text-sm font-bold text-foreground line-clamp-2">{unity.unityName}</p>
            </div>
          )}
        </div>
      )}

      {/* GPS radar */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-border">
        <div className="relative h-44 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
          <div className="absolute size-36 rounded-full border-2 border-blue-400/30 bg-blue-400/5 animate-pulse" />
          <div className="absolute size-20 rounded-full border-2 border-blue-500/40 bg-blue-500/10" />
          <div className="size-5 rounded-full bg-blue-600 border-2 border-white shadow-lg" />
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            <span
              className={cn(
                "size-2 rounded-full",
                isInRange === null
                  ? "bg-slate-400 animate-pulse"
                  : isInRange
                    ? "bg-emerald-500 animate-ping"
                    : "bg-amber-500",
              )}
            />
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
              {isInRange === null ? "GPS..." : isInRange ? "GPS ACTIVO" : "FUERA DE RANGO"}
            </span>
          </div>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-muted-foreground">
            {distanceMeters != null
              ? `Estás a ${distanceMeters}m del punto de acceso`
              : "Obteniendo tu ubicación..."}
          </p>
        </div>
      </div>

      {/* Time window not yet open */}
      {!entryWindowReached && turnTemplate && (
        <div className="flex items-start gap-3 p-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
          <Clock className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 dark:text-slate-400">
            La entrada estará disponible a partir de las{" "}
            <span className="font-bold">{entryAvailableAt(turnTemplate.timeFrom)}</span> hrs.
          </p>
        </div>
      )}

      {/* Out-of-range warning */}
      {isInRange === false && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-300">
            Estás fuera del radio permitido ({unity?.allowedRadius ?? 1000}m). Acércate a la
            unidad para poder registrar tu entrada.
          </p>
        </div>
      )}

      {/* Entry button */}
      <Button
        className="w-full h-16 text-lg font-bold rounded-2xl shadow-xl shadow-blue-200 dark:shadow-blue-900/40 flex flex-col gap-1"
        disabled={!canMarkEntry || isMarking}
        onClick={() => onMark(AssistanceType.ENTRY)}
      >
        {isMarking ? (
          <Loader2 className="h-7 w-7 animate-spin" />
        ) : (
          <Fingerprint className="h-7 w-7" />
        )}
        <span className="text-sm">MARCAR ENTRADA</span>
      </Button>
    </>
  )
}
