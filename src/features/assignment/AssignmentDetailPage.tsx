import { useNavigate, useParams } from "react-router-dom"
import { useGetAssignmentByIdQuery } from "./api/assignmentApi"
import { ZoneTypeLabel, MonthLabel } from "./api/assignmentModel"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  Loader2,
  MapPin,
  Pencil,
  User,
} from "lucide-react"

export const AssignmentDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const assignmentId = Number(id)

  const { data: assignment, isLoading } = useGetAssignmentByIdQuery(assignmentId)

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground">Asignación no encontrada</p>
        <Button
          variant="outline"
          onClick={() => navigate("/modules/scheduling/assignments")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Asignaciones
        </Button>
      </div>
    )
  }

  const emp = assignment.employee
  const schedule = assignment.scheduleMonthly
  const units = assignment.unitAssignments ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/modules/scheduling/assignments")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <User className="h-6 w-6 text-muted-foreground" />
            <h1 className="text-2xl font-bold">
              {emp ? `${emp.firstName} ${emp.lastName}` : `Asignación #${assignment.id}`}
            </h1>
            <Badge variant="secondary" className="gap-1.5">
              <MapPin className="h-3 w-3" />
              {ZoneTypeLabel[assignment.zoneType]}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {MonthLabel[assignment.month]} {assignment.year}
            {emp?.documentNumber && ` — ${emp.documentNumber}`}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            navigate(`/modules/scheduling/assignments/${assignment.id}/edit`)
          }
        >
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </div>

      {/* Info Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Employee */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Jefe de Operaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Nombre</p>
              <p className="text-sm font-medium">
                {emp ? `${emp.firstName} ${emp.lastName}` : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Documento</p>
              <p className="text-sm font-mono">{emp?.documentNumber ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm">{emp?.email ?? "—"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Period */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Período
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Mes</p>
              <p className="text-sm font-medium">{MonthLabel[assignment.month]}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Año</p>
              <p className="text-sm">{assignment.year}</p>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Monthly */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horario Mensual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {schedule ? (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">Nombre</p>
                  <p className="text-sm font-medium">{schedule.name}</p>
                </div>
                {schedule.description && (
                  <div>
                    <p className="text-xs text-muted-foreground">Descripción</p>
                    <p className="text-sm">{schedule.description}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Sin horario mensual asignado</p>
            )}
          </CardContent>
        </Card>

        {/* Zone */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Zona Principal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="gap-1.5">
              <MapPin className="h-3 w-3" />
              {ZoneTypeLabel[assignment.zoneType]}
            </Badge>
          </CardContent>
        </Card>

        {/* Created At */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fecha de Creación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {assignment.createdAt
                ? new Date(assignment.createdAt).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </p>
          </CardContent>
        </Card>

        {/* Units Count */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Total de Unidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{units.length}</p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Units Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Unidades Asignadas</h2>
          <Badge variant="secondary">{units.length} unidades</Badge>
        </div>

        {units.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {units.map(ua => (
              <Card
                key={ua.id}
                className="cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => navigate(`/modules/units/${ua.unityId}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="font-medium text-sm truncate">
                        {ua.unity?.name ?? `Unidad #${ua.unityId}`}
                      </p>
                      {ua.unity?.code && (
                        <p className="text-xs font-mono text-muted-foreground">
                          {ua.unity.code}
                        </p>
                      )}
                      {ua.unity?.clientName && (
                        <p className="text-xs text-muted-foreground">
                          {ua.unity.clientName}
                        </p>
                      )}
                      <Badge variant="outline" className="text-[10px] gap-1 mt-1">
                        <MapPin className="h-2.5 w-2.5" />
                        {ZoneTypeLabel[ua.zoneType]}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">
                No hay unidades asignadas a esta supervisión
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
