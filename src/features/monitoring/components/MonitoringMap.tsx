import { useEffect } from "react"
import L from "leaflet"
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import type { UnitMonitoringStatusDto } from "../api/monitoringModel"

// ─── Fix Leaflet default icon paths in Vite ───────────────────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

// ─── Custom flag icon ─────────────────────────────────────────────────────────

function createUnitIcon(unit: UnitMonitoringStatusDto): L.DivIcon {
  const { arrivedGuards, totalShifts, absentGuards } = unit
  const pct = totalShifts > 0 ? arrivedGuards / totalShifts : 0
  const bgColor =
    absentGuards > 0 ? "#ba1a1a" : pct >= 1 ? "#007a22" : pct > 0 ? "#000666" : "#767683"

  const html = `
    <div style="
      position:relative;
      font-family:Inter,system-ui,sans-serif;
      filter:drop-shadow(0 2px 6px rgba(0,0,0,0.3));
    ">
      <div style="
        background:${bgColor};
        color:#fff;
        padding:5px 9px;
        border-radius:4px;
        white-space:nowrap;
        min-width:110px;
        max-width:180px;
      ">
        <div style="font-weight:700;font-size:11px;overflow:hidden;text-overflow:ellipsis;">
          ${unit.unityName}
        </div>
        <div style="font-size:10px;opacity:0.88;margin-top:2px;">
          ${arrivedGuards}/${totalShifts} guardias
          ${absentGuards > 0 ? `· <span style="color:#ffd6d6;">${absentGuards} falta${absentGuards > 1 ? "s" : ""}</span>` : ""}
        </div>
      </div>
      <div style="
        width:0;height:0;
        border-left:7px solid transparent;
        border-right:7px solid transparent;
        border-top:8px solid ${bgColor};
        margin:0 auto;
      "></div>
    </div>
  `

  return L.divIcon({
    className: "",
    html,
    iconAnchor: [60, 46],
    popupAnchor: [0, -46],
  })
}

// ─── Fit bounds helper ────────────────────────────────────────────────────────

function FitBounds({ units }: { units: UnitMonitoringStatusDto[] }) {
  const map = useMap()
  useEffect(() => {
    const valid = units.filter(u => u.latitude && u.longitude)
    if (valid.length === 0) return
    if (valid.length === 1) {
      map.setView([valid[0].latitude, valid[0].longitude], 14)
      return
    }
    const bounds = L.latLngBounds(valid.map(u => [u.latitude, u.longitude]))
    map.fitBounds(bounds, { padding: [60, 60] })
  }, [units, map])
  return null
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface MonitoringMapProps {
  units: UnitMonitoringStatusDto[]
  onUnitClick: (unit: UnitMonitoringStatusDto) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MonitoringMap({ units, onUnitClick }: MonitoringMapProps) {
  // Default center: Lima, Peru
  const defaultCenter: [number, number] = [-12.0464, -77.0428]

  return (
    <MapContainer
      center={defaultCenter}
      zoom={12}
      scrollWheelZoom
      style={{ width: "100%", height: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds units={units} />

      {units.map(unit => (
        <Marker
          key={unit.contractUnityId}
          position={[unit.latitude, unit.longitude]}
          icon={createUnitIcon(unit)}
          eventHandlers={{ click: () => onUnitClick(unit) }}
        />
      ))}
    </MapContainer>
  )
}
