import { useState, useEffect, useMemo } from "react"
import { haversineMeters } from "../utils/assistanceUtils"

export function useGps(unityLat?: number, unityLon?: number, allowedRadius = 1000) {
  const [coords, setCoords] = useState<{ lat: number; lon: number; accuracy: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("GPS no disponible en este dispositivo")
      return
    }
    const watchId = navigator.geolocation.watchPosition(
      pos => {
        setCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        })
        setError(null)
      },
      err => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 10_000 },
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  const distanceMeters = useMemo(() => {
    if (!coords || unityLat == null || unityLon == null) return null
    return Math.round(haversineMeters(coords.lat, coords.lon, unityLat, unityLon))
  }, [coords, unityLat, unityLon])

  const isInRange = distanceMeters != null ? distanceMeters <= allowedRadius : null

  return { coords, distanceMeters, isInRange, error }
}
