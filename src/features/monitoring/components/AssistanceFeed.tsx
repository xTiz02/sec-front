import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AssistanceTypeLabel,
  AssistanceProblemTypeLabel,
  AssistanceType,
  AssistanceProblemType,
} from "@/features/assistance/api/assistanceModel"
import { MapPin, MapPinOff, Eye } from "lucide-react"
import type { LiveAssistanceEventDto } from "../api/monitoringModel"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function assistanceTypeBadge(type: AssistanceType) {
  const variants: Record<AssistanceType, string> = {
    [AssistanceType.ENTRY]: "border-green-500 text-green-700 bg-green-50",
    [AssistanceType.EXIT]: "border-slate-400 text-slate-600 bg-slate-50",
    [AssistanceType.BREAK_START]: "border-amber-400 text-amber-700 bg-amber-50",
    [AssistanceType.BREAK_END]: "border-blue-400 text-blue-700 bg-blue-50",
  }
  return variants[type] ?? ""
}

function problemBadge(type?: AssistanceProblemType) {
  if (!type) return null
  const variants: Record<AssistanceProblemType, string> = {
    [AssistanceProblemType.LATE]: "border-red-400 text-red-700",
    [AssistanceProblemType.LATE_JUSTIFIED]: "border-amber-400 text-amber-700",
    [AssistanceProblemType.SYSTEM]: "border-slate-400 text-slate-600",
    [AssistanceProblemType.EARLY]: "border-blue-400 text-blue-700",
  }
  return (
    <Badge variant="outline" className={`text-[9px] ${variants[type]}`}>
      {AssistanceProblemTypeLabel[type]}
    </Badge>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AssistanceFeedProps {
  events: LiveAssistanceEventDto[]
  isLoading?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AssistanceFeed({ events, isLoading }: AssistanceFeedProps) {
  if (isLoading) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        Cargando marcaciones...
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        Sin marcaciones aún para hoy. Conectado al WebSocket...
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left min-w-[900px]">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Guardia
            </th>
            <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Unidad / Cliente
            </th>
            <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Tipo Marcación
            </th>
            <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Hora
            </th>
            <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Estado
            </th>
            <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              GPS
            </th>
            <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-16">
              &nbsp;
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {events.map(event => (
            <FeedRow key={event.id} event={event} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function FeedRow({ event }: { event: LiveAssistanceEventDto }) {
  const hasGps = event.latitude != null && event.longitude != null

  return (
    <tr className="hover:bg-muted/30 transition-colors group">
      <td className="px-5 py-3.5">
        <p className="text-sm font-semibold">{event.guardName}</p>
        <p className="text-[10px] text-muted-foreground">
          {event.guardCode} · {event.guardDocumentNumber}
        </p>
      </td>

      <td className="px-5 py-3.5">
        <p className="text-sm font-medium">{event.unityName}</p>
        <p className="text-[10px] text-muted-foreground">{event.clientName}</p>
      </td>

      <td className="px-5 py-3.5">
        <Badge
          variant="outline"
          className={`text-[10px] font-bold ${assistanceTypeBadge(event.assistanceType)}`}
        >
          {AssistanceTypeLabel[event.assistanceType]}
        </Badge>
        <p className="text-[10px] text-muted-foreground mt-0.5">#{event.numberOrder}</p>
      </td>

      <td className="px-5 py-3.5">
        <p className="text-sm font-mono font-medium">
          {event.markTime ? event.markTime.substring(0, 5) : "—"}
        </p>
        <p className="text-[10px] text-muted-foreground">{event.markDate}</p>
      </td>

      <td className="px-5 py-3.5">
        <div className="flex flex-col gap-1">
          {problemBadge(event.assistanceProblemType) ?? (
            <span className="text-[10px] text-green-600 font-medium">OK</span>
          )}
          {event.toleranceMinutes > 0 && (
            <span className="text-[10px] text-muted-foreground">
              +{event.toleranceMinutes} min tolerancia
            </span>
          )}
        </div>
      </td>

      <td className="px-5 py-3.5">
        {hasGps ? (
          <div className="flex items-center gap-1 text-green-600 text-[10px] font-medium">
            <MapPin className="h-3 w-3" />
            OK
          </div>
        ) : (
          <div className="flex items-center gap-1 text-muted-foreground text-[10px]">
            <MapPinOff className="h-3 w-3" />
            Sin GPS
          </div>
        )}
      </td>

      <td className="px-5 py-3.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
          disabled
          title="Vista de detalle de asistencia — próximamente"
        >
          <Eye className="h-3.5 w-3.5" />
        </Button>
      </td>
    </tr>
  )
}
