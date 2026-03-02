import React, { useState } from "react"
import { NavLink , useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  ChevronDown,
  Building2,
  CalendarDays,
  ClipboardList,
  UserCheck,
  FileBarChart2,
} from "lucide-react"


// ─── Types ────────────────────────────────────────────────────────────────────
export interface NavItem {
  label: string
  icon: React.ReactNode
  path?: string
  children?: { label: string; path: string }[]
}

// ─── Nav config ───────────────────────────────────────────────────────────────
export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    path: "/modules/dashboard",
  },
  {
    label: "Personal",
    icon: <Users size={18} />,
    children: [
      { label: "Empleados", path: "/modules/personal/employees" },
      { label: "Guardias", path: "/modules/personal/guards" },
      { label: "Guardias Privados", path: "/modules/personal/private-guards" },
    ],
  },
  {
    label: "Clientes & Unidades",
    icon: <Building2 size={18} />,
    children: [
      { label: "Clientes", path: "/modules/clients" },
      { label: "Unidades", path: "/modules/units" },
    ],
  },
  {
    label: "Programación",
    icon: <CalendarDays size={18} />,
    children: [
      { label: "Plantillas de Turno", path: "/modules/scheduling/turn-templates" },
      { label: "Contratos de Unidad", path: "/modules/scheduling/contracts" },
      { label: "Configurar Plantilla Semanal", path: "/modules/scheduling/weekly-builder" },
      { label: "Planificador Mensual", path: "/modules/scheduling/monthly-scheduler" },
      { label: "Asignaciones", path: "/modules/scheduling/assignments" },
    ],
  },
  {
    label: "Asistencia",
    icon: <UserCheck size={18} />,
    children: [
      { label: "Registro Diario", path: "/modules/attendance/daily" },
      { label: "Historial", path: "/modules/attendance/history" },
    ],
  },
  {
    label: "Solicitudes",
    icon: <ClipboardList size={18} />,
    path: "/modules/requests",
  },
  {
    label: "Reportes",
    icon: <FileBarChart2 size={18} />,
    path: "/modules/reports",
  },
  {
    label: "Seguridad",
    icon: <Shield size={18} />,
    children: [
      { label: "Usuarios", path: "/modules/security/users" },
      { label: "Perfiles", path: "/modules/security/profiles" },
    ],
  },
  {
    label: "Configuración",
    icon: <Settings size={18} />,
    path: "/modules/settings",
  },
]

// ─── Sidebar Nav Item ─────────────────────────────────────────────────────────
const SidebarNavItem: React.FC<{
  item: NavItem
  collapsed: boolean
  depth?: number
}> = ({ item, collapsed, depth = 0 }) => {
  const location = useLocation()
  const [open, setOpen] = useState(() => {
    if (!item.children) return false
    return item.children.some(c => location.pathname.startsWith(c.path))
  })

  const isActive = item.path
    ? location.pathname === item.path || location.pathname.startsWith(item.path + "/")
    : item.children?.some(c => location.pathname.startsWith(c.path)) ?? false

  if (item.children) {
    if (collapsed) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={cn(
                  "flex w-full items-center justify-center rounded-lg p-2.5 transition-colors",
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white",
                )}
              >
                {item.icon}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="ml-2">
              {item.label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              isActive
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white",
            )}
          >
            <span className="shrink-0">{item.icon}</span>
            <span className="flex-1 text-left font-medium">{item.label}</span>
            <ChevronDown
              size={14}
              className={cn(
                "shrink-0 transition-transform duration-200",
                open && "rotate-180",
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-1 ml-4 space-y-0.5 border-l border-slate-700 pl-3">
            {item.children.map(child => (
              <NavLink
                key={child.path}
                to={child.path}
                className={({ isActive }) =>
                  cn(
                    "block rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-slate-700 text-white font-medium"
                      : "text-slate-400 hover:text-white hover:bg-slate-800",
                  )
                }
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink
              to={item.path!}
              className={({ isActive }) =>
                cn(
                  "flex w-full items-center justify-center rounded-lg p-2.5 transition-colors",
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white",
                )
              }
            >
              {item.icon}
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right" className="ml-2">
            {item.label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <NavLink
      to={item.path!}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
          isActive
            ? "bg-slate-800 text-white font-medium"
            : "text-slate-400 hover:bg-slate-800 hover:text-white",
        )
      }
    >
      <span className="shrink-0">{item.icon}</span>
      <span className="font-medium">{item.label}</span>
    </NavLink>
  )
}

export default SidebarNavItem