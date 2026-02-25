import React from "react"
import { cn } from "@/lib/utils"
import { useLocation } from "react-router-dom"

const Breadcrumb: React.FC = () => {
  const location = useLocation()
  const parts = location.pathname.split("/").filter(Boolean)

 const labelMap: Record<string, string> = {
    modules: "Módulos",
    dashboard: "Dashboard",
    personal: "Personal",
    employees: "Empleados",
    guards: "Guardias",
    "private-guards": "Guardias Privados",
    clients: "Clientes",
    units: "Unidades",
    scheduling: "Programación",
    monthly: "Horarios Mensuales",
    assignments: "Asignaciones",
    templates: "Plantillas",
    attendance: "Asistencia",
    daily: "Registro Diario",
    history: "Historial",
    requests: "Solicitudes",
    reports: "Reportes",
    security: "Seguridad",
    users: "Usuarios",
    profiles: "Perfiles",
    settings: "Configuración",
  }

  return (
    <nav className="flex items-center gap-1.5 text-sm pl-2">
      {parts.map((part, i) => {
        const isLast = i === parts.length - 1
        return (
          <React.Fragment key={part}>
            {i > 0 && <span className="text-slate-300">/</span>}
            <span
              className={cn(
                isLast
                          ? "font-semibold text-slate-800"
                  : "text-slate-400",
              )}
            >
              {labelMap[part] ?? part}
            </span>
          </React.Fragment>
        )
      })}
    </nav>
  )
}

export default Breadcrumb