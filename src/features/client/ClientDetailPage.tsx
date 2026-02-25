import { useNavigate, useParams } from "react-router-dom"
import {
  useGetClientByIdQuery,
} from "./api/clientApi"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Building2, Loader2, MapPin, Navigation } from "lucide-react"
import { useGetUnitiesQuery } from "../unity/api/unityApi"

export const ClientDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const clientId = Number(id)

  const { data: client, isLoading } = useGetClientByIdQuery(clientId)
  const { data: unitsData } = useGetUnitiesQuery({
    page: 0,
    size: 100,
    query: `clientId:${clientId},`,
  })

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!client) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground">Cliente no encontrado</p>
        <Button variant="outline" onClick={() => navigate("/modules/clients")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Clientes
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
          onClick={() => navigate("/modules/clients")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-muted-foreground" />
            <h1 className="text-2xl font-bold">{client.name}</h1>
            {client.active ? (
              <Badge variant="outline" className="border-green-500 text-green-600">
                Activo
              </Badge>
            ) : (
              <Badge variant="outline" className="border-destructive text-destructive">
                Inactivo
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground font-mono">{client.code}</p>
        </div>
      </div>

      {/* Info Grid - 3 columns */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Descripción
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{client.description || "—"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Dirección
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{client.direction || "—"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fecha de Creación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {client.createdAt
                ? new Date(client.createdAt).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Última Actualización
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {client.updatedAt
                ? new Date(client.updatedAt).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Units Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Unidades Asociadas</h2>
          <Badge variant="secondary">
            {unitsData?.totalElements ?? 0}{" "}
            {unitsData?.totalElements === 1 ? "unidad" : "unidades"}
          </Badge>
        </div>

        {unitsData && unitsData.content.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {unitsData.content.map(unit => (
              <Card
                key={unit.id}
                className="cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => navigate(`/modules/units/${unit.id}`)}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <p className="font-medium text-sm">{unit.name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">
                        {unit.code}
                      </p>
                    </div>
                    {unit.active ? (
                      <Badge
                        variant="outline"
                        className="text-xs border-green-500 text-green-600"
                      >
                        Activa
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-xs border-destructive text-destructive"
                      >
                        Inactiva
                      </Badge>
                    )}
                  </div>
                  {unit.description && (
                    <p className="text-xs text-muted-foreground">{unit.description}</p>
                  )}
                  {unit.direction && (
                    <p className="text-xs flex items-start gap-1.5">
                      <MapPin className="h-3 w-3 mt-0.5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">{unit.direction}</span>
                    </p>
                  )}
                  {(unit.latitude != null || unit.rangeCoverage != null) && (
                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                      {unit.latitude != null && unit.longitude != null && (
                        <span className="flex items-center gap-1">
                          <Navigation className="h-3 w-3" />
                          GPS: {unit.latitude.toFixed(4)}, {unit.longitude.toFixed(4)}
                        </span>
                      )}
                      {unit.rangeCoverage != null && (
                        <span>Rango: {unit.rangeCoverage}m</span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">
                Este cliente no tiene unidades registradas
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}