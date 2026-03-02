import { CalendarCheck, Loader2, Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { ClientContractSelector } from "@/components/select/ClientContractSelector"
import { ContractUnitySelector } from "@/components/select/ContractUnitySelector"
import type { ScheduleMonthlyDto, Month } from "@/features/assignment/api/assignmentModel"
import { MonthLabel } from "@/features/assignment/api/assignmentModel"
import { INDEX_TO_MONTH } from "../api/monthlySchedulerModel"

// ─── Year range ───────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1]

// ─── Props ────────────────────────────────────────────────────────────────────

interface SchedulerFiltersProps {
  contractId: number | undefined
  contractUnityId: number | undefined
  month: Month
  year: number
  scheduleMonthly: ScheduleMonthlyDto | null | undefined
  isLoadingSchedule: boolean
  totalGuards: number
  uncoveredTurns: number
  isGenerating: boolean
  onContractChange: (id: number | undefined) => void
  onContractUnityChange: (id: number | undefined) => void
  onMonthChange: (m: Month) => void
  onYearChange: (y: number) => void
  onGenerate: (name: string, description?: string) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SchedulerFilters({
  contractId,
  contractUnityId,
  month,
  year,
  scheduleMonthly,
  isLoadingSchedule,
  totalGuards,
  uncoveredTurns,
  isGenerating,
  onContractChange,
  onContractUnityChange,
  onMonthChange,
  onYearChange,
  onGenerate,
}: SchedulerFiltersProps) {
  const [generateOpen, setGenerateOpen] = useState(false)
  const [scheduleName, setScheduleName] = useState("")
  const [scheduleDesc, setScheduleDesc] = useState("")

  const handleOpenGenerate = () => {
    setScheduleName(
      scheduleMonthly?.name ?? `Planificación ${MonthLabel[month]} ${year}`,
    )
    setScheduleDesc(scheduleMonthly?.description ?? "")
    setGenerateOpen(true)
  }

  const handleConfirmGenerate = () => {
    onGenerate(scheduleName, scheduleDesc || undefined)
    setGenerateOpen(false)
  }

  const canGenerate = contractUnityId != null

  return (
    <>
      <div className="flex flex-col gap-4 p-4 bg-card border-b border-border shadow-sm z-10 shrink-0">
        {/* Title row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-extrabold tracking-tight">
              Planificador Mensual Operativo
            </h1>
            <p className="text-muted-foreground text-xs">
              Asignación de guardias por contrato y unidad.
            </p>
          </div>

          {/* Summary stats */}
          <div className="hidden xl:flex gap-3">
            <div className="flex items-center gap-3 px-3 py-1.5 bg-muted rounded border border-border">
              <div className="p-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded">
                <CalendarCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase">
                  Guardias
                </p>
                <p className="text-xs font-bold">{totalGuards}</p>
              </div>
            </div>
            {uncoveredTurns > 0 && (
              <div className="flex items-center gap-3 px-3 py-1.5 bg-destructive/5 rounded border border-destructive/20">
                <div className="p-1 bg-destructive/10 text-destructive rounded">
                  <RefreshCw className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] text-destructive font-bold uppercase">
                    Descubiertos
                  </p>
                  <p className="text-xs font-bold text-destructive">{uncoveredTurns} Turnos</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selector row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mt-1">
          {/* Client Contract */}
          <div className="md:col-span-3">
            <label className="block text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
              Contrato Cliente
            </label>
            <ClientContractSelector
              value={contractId}
              onChange={onContractChange}
              placeholder="Buscar contrato..."
            />
          </div>

          {/* Contract Unity */}
          <div className="md:col-span-3">
            <label className="block text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
              Unidad Operativa
            </label>
            <ContractUnitySelector
              contractId={contractId}
              value={contractUnityId}
              onChange={onContractUnityChange}
              placeholder="Seleccionar unidad..."
              disabled={contractId == null}
            />
          </div>

          {/* Period (Month + Year) */}
          <div className="md:col-span-4">
            <label className="block text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
              Período
            </label>
            <div className="flex gap-2">
              {/* Month */}
              <div className="flex-1">
                <Select
                  value={month}
                  onValueChange={v => onMonthChange(v as Month)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INDEX_TO_MONTH.map(m => (
                      <SelectItem key={m} value={m}>
                        {MonthLabel[m]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Year */}
              <div className="w-24">
                <Select
                  value={String(year)}
                  onValueChange={v => onYearChange(Number(v))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map(y => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Schedule monthly status */}
            {contractUnityId != null && (
              <div className="mt-1.5 flex items-center gap-2">
                {isLoadingSchedule ? (
                  <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Verificando período...
                  </span>
                ) : scheduleMonthly ? (
                  <Badge variant="outline" className="text-[10px] gap-1">
                    <CalendarCheck className="h-3 w-3 text-green-500" />
                    {scheduleMonthly.name}
                  </Badge>
                ) : (
                  <span className="text-[10px] text-muted-foreground">
                    Sin horario para este período
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Generate button */}
          <div className="md:col-span-2 flex items-end">
            <Button
              className="w-full"
              disabled={!canGenerate || isGenerating}
              onClick={handleOpenGenerate}
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {scheduleMonthly ? "Regenerar" : "Generar"}
            </Button>
          </div>
        </div>
      </div>

      {/* Generate confirmation dialog */}
      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {scheduleMonthly ? "Regenerar Horario" : "Generar Horario Mensual"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {scheduleMonthly && (
              <p className="text-sm text-muted-foreground">
                Ya existe un horario para este período. Al regenerar se reemplazarán las asignaciones existentes.
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="sched-name">Nombre del período</Label>
              <Input
                id="sched-name"
                value={scheduleName}
                onChange={e => setScheduleName(e.target.value)}
                placeholder={`Planificación ${MonthLabel[month]} ${year}`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sched-desc">Descripción (opcional)</Label>
              <Input
                id="sched-desc"
                value={scheduleDesc}
                onChange={e => setScheduleDesc(e.target.value)}
                placeholder="Ej: Turno completo de temporada alta"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmGenerate} disabled={!scheduleName.trim()}>
              {scheduleMonthly ? "Regenerar" : "Generar Horario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
