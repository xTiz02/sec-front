import { useNavigate, useParams } from "react-router-dom"
import { useGetUnityByIdQuery } from "./api/unityApi"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, MapPin, Navigation, Building2, Calendar } from "lucide-react"

export const UnityDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const unityId = Number(id)

  const { data: unity, isLoading } = useGetUnityByIdQuery(unityId)

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!unity) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground">Unidad no encontrada</p>
        <Button variant="outline" onClick={() => navigate("/modules/units")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Unidades
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
          onClick={() => navigate("/modules/units")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-muted-foreground" />
            <h1 className="text-2xl font-bold">{unity.name}</h1>
            {unity.active ? (
              <Badge variant="outline" className="border-green-500 text-green-600">
                Activa
              </Badge>
            ) : (
              <Badge variant="outline" className="border-destructive text-destructive">
                Inactiva
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground font-mono">{unity.code}</p>
        </div>
      </div>

      {/* Info Grid - 3 columns */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Client */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {unity.clientName ? (
              <button
                onClick={() => navigate(`/modules/clients/${unity.clientId}`)}
                className="text-sm font-medium text-primary hover:underline text-left"
              >
                {unity.clientName}
              </button>
            ) : (
              <p className="text-sm text-muted-foreground">—</p>
            )}
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Descripción
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{unity.description || "—"}</p>
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
            <p className="text-sm">{unity.direction || "—"}</p>
          </CardContent>
        </Card>

        {/* GPS Coordinates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              Coordenadas GPS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Latitud</p>
              <p className="text-sm font-mono">
                {unity.latitude != null ? unity.latitude.toFixed(6) : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Longitud</p>
              <p className="text-sm font-mono">
                {unity.longitude != null ? unity.longitude.toFixed(6) : "—"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Coverage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cobertura GPS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {unity.rangeCoverage != null ? `${unity.rangeCoverage} metros` : "—"}
            </p>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Registro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Creada</p>
              <p className="text-sm">
                {unity.createdAt
                  ? new Date(unity.createdAt).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Actualizada</p>
              <p className="text-sm">
                {unity.updatedAt
                  ? new Date(unity.updatedAt).toLocaleDateString("es-ES", {
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
    </div>
  )
}