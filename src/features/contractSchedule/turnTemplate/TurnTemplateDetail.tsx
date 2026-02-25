import { useNavigate, useParams } from "react-router-dom"
import { useGetTurnTemplateByIdQuery } from "../api/contractScheduleApi"
import { TurnTypeLabel } from "../api/contractScheduleModel"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, Clock, Users } from "lucide-react"
import { calculateDuration } from "@/utils/helpers"

export const TurnTemplateDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const turnTemplateId = Number(id)

  const { data: turnTemplate, isLoading } = useGetTurnTemplateByIdQuery(turnTemplateId)

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!turnTemplate) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground">Plantilla de turno no encontrada</p>
        <Button
          variant="outline"
          onClick={() => navigate("/modules/scheduling/turn-templates")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Plantillas
        </Button>
      </div>
    )
  }

  const duration = calculateDuration(turnTemplate.timeFrom, turnTemplate.timeTo)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/modules/scheduling/turn-templates")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-muted-foreground" />
            <h1 className="text-2xl font-bold">{turnTemplate.name}</h1>
            <Badge variant={turnTemplate.turnType === 0 ? "default" : "secondary"}>
              {TurnTypeLabel[turnTemplate.turnType]}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Plantilla de turno reutilizable
          </p>
        </div>
      </div>

      {/* Info Grid - 3 columns */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Time Range */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Hora Inicio</p>
              <p className="text-lg font-mono font-medium">{turnTemplate.timeFrom}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Hora Fin</p>
              <p className="text-lg font-mono font-medium">{turnTemplate.timeTo}</p>
            </div>
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">Duración</p>
              <p className="text-sm font-medium">{duration}</p>
            </div>
          </CardContent>
        </Card>

        {/* Guards */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Guardias Requeridos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{turnTemplate.numGuards}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {turnTemplate.numGuards === 1 ? "guardia" : "guardias"} por turno
            </p>
          </CardContent>
        </Card>

        {/* Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tipo de Turno
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant={turnTemplate.turnType === 0 ? "default" : "secondary"}
              className="text-base px-3 py-1"
            >
              {TurnTypeLabel[turnTemplate.turnType]}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              {turnTemplate.turnType === 0
                ? "Turno durante el día"
                : "Turno durante la noche"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
