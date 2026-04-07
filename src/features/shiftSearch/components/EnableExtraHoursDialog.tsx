import { useState, useEffect, useMemo } from "react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { AlertCircle, Clock, Loader2, RefreshCw, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TurnTypeLabel } from "@/features/contractSchedule/api/contractScheduleModel"
import { useGetNextShiftsToCoverQuery, useCreateExtraHoursMutation } from "../api/shiftSearchApi"
import type { ShiftDetailDto } from "../api/shiftSearchModel"

interface Props {
  open: boolean
  shift: ShiftDetailDto
  onClose: () => void
  onSuccess: () => void
}

const NO_COVER_VALUE = "__none__"

// Extract "HH:mm" from an ISO datetime string or "HH:mm:ss" time string
function toTimeInput(iso?: string): string {
  if (!iso) return ""
  // If it contains "T" it's an ISO datetime
  if (iso.includes("T")) return iso.slice(11, 16)
  // Otherwise it's a time string "HH:mm:ss" or "HH:mm"
  return iso.slice(0, 5)
}

// Extract "yyyy-MM-dd" from an ISO datetime string
function toDateStr(iso?: string): string {
  if (!iso) return ""
  if (iso.includes("T")) return iso.slice(0, 10)
  return iso
}

export function EnableExtraHoursDialog({ open, shift, onClose, onSuccess }: Props) {
  const defaultStartTime = toTimeInput(shift.maxScheduledExit)
  const defaultStartDate = shift.maxScheduledExit
    ? toDateStr(shift.maxScheduledExit)
    : shift.date

  // ── Form state ───────────────────────────────────────────────────────────────
  const [coverShiftId, setCoverShiftId] = useState<string>(NO_COVER_VALUE)
  const [startDate, setStartDate] = useState(defaultStartDate)
  const [startTime, setStartTime] = useState(defaultStartTime)
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("")

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setCoverShiftId(NO_COVER_VALUE)
      setStartDate(defaultStartDate)
      setStartTime(defaultStartTime)
      setEndDate("")
      setEndTime("")
    }
  }, [open, defaultStartDate, defaultStartTime])

  // ── Data ─────────────────────────────────────────────────────────────────────
  const { data: nextShifts = [], isFetching: loadingShifts } = useGetNextShiftsToCoverQuery(
    shift.id,
    { skip: !open },
  )
  const [createExtraHours, { isLoading: isSubmitting }] = useCreateExtraHoursMutation()

  // ── Derived ──────────────────────────────────────────────────────────────────
  const hasCoverShift = coverShiftId !== NO_COVER_VALUE
  const selectedCover = nextShifts.find(s => String(s.id) === coverShiftId)

  // Minimum allowed start time ("HH:mm") based on maxScheduledExit
  const minStartTime = toTimeInput(shift.maxScheduledExit)
  const minStartDate = defaultStartDate

  const startTimeError = useMemo(() => {
    if (!startTime || !minStartTime) return null
    if (startDate === minStartDate && startTime < minStartTime) {
      return `La hora de inicio debe ser ≥ ${minStartTime}`
    }
    return null
  }, [startTime, startDate, minStartTime, minStartDate])

  const canSubmit =
    startDate && startTime && !startTimeError &&
    (hasCoverShift || (!!endDate && !!endTime)) &&
    !isSubmitting

  // ── Submit ───────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!canSubmit) return
    await createExtraHours({
      principalDateGuardUnityAssignmentId: shift.id,
      coverDateGuardUnityAssignmentId: hasCoverShift ? Number(coverShiftId) : undefined,
      startDate,
      startTime: startTime + ":00",
      endDate: !hasCoverShift ? endDate : undefined,
      endTime: !hasCoverShift ? endTime + ":00" : undefined,
    }).unwrap()
    onSuccess()
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  function resetStartToDefault() {
    setStartDate(defaultStartDate)
    setStartTime(defaultStartTime)
  }

  function formatShiftLabel(s: typeof nextShifts[0]) {
    const parts: string[] = [s.guardName]
    if (s.turnName) parts.push(s.turnName)
    if (s.scheduledEntry && s.scheduledExit)
      parts.push(`${s.scheduledEntry} – ${s.scheduledExit}`)
    try {
      parts.push(format(parseISO(s.date), "d MMM", { locale: es }))
    } catch { /* ignore */ }
    return parts.join(" · ")
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && !isSubmitting && onClose()}>
      <DialogContent className="max-w-lg gap-0 p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-5 border-b bg-muted/30">
          <DialogTitle className="text-base font-bold">Habilitar Horas Extra</DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Habilitación manual de tiempo extra para el guardia
          </p>
        </DialogHeader>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Current shift info banner */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">
              Turno actual
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              <div>
                <p className="text-[10px] text-blue-500 font-medium">Guardia</p>
                <p className="text-sm font-bold text-blue-900">{shift.guardName}</p>
              </div>
              <div>
                <p className="text-[10px] text-blue-500 font-medium">Unidad</p>
                <p className="text-sm font-bold text-blue-900">
                  {shift.contractUnityName ?? shift.specialServiceUnityName ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-blue-500 font-medium">Salida programada</p>
                <p className="text-sm font-mono font-bold text-blue-900">
                  {toTimeInput(shift.scheduledExit) || "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-blue-500 font-medium">Límite de salida</p>
                <p className="text-sm font-mono font-bold text-blue-900">
                  {toTimeInput(shift.maxScheduledExit) || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Select cover shift */}
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Turno a cubrir (opcional)
            </Label>
            <div className="flex items-center gap-2">
              <Select value={coverShiftId} onValueChange={setCoverShiftId} disabled={loadingShifts}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={
                    loadingShifts ? "Cargando turnos..." : "Sin turno específico a cubrir"
                  } />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_COVER_VALUE}>Sin turno a cubrir</SelectItem>
                  {nextShifts.map(s => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      <span className="flex items-center gap-2">
                        <span>{formatShiftLabel(s)}</span>
                        {s.turnType && (
                          <Badge variant="outline" className="text-[9px] py-0 h-4">
                            {TurnTypeLabel[s.turnType]}
                          </Badge>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {loadingShifts && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />}
            </div>
            {selectedCover && (
              <p className="text-[10px] text-muted-foreground italic">
                Cubre a: {selectedCover.guardName}
                {selectedCover.scheduledEntry && ` · Entrada: ${selectedCover.scheduledEntry}`}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground">
              Si no se selecciona un turno, el guardia se queda tiempo extra sin cubrir un puesto específico.
            </p>
          </div>

          {/* Start datetime */}
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Inicio de horas extra
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground font-medium">Fecha</p>
                <input
                  type="date"
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={startDate}
                  min={minStartDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground font-medium">Hora</p>
                  {defaultStartTime && (
                    <button
                      type="button"
                      onClick={resetStartToDefault}
                      className="flex items-center gap-1 text-[10px] text-primary hover:underline"
                      title="Restablecer al límite de salida"
                    >
                      <RefreshCw className="h-2.5 w-2.5" />
                      Restablecer
                    </button>
                  )}
                </div>
                <input
                  type="time"
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                />
              </div>
            </div>
            {startTimeError && (
              <p className="text-[11px] text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {startTimeError}
              </p>
            )}
          </div>

          {/* End datetime — only when no cover shift selected */}
          {!hasCoverShift && (
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Fin de horas extra <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-medium">Fecha</p>
                  <input
                    type="date"
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    value={endDate}
                    min={startDate}
                    onChange={e => setEndDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-medium">Hora</p>
                  <input
                    type="time"
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                  />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Indica hasta cuándo se quedará el guardia si no está cubriendo un turno específico.
              </p>
            </div>
          )}

          {/* Auto-close note */}
          {hasCoverShift && (
            <div className="flex gap-3 items-start p-3 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
              <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed text-amber-800">
                Las horas extra se cancelan automáticamente cuando el guardia del turno cubierto registre su entrada.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-muted/20 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Timer className="h-4 w-4 mr-2" />
            )}
            Habilitar Horas Extra
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
