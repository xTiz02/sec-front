import { useState } from "react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  RefreshCw,
  Search,
  User,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { IdentificationTypeLabel } from "@/features/employee/api/employeeModel"
import { useGetEventAuditsQuery } from "./api/eventAuditApi"
import type { EventAuditDto } from "./api/eventAuditModel"
import { useDebounce } from "@/hooks/useDebounse"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function methodBadge(method: EventAuditDto["method"]) {
  const map = {
    POST:   "bg-emerald-100 text-emerald-800 border-emerald-300",
    PUT:    "bg-blue-100 text-blue-800 border-blue-300",
    DELETE: "bg-red-100 text-red-800 border-red-300",
  } as const
  return (
    <Badge variant="outline" className={`text-[10px] font-black tracking-wider ${map[method]}`}>
      {method}
    </Badge>
  )
}

function statusBadge(status: number) {
  const ok = status >= 200 && status < 300
  const redir = status >= 300 && status < 400
  const cls = ok
    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
    : redir
    ? "bg-blue-100 text-blue-800 border-blue-300"
    : "bg-red-100 text-red-800 border-red-300"
  return (
    <Badge variant="outline" className={`text-[10px] font-mono font-bold ${cls}`}>
      {status}
    </Badge>
  )
}

function formatDateTime(iso: string) {
  try {
    return format(parseISO(iso), "d MMM yyyy · HH:mm:ss", { locale: es })
  } catch {
    return iso
  }
}

function tryPrettyJson(raw?: string): string | null {
  if (!raw) return null
  try {
    return JSON.stringify(JSON.parse(raw), null, 2)
  } catch {
    return raw
  }
}

// ─── Detail modal ─────────────────────────────────────────────────────────────

function EventDetailModal({
  event,
  onClose,
}: {
  event: EventAuditDto | null
  onClose: () => void
}) {
  const prettyJson = tryPrettyJson(event?.json ?? undefined)

  return (
    <Dialog open={event !== null} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl gap-0 p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="px-6 py-5 border-b bg-muted/30 shrink-0">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            Detalle del Evento #{event?.eventId}
          </DialogTitle>
        </DialogHeader>

        {event && (
          <div className="overflow-y-auto flex-1 p-6 space-y-6">
            {/* Request info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <InfoCell label="Método">{methodBadge(event.method)}</InfoCell>
              <InfoCell label="Estado">{statusBadge(event.responseStatus)}</InfoCell>
              <InfoCell label="Duración">
                <span className="font-mono text-sm font-semibold">{event.duration} ms</span>
              </InfoCell>
              <InfoCell label="Fecha / Hora" className="col-span-2 sm:col-span-3">
                <span className="text-sm">{formatDateTime(event.startTime)}</span>
              </InfoCell>
              <InfoCell label="URI" className="col-span-2 sm:col-span-3">
                <span className="font-mono text-xs break-all">{event.uri}</span>
              </InfoCell>
            </div>

            {/* Description */}
            {event.description && (
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Descripción
                </p>
                <p className="text-sm leading-relaxed">{event.description}</p>
              </div>
            )}

            {/* Employee */}
            {event.employeeName && (
              <div className="rounded-lg bg-muted/40 border p-4 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3 w-3" />
                  Empleado
                </p>
                <p className="text-sm font-bold">{event.employeeName}</p>
                {(event.documentNumber || event.identificationType) && (
                  <p className="text-xs text-muted-foreground">
                    {event.identificationType
                      ? IdentificationTypeLabel[event.identificationType]
                      : "Doc"}
                    {": "}
                    {event.documentNumber ?? "—"}
                  </p>
                )}
              </div>
            )}

            {/* JSON payload */}
            {prettyJson && (
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Payload JSON
                </p>
                <pre className="rounded-lg bg-slate-950 text-slate-100 text-xs p-4 overflow-x-auto whitespace-pre-wrap break-words leading-relaxed">
                  {prettyJson}
                </pre>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function InfoCell({
  label,
  children,
  className = "",
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div>{children}</div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function EventAuditPage() {
  const [page, setPage] = useState(0)
  const [termInput, setTermInput] = useState("")
  const term = useDebounce(termInput, 400)
  const [selectedEvent, setSelectedEvent] = useState<EventAuditDto | null>(null)

  const { data, isLoading, isFetching, refetch } = useGetEventAuditsQuery({
    term: term || undefined,
    page,
    size: 20,
  })

  const totalPages = data?.totalPages ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Auditoría de Eventos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Registro de operaciones POST · PUT · DELETE del sistema
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          className="pl-9"
          placeholder="Buscar por nombre o documento..."
          value={termInput}
          onChange={e => {
            setTermInput(e.target.value)
            setPage(0)
          }}
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-16 text-[11px] font-black uppercase tracking-wider">ID</TableHead>
              <TableHead className="w-20 text-[11px] font-black uppercase tracking-wider">Método</TableHead>
              <TableHead className="text-[11px] font-black uppercase tracking-wider">URI</TableHead>
              <TableHead className="w-20 text-[11px] font-black uppercase tracking-wider">Estado</TableHead>
              <TableHead className="w-24 text-[11px] font-black uppercase tracking-wider">Duración</TableHead>
              <TableHead className="text-[11px] font-black uppercase tracking-wider">Empleado</TableHead>
              <TableHead className="text-[11px] font-black uppercase tracking-wider">Fecha</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-muted-foreground/40" />
                  Cargando eventos...
                </TableCell>
              </TableRow>
            ) : !data?.content.length ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground">Sin eventos registrados</p>
                </TableCell>
              </TableRow>
            ) : (
              data.content.map(ev => (
                <TableRow key={ev.eventId} className="group hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{ev.eventId}
                  </TableCell>
                  <TableCell>{methodBadge(ev.method)}</TableCell>
                  <TableCell className="max-w-xs">
                    <span className="font-mono text-xs truncate block max-w-[260px]" title={ev.uri}>
                      {ev.uri}
                    </span>
                    {ev.description && (
                      <span className="text-[10px] text-muted-foreground block truncate max-w-[260px]">
                        {ev.description}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{statusBadge(ev.responseStatus)}</TableCell>
                  <TableCell>
                    <span className={`font-mono text-xs font-semibold ${
                      ev.duration > 1000
                        ? "text-red-600"
                        : ev.duration > 500
                        ? "text-amber-600"
                        : "text-emerald-600"
                    }`}>
                      {ev.duration} ms
                    </span>
                  </TableCell>
                  <TableCell>
                    {ev.employeeName ? (
                      <div>
                        <p className="text-sm font-medium leading-tight">{ev.employeeName}</p>
                        {ev.documentNumber && (
                          <p className="text-[10px] text-muted-foreground">
                            {ev.identificationType
                              ? IdentificationTypeLabel[ev.identificationType]
                              : "Doc"}{" "}
                            {ev.documentNumber}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground/40 text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span>{formatDateTime(ev.startTime)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Ver detalle"
                      onClick={() => setSelectedEvent(ev)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Página {(data?.number ?? 0) + 1} de {totalPages}
            {data && (
              <span className="ml-2 text-xs">· {data.totalElements} eventos</span>
            )}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p - 1)}
              disabled={data?.first ?? true}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={data?.last ?? true}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail modal */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  )
}
