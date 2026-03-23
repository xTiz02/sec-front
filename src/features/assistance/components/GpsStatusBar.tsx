import { cn } from "@/lib/utils"
import { Loader2, Wifi, WifiOff } from "lucide-react"

interface GpsStatusBarProps {
  distanceMeters: number | null
  isInRange: boolean | null
  error: string | null
  allowedRadius: number
}

export function GpsStatusBar({ distanceMeters, isInRange, error, allowedRadius }: GpsStatusBarProps) {
  if (error) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive text-xs font-medium">
        <WifiOff className="h-3.5 w-3.5 shrink-0" />
        <span>GPS: {error}</span>
      </div>
    )
  }

  if (isInRange === null) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-muted/60 text-muted-foreground text-xs">
        <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
        <span>Obteniendo ubicación GPS...</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-2 text-xs font-medium",
        isInRange
          ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
          : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300",
      )}
    >
      <div className="flex items-center gap-2">
        {isInRange ? (
          <Wifi className="h-3.5 w-3.5 shrink-0" />
        ) : (
          <WifiOff className="h-3.5 w-3.5 shrink-0" />
        )}
        <span>
          {isInRange
            ? `GPS activo · ${distanceMeters}m del punto`
            : `Fuera de rango · ${distanceMeters}m (máx. ${allowedRadius}m)`}
        </span>
      </div>
      <span className={cn("font-bold", isInRange ? "text-emerald-600" : "text-amber-600")}>
        {isInRange ? "En rango" : "Fuera de rango"}
      </span>
    </div>
  )
}
