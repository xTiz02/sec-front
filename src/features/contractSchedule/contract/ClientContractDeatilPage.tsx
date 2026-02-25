import { useNavigate, useParams } from "react-router-dom"
import {
  useGetClientContractByIdQuery,
  useGetWeeklyScheduleByContractIdQuery,
} from "../api/contractScheduleApi"
import { DayOfWeekLabel, DayOfWeekShortLabel, TurnType } from "../api/contractScheduleModel"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Loader2,
  FileText,
  Building2,
  MapPin,
  Calendar,
  Clock,
  Users,
  Edit,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { isLeisureDay } from "@/utils/helpers"

export const ClientContractDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const contractId = Number(id)

  const { data: contract, isLoading } = useGetClientContractByIdQuery(contractId)
  const { data: weeklySchedules = [] } = useGetWeeklyScheduleByContractIdQuery(contractId)

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground">Contrato no encontrado</p>
        <Button variant="outline" onClick={() => navigate("/modules/scheduling/contracts")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Contratos
        </Button>
      </div>
    )
  }

  const hasSchedules = weeklySchedules.length > 0

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
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-muted-foreground" />
            <h1 className="text-2xl font-bold">{contract.name}</h1>
            {contract.active ? (
              <Badge variant="outline" className="border-green-500 text-green-600">
                Activo
              </Badge>
            ) : (
              <Badge variant="outline" className="border-destructive text-destructive">
                Inactivo
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Contrato de cliente con plantilla semanal
          </p>
        </div>
        <Button onClick={() => navigate("/modules/scheduling/weekly-builder")}>
          <Edit className="mr-2 h-4 w-4" />
          {hasSchedules ? "Editar Plantilla" : "Configurar Plantilla"}
        </Button>
      </div>

      {/* Info Grid - 3 columns */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contract.clientName ? (
              <button
                onClick={() => navigate(`/modules/clients/${contract.clientId}`)}
                className="text-lg font-medium text-primary hover:underline text-left"
              >
                {contract.clientName}
              </button>
            ) : (
              <p className="text-sm text-muted-foreground">—</p>
            )}
            {contract.clientCode && (
              <p className="text-xs text-muted-foreground font-mono mt-1">
                {contract.clientCode}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Descripción
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{contract.description || "—"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Registro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Creado</p>
              <p className="text-sm">
                {contract.createdAt
                  ? new Date(contract.createdAt).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Actualizado</p>
              <p className="text-sm">
                {contract.updatedAt
                  ? new Date(contract.updatedAt).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Weekly Schedules Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Plantilla Semanal</h2>
          <Badge variant="secondary">
            {weeklySchedules.length} {weeklySchedules.length === 1 ? "unidad" : "unidades"}
          </Badge>
        </div>

        {hasSchedules ? (
          <div className="space-y-6">
            {weeklySchedules.map(unitSchedule => (
              <Card key={unitSchedule.unityId} className="overflow-hidden">
                <CardHeader className="bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{unitSchedule.unityName}</CardTitle>
                        {unitSchedule.unityCode && (
                          <p className="text-xs text-muted-foreground font-mono mt-1">
                            {unitSchedule.unityCode}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/modules/units/${unitSchedule.unityId}`)}
                    >
                      Ver Unidad
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {unitSchedule.schedules.map(daySchedule => (
                      <div
                        key={daySchedule.dayOfWeek}
                        className={cn(
                          "rounded-lg border p-4 space-y-3",
                          isLeisureDay(daySchedule.dayOfWeek) && "bg-primary/5 border-primary/20",
                        )}
                      >
                        {/* Day Header */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">
                              {DayOfWeekShortLabel[daySchedule.dayOfWeek]}
                            </p>
                            <p className="font-semibold">
                              {DayOfWeekLabel[daySchedule.dayOfWeek]}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm font-bold">{daySchedule.numOfGuards}</span>
                          </div>
                        </div>

                        {/* Turns */}
                        {daySchedule.turns.length > 0 ? (
                          <div className="space-y-2">
                            {daySchedule.turns.map((turn, idx) => (
                              <div
                                key={`${turn.id}-${idx}`}
                                className={cn(
                                  "rounded-md p-2 border text-sm",
                                  turn.turnType === TurnType.DAY
                                    ? ""
                                    : "bg-slate-800 border-slate-700 text-white",
                                )}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-semibold truncate">{turn.name}</span>
                                  <Badge
                                    variant={turn.turnType === TurnType.DAY ? "outline" : "secondary"}
                                    className="text-[10px] h-4 px-1"
                                  >
                                    {turn.numGuards}
                                  </Badge>
                                </div>
                                <div
                                  className={cn(
                                    "flex items-center gap-1 text-[12px]",
                                    turn.turnType === TurnType.DAY
                                      ? "text-muted-foreground"
                                      : "text-slate-400",
                                  )}
                                >
                                  <Clock className="h-2.5 w-2.5" />
                                  {turn.timeFrom} - {turn.timeTo}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground text-center py-2">
                            Sin turnos
                          </p>
                        )}

                        {/* Summary badges */}
                        {(daySchedule.numTurnDay > 0 || daySchedule.numTurnNight > 0) && (
                          <div className="flex gap-2 pt-2 border-t">
                            {daySchedule.numTurnDay > 0 && (
                              <Badge variant="outline" className="text-[10px] h-5">
                                {daySchedule.numTurnDay} día
                              </Badge>
                            )}
                            {daySchedule.numTurnNight > 0 && (
                              <Badge variant="secondary" className="text-[10px] h-5">
                                {daySchedule.numTurnNight} noche
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Calendar className="h-16 w-16 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium">Sin plantilla semanal configurada</p>
              <p className="text-sm text-muted-foreground mt-2">
                Este contrato no tiene una plantilla semanal de turnos
              </p>
              <Button
                className="mt-6"
                onClick={() => navigate("/modules/scheduling/weekly-builder")}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Configurar Plantilla Semanal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}