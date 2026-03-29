import { useNavigate, useParams } from "react-router-dom"
import { useGetGuardByIdQuery } from "./api/guardApi"
import { IdentificationTypeLabel } from "@/features/employee/api/employeeModel"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, Shield, User, FileText, Camera, Pencil } from "lucide-react"

export const GuardDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const guardId = Number(id)

  const { data: guard, isLoading } = useGetGuardByIdQuery(guardId)

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!guard) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground">Guardia no encontrado</p>
        <Button variant="outline" onClick={() => navigate("/modules/personal/guards")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Guardias
        </Button>
      </div>
    )
  }

  const emp = guard.employee

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/modules/personal/guards")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-muted-foreground" />
            <h1 className="text-2xl font-bold">
              {emp ? `${emp.firstName} ${emp.lastName}` : `Guardia #${guard.id}`}
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Código: <span className="font-mono">{guard.code}</span> · Licencia: {guard.licenseNumber}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(`/modules/personal/guards/${guard.id}/edit`)}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </div>

      {/* Info Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Employee Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Empleado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Nombre Completo</p>
              <p className="text-sm font-medium">
                {emp ? `${emp.firstName} ${emp.lastName}` : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm">{emp?.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Teléfono</p>
              <p className="text-sm">{emp?.mobilePhone ?? "—"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Identification */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Identificación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Tipo de Documento</p>
              <p className="text-sm font-medium">
                {emp?.identificationType != null
                  ? IdentificationTypeLabel[emp.identificationType]
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Número de Documento</p>
              <p className="text-sm font-mono">{emp?.documentNumber ?? "—"}</p>
            </div>
          </CardContent>
        </Card>

        {/* License */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Licencia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Código</p>
              <p className="text-sm font-mono font-medium">{guard.code}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Número de Licencia</p>
              <p className="text-sm font-mono font-medium">{guard.licenseNumber}</p>
            </div>
          </CardContent>
        </Card>

        {/* Photo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Foto
            </CardTitle>
          </CardHeader>
          <CardContent>
            {guard.photoUrl ? (
              <img
                src={guard.photoUrl}
                alt="Foto del guardia"
                className="h-32 w-32 rounded-lg object-cover"
              />
            ) : (
              <p className="text-sm text-muted-foreground">Sin foto</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
