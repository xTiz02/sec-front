import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  MapPin,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { useGetUnitShiftDetailsQuery } from "../api/monitoringApi";
import type { UnitMonitoringStatusDto } from "../api/monitoringModel";
import type { GuardShiftDetailDto } from "../api/monitoringModel";

// ─── Status helpers ───────────────────────────────────────────────────────────

function StatusIcon({ active }: { active: boolean }) {
  return active ? (
    <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
  ) : (
    <XCircle className="h-4 w-4 text-muted-foreground/40 mx-auto" />
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface UnitShiftModalProps {
  unit: UnitMonitoringStatusDto | null;
  date: string;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function UnitShiftModal({ unit, date, onClose }: UnitShiftModalProps) {
  const [search, setSearch] = useState("");
  const [shiftTypeFilter, setShiftTypeFilter] = useState<
    "all" | "normal" | "exception"
  >("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "on_post" | "absent" | "future"
  >("all");

  const { data: shifts = [], isLoading } = useGetUnitShiftDetailsQuery(
    { contractUnityId: unit?.contractUnityId ?? 0, date },
    { skip: !unit },
  );

  const filtered = useMemo(() => {
    return shifts.filter((s) => {
      // Text search
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !s.guardName.toLowerCase().includes(q) &&
          !s.documentNumber.toLowerCase().includes(q) &&
          !s.guardCode.toLowerCase().includes(q)
        )
          return false;
      }
      // Shift type
      if (shiftTypeFilter === "normal" && s.isException) return false;
      if (shiftTypeFilter === "exception" && !s.isException) return false;
      // Status
      if (statusFilter === "on_post" && !s.shouldBeOnPost) return false;
      if (statusFilter === "absent" && !s.isAbsent) return false;
      if (statusFilter === "future" && !s.isFutureShift) return false;
      return true;
    });
  }, [shifts, search, shiftTypeFilter, statusFilter]);

  const onPostCount = shifts.filter((s) => s.shouldBeOnPost).length;
  const absentCount = shifts.filter((s) => s.isAbsent).length;
  const futureCount = shifts.filter((s) => s.isFutureShift).length;

  return (
    <Dialog open={!!unit} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="!w-[95vw] !max-w-[95vw] h-[90vh] !max-h-[90vh] p-0 flex flex-col gap-0">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <DialogHeader className="px-8 pt-7 pb-5 border-b border-border shrink-0">
          <DialogTitle className="text-xl font-extrabold tracking-tight">
            Detalle de Turnos por Unidad
          </DialogTitle>
          {unit && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              <MapPin className="h-3.5 w-3.5" />
              <span className="font-medium">{unit.unityName}</span>
              {unit.address && (
                <>
                  <span className="mx-1">•</span>
                  <span>{unit.address}</span>
                </>
              )}
              <span className="mx-1">•</span>
              <span className="text-muted-foreground/70">
                {unit.clientName}
              </span>
            </div>
          )}
        </DialogHeader>

        {/* ── Filters ────────────────────────────────────────────────────── */}
        <div className="px-8 py-5 bg-muted/40 border-b border-border shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Buscar Guardia
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  className="pl-8 h-9 text-sm"
                  placeholder="Nombre, DNI o código..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Tipo de Turno
              </label>
              <Select
                value={shiftTypeFilter}
                onValueChange={(v) =>
                  setShiftTypeFilter(v as typeof shiftTypeFilter)
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="exception">Excepción</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Estado General
              </label>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="on_post">En Puesto</SelectItem>
                  <SelectItem value="absent">Falta</SelectItem>
                  <SelectItem value="future">Turno Futuro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Acciones Rápidas
              </label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 h-9"
                  onClick={() => {
                    setSearch("");
                    setShiftTypeFilter("all");
                    setStatusFilter("all");
                  }}
                  variant="outline"
                >
                  Limpiar
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-8 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-muted-foreground">
                No hay turnos que coincidan con los filtros.
              </p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-background z-10">
                <tr className="border-b border-border">
                  <th className="py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Guardia
                  </th>
                  <th className="py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Turno
                  </th>
                  <th className="py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Horario
                  </th>
                  <th className="py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">
                    En Puesto
                  </th>
                  <th className="py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">
                    Turno Futuro
                  </th>
                  <th className="py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">
                    Faltó
                  </th>
                  <th className="py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((shift) => (
                  <ShiftRow
                    key={shift.dateGuardUnityAssignmentId}
                    shift={shift}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="px-8 py-5 bg-muted/40 border-t border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-5 text-xs font-medium text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              {onPostCount} En Puesto
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-destructive" />
              {absentCount} Falta{absentCount !== 1 ? "s" : ""}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {futureCount} Turno{futureCount !== 1 ? "s" : ""} Futuros
            </div>
          </div>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Row component ────────────────────────────────────────────────────────────

function ShiftRow({ shift }: { shift: GuardShiftDetailDto }) {
  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="py-3.5">
        <div>
          <p className="text-sm font-semibold">{shift.guardName}</p>
          <p className="text-[10px] text-muted-foreground">
            {shift.guardCode} · {shift.documentNumber}
          </p>
        </div>
      </td>

      <td className="py-3.5">
        <div className="flex flex-col gap-1">
          {shift.isException ? (
            <Badge
              variant="outline"
              className="text-[9px] border-blue-400 text-blue-600 w-fit"
            >
              Excepción
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[9px] w-fit">
              Normal
            </Badge>
          )}
          {shift.hasExtraHours && (
            <Badge
              variant="outline"
              className="text-[9px] border-amber-400 text-amber-600 w-fit"
            >
              Horas Extra
            </Badge>
          )}
        </div>
      </td>

      <td className="py-3.5">
        <div className="flex items-center gap-1.5 text-sm">
          <Clock className="h-3 w-3 text-muted-foreground" />
          {shift.turnStartTime} – {shift.turnEndTime}
        </div>
        {shift.lastMarkTime && (
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Última marca: {shift.lastMarkTime}
          </p>
        )}
      </td>

      <td className="py-3.5 text-center">
        <StatusIcon active={shift.shouldBeOnPost} />
      </td>

      <td className="py-3.5 text-center">
        <StatusIcon active={shift.isFutureShift} />
      </td>

      <td className="py-3.5 text-center">
        {shift.isAbsent ? (
          <XCircle className="h-4 w-4 text-destructive mx-auto" />
        ) : (
          <XCircle className="h-4 w-4 text-muted-foreground/30 mx-auto" />
        )}
      </td>

      <td className="py-3.5 text-right">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-primary font-semibold h-7 px-2"
          // disabled
          title="Vista de detalle de turno — próximamente"
          onClick={() =>
            window.open(
              `/modules/monitoring/shifts/${shift.dateGuardUnityAssignmentId}`,
              "_blank",
            )
          }
        >
          Ver Detalle
        </Button>
      </td>
    </tr>
  );
}
