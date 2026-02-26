import type { ScheduleMonthlyDto } from "@/features/assignment/api/assignmentModel"
import { MonthLabel } from "@/features/assignment/api/assignmentModel"
import React from "react"
import type { Option } from "../custom/MultipleSelector"
import { SearchableSelector } from "../SearchableSelector"
import { useGetScheduleMonthlyListQuery } from "@/features/assignment/api/assignmentApi"

// ─── Transform ────────────────────────────────────────────────────────────────

const scheduleMonthlyToOption = (schedule: ScheduleMonthlyDto): Option => ({
  value: String(schedule.id),
  label: `${schedule.name} — ${MonthLabel[schedule.month]} ${schedule.year}`,
})

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ScheduleMonthlySelectorProps {
  value?: number
  onChange?: (value: number | null) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ScheduleMonthlySelector: React.FC<ScheduleMonthlySelectorProps> = ({
  value,
  onChange,
  disabled,
  placeholder = "Buscar horario mensual...",
  className,
}) => {
  const optionValue = React.useMemo(() => {
    if (value === undefined || value === null) return undefined
    return { value: String(value), label: "" }
  }, [value])

  const handleChange = React.useCallback(
    (selected: Option | Option[]) => {
      if (!onChange) return
      const option = Array.isArray(selected) ? selected[0] : selected
      onChange(option ? Number(option.value) : null)
    },
    [onChange],
  )

  return (
    <SearchableSelector<ScheduleMonthlyDto>
      useQueryHook={useGetScheduleMonthlyListQuery}
      queryField="name"
      toOption={scheduleMonthlyToOption}
      multiple={false}
      value={optionValue}
      onChange={handleChange}
      placeholder={placeholder}
      emptyIndicator="No se encontraron horarios mensuales"
      loadingIndicator="Buscando horarios..."
      disabled={disabled}
      className={className}
      minCharsToSearch={2}
      maxItems={20}
      commandLabel="Seleccionar horario mensual"
      hideClearAllButton={false}
    />
  )
}
