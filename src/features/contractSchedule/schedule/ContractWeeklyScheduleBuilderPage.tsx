import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetClientContractsQuery,
  useGetWeeklyScheduleByContractIdQuery,
  useGetAllTurnTemplatesQuery,
  useSaveWeeklyScheduleMutation,
} from "../api/contractScheduleApi";
import {
  type TurnTemplateDto,
  DayOfWeek,
  type AssignTurnsToWeekRequest,
} from "../api/contractScheduleModel";
import {
  DayOfWeekLabel,
  TurnType,
  TurnTypeLabel,
} from "../api/contractScheduleModel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  MapPin,
  Clock,
  Users,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetUnitiesQuery } from "@/features/unity/api/unityApi";
import type { UnityDto } from "@/features/unity/api/unityModel";
import { isLeisureDay } from "@/utils/helpers";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UnitSchedule {
  unityId: number;
  unityName: string;
  unityCode?: string;
  contractUnityId?: number; // Only exists if already saved
  days: DaySchedule[];
}

interface DaySchedule {
  dayOfWeek: DayOfWeek;
  turns: TurnTemplateDto[];
}

const DAYS_OF_WEEK: DayOfWeek[] = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
  DayOfWeek.SUNDAY,
];

// ─── Component ────────────────────────────────────────────────────────────────

export const ContractWeeklyScheduleBuilderPage = () => {
  const navigate = useNavigate();
  const [selectedContractId, setSelectedContractId] = useState<
    number | undefined
  >();
  const [clientId, setClientId] = useState<number | undefined>();
  const [unitSchedules, setUnitSchedules] = useState<UnitSchedule[]>([]);
  const [addUnitDialogOpen, setAddUnitDialogOpen] = useState(false);
  const [addTurnDialog, setAddTurnDialog] = useState<{
    open: boolean;
    unityId?: number;
    dayOfWeek?: DayOfWeek;
  }>({ open: false });

  const { data: contractsData } = useGetClientContractsQuery({
    page: 0,
    size: 100,
  });
  const { data: existingWeeklySchedules = [] } =
    useGetWeeklyScheduleByContractIdQuery(selectedContractId!, {
      skip: !selectedContractId,
    });

  // Get client's unities for adding new ones
  const { data: clientUnitiesData } = useGetUnitiesQuery(
    {
      page: 0,
      size: 100,
      query: clientId ? `client.id:${clientId},` : undefined,
    },
    { skip: !clientId },
  );

  const { data: allTurnTemplates = [] } = useGetAllTurnTemplatesQuery();
  const [saveWeeklySchedule, { isLoading: saving }] =
    useSaveWeeklyScheduleMutation();

  // When contract changes, set clientId
  useEffect(() => {
    if (selectedContractId && contractsData) {
      const selectedContract = contractsData.content.find(
        (c) => c.id === selectedContractId,
      );
      if (selectedContract) {
        setClientId(selectedContract.clientId);
      }
    } else {
      setClientId(undefined);
    }
  }, [selectedContractId, contractsData]);

  // Load existing weekly schedules when contract changes
  useEffect(() => {
    if (!selectedContractId) {
      setUnitSchedules([]);
      return;
    }

    if (existingWeeklySchedules.length > 0) {
      // Load complete schedules with turns
      const loaded: UnitSchedule[] = existingWeeklySchedules.map((ws) => ({
        unityId: ws.unityId,
        unityName: ws.unityName,
        unityCode: ws.unityCode,
        contractUnityId: ws.contractUnityId,
        days: DAYS_OF_WEEK.map((day) => {
          const existingDay = ws.schedules.find((d) => d.dayOfWeek === day);

          return {
            dayOfWeek: day,
            turns: existingDay?.turns ?? [],
          };
        }),
      }));
      setUnitSchedules(loaded);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContractId, existingWeeklySchedules.length]);

  const handleAddUnit = (unity: UnityDto) => {
    // Check if unity already added
    if (unitSchedules.some((us) => us.unityId === unity.id)) {
      return;
    }

    const newSchedule: UnitSchedule = {
      unityId: unity.id,
      unityName: unity.name,
      unityCode: unity.code,
      days: DAYS_OF_WEEK.map((day) => ({
        dayOfWeek: day,
        turns: [],
      })),
    };

    setUnitSchedules((prev) => [...prev, newSchedule]);
    setAddUnitDialogOpen(false);
  };

  const handleReload = () => {
    if (!selectedContractId) return;

    // Reload from existing schedules
    if (existingWeeklySchedules.length > 0) {
      const reloaded: UnitSchedule[] = existingWeeklySchedules.map((ws) => ({
        unityId: ws.unityId,
        unityName: ws.unityName,
        unityCode: ws.unityCode,
        contractUnityId: ws.contractUnityId,
        days: DAYS_OF_WEEK.map((day) => {
          const existingDay = ws.schedules.find((d) => d.dayOfWeek === day);
          return {
            dayOfWeek: day,
            turns: existingDay?.turns ?? [],
          };
        }),
      }));
      setUnitSchedules(reloaded);
    } else {
      // Reset to empty if no existing schedules
      setUnitSchedules([]);
    }
  };

  const handleRemoveUnit = (unityId: number) => {
    setUnitSchedules((prev) => prev.filter((us) => us.unityId !== unityId));
  };

  const handleAddTurn = (turnTemplate: TurnTemplateDto) => {
    if (!addTurnDialog.unityId || addTurnDialog.dayOfWeek == null) return;

    setUnitSchedules((prev) =>
      prev.map((us) =>
        us.unityId === addTurnDialog.unityId
          ? {
              ...us,
              days: us.days.map((day) =>
                day.dayOfWeek === addTurnDialog.dayOfWeek
                  ? { ...day, turns: [...day.turns, turnTemplate] }
                  : day,
              ),
            }
          : us,
      ),
    );
    setAddTurnDialog({ open: false });
  };

  const handleRemoveTurn = (
    unityId: number,
    dayOfWeek: DayOfWeek,
    turnIndex: number,
  ) => {
    setUnitSchedules((prev) =>
      prev.map((us) =>
        us.unityId === unityId
          ? {
              ...us,
              days: us.days.map((day) =>
                day.dayOfWeek === dayOfWeek
                  ? {
                      ...day,
                      turns: day.turns.filter((_, i) => i !== turnIndex),
                    }
                  : day,
              ),
            }
          : us,
      ),
    );
  };

  const getTotalGuardsForDay = (dayOfWeek: DayOfWeek) => {
    return unitSchedules.reduce((total, us) => {
      const daySchedule = us.days.find((d) => d.dayOfWeek === dayOfWeek);
      return (
        total +
        (daySchedule?.turns.reduce((sum, turn) => sum + turn.numGuards, 0) || 0)
      );
    }, 0);
  };

  const getTotalGuardsForUnit = (unityId: number) => {
    const unitSchedule = unitSchedules.find((us) => us.unityId === unityId);
    if (!unitSchedule) return 0;
    return unitSchedule.days.reduce(
      (total, day) =>
        total + day.turns.reduce((sum, turn) => sum + turn.numGuards, 0),
      0,
    );
  };

  const handleSave = async () => {
    if (!selectedContractId) return;

    const payload: AssignTurnsToWeekRequest = {
      contractId: selectedContractId,
      units: unitSchedules.map((us) => ({
        contractUnityId: us.contractUnityId, // undefined for new units
        unityId: us.unityId,
        days: us.days
          .filter((day) => day.turns.length > 0) // Only save days with turns
          .map((day) => ({
            dayOfWeek: day.dayOfWeek,
            turnTemplateIds: day.turns.map((t) => t.id),
          })),
      })),
    };

    console.log("Saving weekly schedule with payload:", payload);

    try {
      await saveWeeklySchedule(payload).unwrap();
      navigate("/modules/scheduling/contracts");
    } catch (err) {
      console.error("Error saving weekly schedule:", err);
    }
  };

  const availableContracts = useMemo(
    () => contractsData?.content.filter((c) => c.active) ?? [],
    [contractsData],
  );

  const availableUnits = useMemo(
    () =>
      clientUnitiesData?.content.filter(
        (u) => !unitSchedules.some((us) => us.unityId === u.id) && u.active,
      ) ?? [],
    [clientUnitiesData, unitSchedules],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/modules/scheduling/contracts")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">
            Configurador de Plantilla Semanal por Contrato
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Defina los turnos base y dotación necesaria para cada unidad del
            contrato.
          </p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" onClick={handleReload} disabled={!selectedContractId}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Recargar
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/modules/scheduling/contracts")}
          >
            Descartar
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              !selectedContractId || unitSchedules.length === 0 || saving
            }
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Guardar Plantilla
          </Button>
        </div>
      </div>

      {/* Contract & Units Management */}
      <Card className="p-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold">
              Seleccionar Contrato (Cliente)
            </label>
            <div className="flex gap-2">
              <Select
                value={selectedContractId ? String(selectedContractId) : ""}
                onValueChange={(v) => setSelectedContractId(Number(v))}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecciona un contrato..." />
                </SelectTrigger>
                <SelectContent>
                  {availableContracts.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.clientName} - {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate("/modules/scheduling/contracts")}
                title="Ver Contratos"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Gestión de Unidades</label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="flex-1 border-dashed border-2 border-primary/50 bg-primary/5 hover:bg-primary/10"
                onClick={() => setAddUnitDialogOpen(true)}
                disabled={!selectedContractId}
              >
                <MapPin className="mr-2 h-4 w-4" />
                Añadir Unidad
              </Button>
              <div className="flex flex-col text-xs text-muted-foreground">
                <span className="font-bold text-foreground">
                  {unitSchedules.length} Unidades
                </span>
                <span>activas en plantilla</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Weekly Schedule Spreadsheet */}
      {selectedContractId && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[1400px]">
              {/* Header */}
              <thead>
                <tr className="bg-muted/50 border-b h-12">
                  <th className="sticky left-0 z-20 bg-muted/50 p-3 text-xs font-bold uppercase tracking-wider text-muted-foreground w-[220px] shadow-[2px_0_5px_rgba(0,0,0,0.05)] border-r">
                    Unidad / Puesto
                  </th>
                  {DAYS_OF_WEEK.map((day) => (
                    <th
                      key={day}
                      className={cn(
                        "p-3 text-center text-xs font-bold uppercase tracking-wider min-w-[160px] border-r border-border/50",
                        isLeisureDay(day)
                          ? "text-primary bg-primary/5"
                          : "text-muted-foreground",
                      )}
                    >
                      {DayOfWeekLabel[day]}
                    </th>
                  ))}
                  <th className="p-3 text-center text-xs font-bold uppercase tracking-wider w-[80px]">
                    Total Pax
                  </th>
                </tr>
              </thead>

              {/* Body */}
              <tbody className="divide-y divide-border text-sm">
                {unitSchedules.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="p-12 text-center text-muted-foreground"
                    >
                      Selecciona un contrato y añade unidades para comenzar
                    </td>
                  </tr>
                ) : (
                  unitSchedules.map((unitSchedule) => (
                    <tr
                      key={unitSchedule.unityId}
                      className="group hover:bg-muted/30"
                    >
                      {/* Unit Column */}
                      <td className="sticky left-0 z-10 bg-background group-hover:bg-muted/30 p-4 shadow-[2px_0_5px_rgba(0,0,0,0.05)] border-r align-top">
                        <div className="flex flex-col gap-2 h-full justify-between min-h-[120px]">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="h-5 w-5 text-primary shrink-0" />
                              <span className="font-semibold text-sm">
                                {unitSchedule.unityName}
                              </span>
                            </div>
                            {unitSchedule.unityCode && (
                              <span className="text-xs text-muted-foreground font-mono pl-7 block">
                                {unitSchedule.unityCode}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                handleRemoveUnit(unitSchedule.unityId)
                              }
                              title="Eliminar Unidad"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </td>

                      {/* Day Columns */}
                      {unitSchedule.days.map((daySchedule) => (
                        <td
                          key={daySchedule.dayOfWeek}
                          className={cn(
                            "p-2 border-r border-border/50 align-top",
                            isLeisureDay(daySchedule.dayOfWeek) &&
                              "bg-primary/5",
                          )}
                        >
                          <div className="flex flex-col gap-1.5 min-h-[120px]">
                            {/* Turn Cards */}
                            {daySchedule.turns.map((turn, turnIdx) => (
                              <div
                                key={`${turn.id}-${turnIdx}`}
                                className={cn(
                                  "rounded shadow-sm p-1.5 relative group/shift cursor-pointer hover:border-primary transition-all border",
                                  turn.turnType === TurnType.DAY
                                    ? "bg-white border-gray-200"
                                    : "bg-slate-800 border-slate-700",
                                )}
                              >
                                <div className="flex justify-between items-center mb-1">
                                  <span
                                    className={cn(
                                      "text-[11px] font-bold truncate",
                                      turn.turnType === TurnType.DAY
                                        ? "text-gray-800"
                                        : "text-white",
                                    )}
                                  >
                                    {turn.name}
                                  </span>
                                  <span
                                    className={cn(
                                      "text-[12px] font-bold px-1.5 rounded",
                                      turn.turnType === TurnType.DAY
                                        ? "bg-gray-100 text-gray-600"
                                        : "bg-slate-700 text-slate-300",
                                    )}
                                  >
                                    {turn.numGuards}
                                  </span>
                                </div>
                                <div
                                  className={cn(
                                    "text-[12px] flex items-center gap-1",
                                    turn.turnType === TurnType.DAY
                                      ? "text-muted-foreground "
                                      : "text-slate-400",
                                  )}
                                >
                                  <Clock className="h-2.5 w-2.5" />
                                  {turn.timeFrom} - {turn.timeTo}
                                </div>
                                <button
                                  className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover/shift:opacity-100 hover:bg-destructive/90 transition-all shadow-sm transform scale-75"
                                  onClick={() =>
                                    handleRemoveTurn(
                                      unitSchedule.unityId,
                                      daySchedule.dayOfWeek,
                                      turnIdx,
                                    )
                                  }
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}

                            {/* Add Turn Button */}
                            <button
                              className="mt-auto w-full border border-dashed border-border hover:border-primary hover:text-primary text-muted-foreground rounded-md py-1 flex items-center justify-center transition-colors hover:bg-muted/50"
                              onClick={() =>
                                setAddTurnDialog({
                                  open: true,
                                  unityId: unitSchedule.unityId,
                                  dayOfWeek: daySchedule.dayOfWeek,
                                })
                              }
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      ))}

                      {/* Total Column */}
                      <td className="p-4 text-center font-bold align-middle">
                        {getTotalGuardsForUnit(unitSchedule.unityId)} pax
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

              {/* Footer */}
              <tfoot className="bg-muted/50 border-t-2 font-bold text-sm">
                <tr>
                  <td className="p-4 flex items-center gap-2">
                    <span>Totales por Día</span>
                  </td>
                  {DAYS_OF_WEEK.map((day) => (
                    <td
                      key={day}
                      className={cn(
                        "p-3 text-center",
                        isLeisureDay(day) && "text-primary bg-primary/5",
                      )}
                    >
                      {getTotalGuardsForDay(day)} pax
                    </td>
                  ))}
                  <td className="p-3 text-center border-l">
                    {unitSchedules.reduce(
                      (total, us) => total + getTotalGuardsForUnit(us.unityId),
                      0,
                    )}{" "}
                    pax
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-8 items-center text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">
          Leyenda de Turnos:
        </span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border border-gray-300 rounded shadow-sm"></div>
          <span>Turno Día</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-800 border border-slate-700 rounded shadow-sm"></div>
          <span>Turno Noche</span>
        </div>
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Añadir Plantilla de Turno</span>
        </div>
      </div>

      {/* Add Unit Dialog */}
      <Dialog open={addUnitDialogOpen} onOpenChange={setAddUnitDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Añadir Unidad al Contrato</DialogTitle>
            <DialogDescription>
              Selecciona una unidad del cliente para configurar su horario
              semanal
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4 max-h-[60vh] overflow-y-auto">
            {availableUnits.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8">
                No hay más unidades disponibles para este cliente
              </div>
            ) : (
              availableUnits.map((unity) => (
                <Card
                  key={unity.id}
                  className="cursor-pointer transition-colors hover:bg-muted/50 p-3"
                  onClick={() => handleAddUnit(unity)}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">{unity.name}</p>
                      {unity.code && (
                        <p className="text-xs text-muted-foreground font-mono">
                          {unity.code}
                        </p>
                      )}
                    </div>
                    <Button size="sm" variant="outline">
                      <Plus className="mr-2 h-3 w-3" />
                      Añadir
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Turn Dialog */}
      <Dialog
        open={addTurnDialog.open}
        onOpenChange={(open) => !open && setAddTurnDialog({ open: false })}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Agregar Turno -{" "}
              {addTurnDialog.dayOfWeek != null &&
                DayOfWeekLabel[addTurnDialog.dayOfWeek]}
            </DialogTitle>
            <DialogDescription>
              Selecciona una plantilla de turno para asignar a este día
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4 max-h-[60vh] overflow-y-auto">
            {allTurnTemplates.map((turn) => (
              <Card
                key={turn.id}
                className="cursor-pointer transition-colors hover:bg-muted/50 p-4"
                onClick={() => handleAddTurn(turn)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{turn.name}</p>
                      <Badge
                        variant={
                          turn.turnType === TurnType.DAY
                            ? "default"
                            : "secondary"
                        }
                      >
                        {TurnTypeLabel[turn.turnType]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="font-mono">
                          {turn.timeFrom} - {turn.timeTo}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        <span>
                          {turn.numGuards}{" "}
                          {turn.numGuards === 1 ? "guardia" : "guardias"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
