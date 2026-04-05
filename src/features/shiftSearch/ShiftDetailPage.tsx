import { useParams, useNavigate } from "react-router-dom"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileWarning,
  Loader2,
  MapPin,
  ShieldCheck,
  User,
  XCircle,
  AlertTriangle,
  Timer,
  Camera,
} from "lucide-react"
import {
  ScheduleAssignmentType,
  ScheduleAssignmentTypeLabel,
} from "@/features/scheduling/api/monthlySchedulerModel"
import {
  AssistanceType,
  AssistanceTypeLabel,
  AssistanceProblemType,
  AssistanceProblemTypeLabel,
  RequestStatus,
  RequestStatusLabel,
} from "@/features/assistance/api/assistanceModel"
import { GuardTypeLabel } from "@/features/guard/api/guardModel"
import {
  ScheduleExceptionTypeLabel,
} from "@/features/scheduling/api/scheduleExceptionModel"
import { TurnTypeLabel } from "@/features/contractSchedule/api/contractScheduleModel"
import { useGetShiftDetailQuery } from "./api/shiftSearchApi"
import type {
  ShiftAssistanceEventDetailDto,
  ShiftExceptionDetailDto,
  ShiftExtraHoursDetailDto,
} from "./api/shiftSearchModel"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dateLabel(d: string) {
  try {
    return format(parseISO(d), "EEEE d 'de' MMMM yyyy", { locale: es })
  } catch {
    return d
  }
}

function timeLabel(t?: string) {
  if (!t) return <span className="text-muted-foreground/40 text-xs">—</span>
  return <span>{t.slice(0, 5)}</span>
}

function assignmentTypeBadge(type: ScheduleAssignmentType) {
  const map: Partial<Record<ScheduleAssignmentType, string>> = {
    [ScheduleAssignmentType.NORMAL]: "border-slate-400 text-slate-700",
    [ScheduleAssignmentType.EXCEPTIONAL]: "border-emerald-400 text-emerald-700",
    [ScheduleAssignmentType.ADITIONAL]: "border-purple-400 text-purple-700",
    [ScheduleAssignmentType.FREE_DAY]: "border-blue-400 text-blue-700",
    [ScheduleAssignmentType.VACATIONAL]: "border-cyan-400 text-cyan-700",
    [ScheduleAssignmentType.ABSENT]: "border-red-400 text-red-700",
  }
  return (
    <Badge variant="outline" className={`text-[10px] font-bold ${map[type] ?? ""}`}>
      {ScheduleAssignmentTypeLabel[type]}
    </Badge>
  )
}

function problemBadge(type?: AssistanceProblemType) {
  if (!type) return null
  const map: Record<AssistanceProblemType, string> = {
    [AssistanceProblemType.LATE]: "bg-red-100 text-red-700 border-red-300",
    [AssistanceProblemType.LATE_JUSTIFIED]: "bg-amber-100 text-amber-700 border-amber-300",
    [AssistanceProblemType.EARLY]: "bg-blue-100 text-blue-700 border-blue-300",
    [AssistanceProblemType.SYSTEM]: "bg-slate-100 text-slate-600 border-slate-300",
  }
  return (
    <Badge variant="outline" className={`text-[9px] font-bold ${map[type]}`}>
      {AssistanceProblemTypeLabel[type]}
    </Badge>
  )
}

function requestStatusBadge(status: RequestStatus) {
  const map: Record<RequestStatus, string> = {
    [RequestStatus.PENDING]: "bg-amber-100 text-amber-700 border-amber-300",
    [RequestStatus.APPROVED]: "bg-emerald-100 text-emerald-700 border-emerald-300",
    [RequestStatus.REJECTED]: "bg-red-100 text-red-700 border-red-300",
  }
  return (
    <Badge variant="outline" className={`text-[9px] font-bold ${map[status]}`}>
      {RequestStatusLabel[status]}
    </Badge>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, icon, children, accent }: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  accent?: string
}) {
  return (
    <div className={`bg-card rounded-xl border shadow-sm overflow-hidden ${accent ?? "border-border"}`}>
      <div className="flex items-center gap-2 px-6 py-4 border-b border-border bg-muted/30">
        <span className="text-muted-foreground">{icon}</span>
        <h3 className="text-xs font-black uppercase tracking-widest">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-32 shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-sm">{value ?? <span className="text-muted-foreground/40">—</span>}</span>
    </div>
  )
}

// ─── Assistance event row ─────────────────────────────────────────────────────

function AssistanceRow({ event }: { event: ShiftAssistanceEventDetailDto }) {
  const isLate = event.assistanceProblemType === AssistanceProblemType.LATE ||
                 event.assistanceProblemType === AssistanceProblemType.LATE_JUSTIFIED
  const isSystemClose = !event.markTime

  const entryExitIcon: Record<AssistanceType, React.ReactNode> = {
    [AssistanceType.ENTRY]: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
    [AssistanceType.EXIT]: <XCircle className="h-4 w-4 text-slate-500" />,
    [AssistanceType.BREAK_START]: <Clock className="h-4 w-4 text-amber-500" />,
    [AssistanceType.BREAK_END]: <Clock className="h-4 w-4 text-blue-500" />,
  }

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${isLate ? "border-red-200 bg-red-50/30" : "border-border bg-muted/10"}`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {entryExitIcon[event.assistanceType]}
          <span className="text-sm font-bold">{AssistanceTypeLabel[event.assistanceType]}</span>
          {problemBadge(event.assistanceProblemType)}
          {isSystemClose && (
            <Badge variant="outline" className="text-[9px] border-slate-300 text-slate-500">
              Cierre automático
            </Badge>
          )}
        </div>
        {event.photoUrl && (
          <div className="w-12 h-12 rounded-lg overflow-hidden border border-border shrink-0">
            <img src={event.photoUrl} alt="foto marcación" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Times */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Hora Real
          </p>
          <p className="text-sm font-mono font-semibold">
            {event.markTime
              ? event.markTime.slice(0, 5)
              : <span className="text-muted-foreground/40">No registrada</span>}
          </p>
          {event.markDate && (
            <p className="text-[10px] text-muted-foreground">{event.markDate}</p>
          )}
        </div>

        {event.limitTimeToMark && (
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Límite
            </p>
            <p className="text-sm font-mono">
              {event.limitTimeToMark.slice(11, 16)}
            </p>
            {event.toleranceMinutes != null && (
              <p className="text-[10px] text-muted-foreground">
                Tolerancia: {event.toleranceMinutes} min
              </p>
            )}
          </div>
        )}

        {event.differenceInMinutes != null && (
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Diferencia
            </p>
            <p className={`text-sm font-mono font-bold ${event.differenceInMinutes > 0 ? "text-red-600" : "text-emerald-600"}`}>
              {event.differenceInMinutes > 0 ? "+" : ""}{event.differenceInMinutes} min
            </p>
          </div>
        )}
      </div>

      {/* Location + IP */}
      {(event.latitude != null || event.ipAddress) && (
        <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
          {event.latitude != null && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {event.latitude.toFixed(6)}, {event.longitude?.toFixed(6)}
            </span>
          )}
          {event.ipAddress && (
            <span className="font-mono">{event.ipAddress}</span>
          )}
        </div>
      )}

      {/* Justification */}
      {event.justification && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">
              Justificación de Tardanza
            </span>
            {requestStatusBadge(event.justification.requestStatus)}
          </div>
          <p className="text-xs italic text-amber-900">{event.justification.description}</p>
          <p className="text-[10px] text-amber-600">
            {format(parseISO(event.justification.createdAt), "d MMM yyyy HH:mm", { locale: es })}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Exception row ────────────────────────────────────────────────────────────

function ExceptionRow({ exc }: { exc: ShiftExceptionDetailDto }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50/30 p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Badge className="bg-red-600 text-white text-[9px] font-black uppercase">
          {ScheduleExceptionTypeLabel[exc.scheduleExceptionType]}
        </Badge>
      </div>
      {exc.motive && (
        <p className="text-xs font-semibold text-red-800">{exc.motive}</p>
      )}
      {exc.description && (
        <p className="text-xs italic text-red-700">{exc.description}</p>
      )}
      {exc.replacementGuardName && (
        <div className="pt-1 border-t border-red-200 space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Guardia de Reemplazo
          </p>
          <p className="text-sm font-semibold">{exc.replacementGuardName}</p>
          <p className="text-[10px] text-muted-foreground">
            {exc.replacementGuardCode && `Cód: ${exc.replacementGuardCode} · `}
            {exc.replacementDocumentNumber}
            {exc.replacementGuardType && ` · ${GuardTypeLabel[exc.replacementGuardType]}`}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Extra hours row ──────────────────────────────────────────────────────────

function ExtraHoursRow({ eh }: { eh: ShiftExtraHoursDetailDto }) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4 space-y-3">
      {/* Header: time range + badge */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="text-sm font-bold text-emerald-800">
            {eh.startDate} · {eh.startTime.slice(0, 5)}
            {eh.endDate && eh.endDate !== eh.startDate ? ` → ${eh.endDate}` : ""}
            {eh.endTime ? ` — ${eh.endTime.slice(0, 5)}` : ""}
          </span>
        </div>
        {eh.extraHours != null && (
          <Badge className="bg-emerald-600 text-white text-[10px] font-black shrink-0">
            +{eh.extraHours}h extra
          </Badge>
        )}
      </div>

      {/* Guard info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {eh.principalGuardName && (
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Guardia en turno
            </p>
            <p className="font-semibold">{eh.principalGuardName}</p>
            {eh.principalShiftDate && (
              <p className="text-muted-foreground">{eh.principalShiftDate}</p>
            )}
          </div>
        )}
        {eh.coverGuardName && (
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Turno cubierto
            </p>
            <p className="font-semibold">{eh.coverGuardName}</p>
            {eh.coverShiftDate && (
              <p className="text-muted-foreground">{eh.coverShiftDate}</p>
            )}
          </div>
        )}
      </div>

      {/* Operator + created at */}
      {(eh.operatorUserName || eh.createdAt) && (
        <div className="pt-2 border-t border-emerald-200 flex items-center gap-4 text-[10px] text-emerald-700">
          {eh.operatorUserName && (
            <span>
              <span className="font-bold uppercase tracking-wider">Habilitado por: </span>
              {eh.operatorUserName}
            </span>
          )}
          {eh.createdAt && (
            <span className="text-emerald-600/70 ml-auto">
              {format(parseISO(eh.createdAt), "d MMM yyyy HH:mm", { locale: es })}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ShiftDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const shiftId = Number(id)

  const { data: shift, isLoading, isError } = useGetShiftDetailQuery(shiftId, {
    skip: isNaN(shiftId),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError || !shift) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <AlertTriangle className="h-10 w-10 text-destructive/40" />
        <p className="text-sm text-muted-foreground">No se pudo cargar el detalle del turno.</p>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>Volver</Button>
      </div>
    )
  }

  const unityName = shift.contractUnityName ?? shift.specialServiceUnityName
  const hasAnyAbsence = shift.scheduleAssignmentType === ScheduleAssignmentType.ABSENT || shift.hasExceptions

  return (
    <div className="space-y-6 pb-12">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 mt-0.5"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
            Operaciones · Búsqueda de Turnos · Detalle
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-extrabold tracking-tight">
              Turno #{shift.id}
            </h1>
            {assignmentTypeBadge(shift.scheduleAssignmentType)}
            {hasAnyAbsence && (
              <Badge className="bg-red-600 text-white text-[9px] font-black uppercase tracking-wider">
                Excepción activa
              </Badge>
            )}
            {shift.finalized && (
              <Badge variant="outline" className="border-slate-400 text-slate-600 text-[9px] font-black uppercase">
                Finalizado
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 capitalize">
            {dateLabel(shift.date)}
          </p>
        </div>
      </div>

      {/* ── Top grid: Guard + Unity ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Guard card (col-span-2) */}
        <div className="lg:col-span-2">
          <Section title="Información del Guardia" icon={<User className="h-4 w-4" />}>
            <div className="flex items-start gap-5">
              {shift.guardPhotoUrl ? (
                <img
                  src={shift.guardPhotoUrl}
                  alt={shift.guardName}
                  className="w-16 h-16 rounded-xl object-cover ring-4 ring-primary/10 shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <User className="h-7 w-7 text-muted-foreground/40" />
                </div>
              )}
              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="text-xl font-black">{shift.guardName}</h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {shift.guardType && (
                      <Badge variant="outline" className="border-blue-300 text-blue-700 text-[9px] font-bold">
                        {GuardTypeLabel[shift.guardType]}
                      </Badge>
                    )}
                    {shift.isExternalGuard && (
                      <Badge variant="outline" className="border-amber-300 text-amber-700 text-[9px] font-bold">
                        Externo
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-y-2 gap-x-6">
                  <InfoRow label="Documento" value={
                    <span>
                      {shift.documentNumber}
                      {shift.identificationType ? ` · ${shift.identificationType}` : ""}
                    </span>
                  } />
                  {shift.guardCode && <InfoRow label="Código" value={
                    <span className="font-mono font-semibold">{shift.guardCode}</span>
                  } />}
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* Unity card */}
        <div className="bg-neutral-500 rounded-xl p-5 shadow-lg shadow-primary/20 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <Building2 className="h-6 w-6" />
              {shift.contractUnityCode && (
                <span className="text-[10px] font-black uppercase">
                  {shift.contractUnityCode}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-xl font-black leading-tight">{unityName ?? "—"}</h3>
              {shift.clientContractName && (
                <p className="text-sm mt-0.5">{shift.clientContractName}</p>
              )}
              {shift.clientName && (
                <p className="text-xs mt-0.5">{shift.clientName}</p>
              )}
            </div>
          </div>
          <div className="pt-4 border-t border-white/10 space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-bold text-primary-foreground/50 uppercase">Horario</p>
                <p className="text-sm font-bold">
                  {shift.scheduledEntry ?? "—"} — {shift.scheduledExit ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-primary-foreground/50 uppercase">Fecha</p>
                <p className="text-sm font-bold">
                  {format(parseISO(shift.date), "d MMM yyyy", { locale: es })}
                </p>
              </div>
            </div>
            {shift.turnName && (
              <div>
                <p className="text-[10px] font-bold text-primary-foreground/50 uppercase">Turno</p>
                <p className="text-sm font-bold">
                  {shift.turnName}
                  {shift.turnType ? ` · ${TurnTypeLabel[shift.turnType]}` : ""}
                </p>
              </div>
            )}
            {shift.unityAddress && (
              <div className="flex items-start gap-1.5 text-[10px]">
                <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
                <span>{shift.unityAddress}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Status flags row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(
          [
            { label: "Marcaciones", value: shift.hasMarks, icon: <Camera className="h-4 w-4" />, color: "emerald" },
            { label: "Excepciones", value: shift.hasExceptions, icon: <FileWarning className="h-4 w-4" />, color: "red" },
            { label: "Horas Extra", value: shift.hasExtraHours, icon: <Timer className="h-4 w-4" />, color: "purple" },
            { label: "Vacaciones", value: shift.hasVacation, icon: <Calendar className="h-4 w-4" />, color: "cyan" },
          ] as const
        ).map(({ label, value, icon, color }) => (
          <div key={label} className={`rounded-xl border p-4 flex items-center gap-3 ${
            value
              ? `border-${color}-200 bg-${color}-50/40`
              : "border-border bg-muted/20 opacity-50"
          }`}>
            <span className={value ? `text-${color}-600` : "text-muted-foreground"}>
              {icon}
            </span>
            <div>
              <p className="text-xs font-bold">{label}</p>
              <p className={`text-[10px] font-medium ${value ? `text-${color}-700` : "text-muted-foreground"}`}>
                {value ? "Sí" : "No"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Attendance timeline ────────────────────────────────────────────── */}
      <Section
        title={`Marcaciones de Asistencia (${shift.assistanceEvents.length})`}
        icon={<ShieldCheck className="h-4 w-4" />}
      >
        {shift.assistanceEvents.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center gap-2">
            <Camera className="h-8 w-8 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">Sin marcaciones registradas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {shift.assistanceEvents.map(ev => (
              <AssistanceRow key={ev.id} event={ev} />
            ))}
          </div>
        )}
      </Section>

      {/* ── Exceptions ─────────────────────────────────────────────────────── */}
      {shift.hasExceptions && (
        <Section
          title={`Excepciones (${shift.exceptions.length})`}
          icon={<FileWarning className="h-4 w-4" />}
          accent="border-red-200"
        >
          {shift.exceptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin excepciones registradas</p>
          ) : (
            <div className="space-y-3">
              {shift.exceptions.map(exc => (
                <ExceptionRow key={exc.id} exc={exc} />
              ))}
            </div>
          )}
        </Section>
      )}

      {/* ── Extra hours ─────────────────────────────────────────────────────── */}
      {shift.hasExtraHours && (
        <Section
          title={`Horas Extra (${shift.extraHours.length})`}
          icon={<Timer className="h-4 w-4" />}
          accent="border-emerald-200"
        >
          {shift.extraHours.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin horas extra registradas</p>
          ) : (
            <div className="space-y-3">
              {shift.extraHours.map(eh => (
                <ExtraHoursRow key={eh.id} eh={eh} />
              ))}
            </div>
          )}
        </Section>
      )}

      {/* ── Schedule info ───────────────────────────────────────────────────── */}
      {shift.scheduleMonthlyName && (
        <Section title="Programación Mensual" icon={<Calendar className="h-4 w-4" />}>
          <InfoRow label="Nombre" value={shift.scheduleMonthlyName} />
        </Section>
      )}
    </div>
  )
}
