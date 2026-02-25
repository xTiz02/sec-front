import { useNavigate, useParams } from "react-router-dom"
import { useGetEmployeeByIdQuery } from "./api/employeeApi"
import {
  CountryLabel,
  GenderLabel,
  IdentificationTypeLabel,
} from "./api/employeeModel"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, User, Mail, MapPin, Calendar, FileText } from "lucide-react"

export const EmployeeDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const employeeId = Number(id)

  const { data: employee, isLoading } = useGetEmployeeByIdQuery(employeeId)

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground">Empleado no encontrado</p>
        <Button variant="outline" onClick={() => navigate("/modules/personal/employees")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Empleados
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/modules/personal/employees")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <User className="h-6 w-6 text-muted-foreground" />
            <h1 className="text-2xl font-bold">
              {employee.firstName} {employee.lastName}
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">ID: {employee.id}</p>
        </div>
      </div>

      {/* Info Grid - 3 columns */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                {employee.identificationType != null
                  ? IdentificationTypeLabel[employee.identificationType]
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Número</p>
              <p className="text-sm font-mono">{employee.documentNumber}</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm">{employee.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Teléfono</p>
              <p className="text-sm">{employee.mobilePhone || "—"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Dirección
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{employee.address || "—"}</p>
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Fecha de Nacimiento</p>
              <p className="text-sm">
                {employee.birthDate
                  ? new Date(employee.birthDate).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Género</p>
              <p className="text-sm">
                {employee.gender != null ? GenderLabel[employee.gender] : "—"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Country */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">País</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {employee.country != null ? CountryLabel[employee.country] : "—"}
            </p>
          </CardContent>
        </Card>

        {/* System */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Usuario del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {employee.userId ? `ID: ${employee.userId}` : "No vinculado"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
