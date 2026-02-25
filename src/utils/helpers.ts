import { DayOfWeek } from "@/features/contractSchedule/api/contractScheduleModel"
import { PermissionType, type UserWithEmployeeDto } from "@/features/securiiy/api/securityModel"

const initials = (user: UserWithEmployeeDto) => {
  if (user.employeeFirstName && user.employeeLastName) {
    return `${user.employeeFirstName[0]}${user.employeeLastName[0]}`.toUpperCase()
  }
  return user.username.slice(0, 2).toUpperCase()
}

const fullName = (user: UserWithEmployeeDto) => {
  if (user.employeeFirstName && user.employeeLastName) {
    return `${user.employeeFirstName} ${user.employeeLastName}`
  }
  return user.username
}


const avatarColor = (username: string) => {
  const colors = [
    "bg-blue-500",
    "bg-violet-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
  ]
  const idx = username.charCodeAt(0) % colors.length
  return colors[idx]
}

const methodColor: Record<PermissionType, string> = {
  [PermissionType.GET]: "bg-emerald-100 text-emerald-700",
  [PermissionType.POST]: "bg-blue-100 text-blue-700",
  [PermissionType.DELETE]: "bg-red-100 text-red-700",
}


function calculateDuration(timeFrom: string, timeTo: string): string {
  const [fromH, fromM] = timeFrom.split(":").map(Number)
  const [toH, toM] = timeTo.split(":").map(Number)

  let totalMinutes = (toH * 60 + toM) - (fromH * 60 + fromM)

  // Handle overnight shifts
  if (totalMinutes < 0) {
    totalMinutes += 24 * 60
  }

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (minutes === 0) {
    return `${hours}h`
  }
  return `${hours}h ${minutes}m`
}

function isLeisureDay(day: DayOfWeek): boolean {
  return day === DayOfWeek.SUNDAY || day === DayOfWeek.SATURDAY
}

export { initials, fullName, avatarColor, methodColor, calculateDuration, isLeisureDay }