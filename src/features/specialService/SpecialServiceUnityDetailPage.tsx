import { useNavigate, useParams } from "react-router-dom"
import { useGetSpecialServiceUnityByIdQuery } from "./api/specialServiceUnityApi"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CalendarDays, FileText, Loader2, MapPin, Pencil } from "lucide-react"

// ─── Helper ────────────────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value ?? "—"}</p>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export const SpecialServiceUnityDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const unityId = Number(id)

  const { data: unity, isLoading } = useGetSpecialServiceUnityByIdQuery(unityId)

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
        <Button
          variant="outline"
          onClick={() => navigate("/modules/special-services/unities")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
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
          onClick={() => navigate("/modules/special-services/unities")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-muted-foreground" />
            <h1 className="text-2xl font-bold">{unity.unityName}</h1>
            {unity.active ? (
              <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50 dark:bg-green-900/20">
                Activo
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                Inactivo
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground font-mono">{unity.code}</p>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            navigate(`/modules/special-services/unities/${unity.id}/edit`)
          }
        >
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </div>

      {/* Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Datos generales */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Datos Generales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow label="Nombre del Establecimiento" value={unity.unityName} />
            <DetailRow label="Código" value={unity.code} />
            <DetailRow label="Descripción" value={unity.unityDescription} />
          </CardContent>
        </Card>

        {/* Ubicación */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow label="Dirección" value={unity.address} />
          </CardContent>
        </Card>

        {/* Registro */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Registro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow label="Creado" value={unity.createdAt?.split("T")[0]} />
            <DetailRow label="Última Actualización" value={unity.updatedAt?.split("T")[0]} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
