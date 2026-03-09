import React from "react"
import type { Option } from "../custom/MultipleSelector"
import { SearchableSelector } from "../SearchableSelector"
import { useGetSpecialServiceSchedulesQuery } from "@/features/specialService/schedule/api/specialServiceScheduleApi"
import type { SpecialServiceScheduleSummaryDto } from "@/features/specialService/schedule/api/specialServiceScheduleModel"

// ─── Transform ────────────────────────────────────────────────────────────────

const scheduleToOption = (s: SpecialServiceScheduleSummaryDto): Option => ({
  value: String(s.id),
  label: `${s.specialServiceUnityName ?? `Servicio #${s.id}`} — ${s.dateFrom ?? "?"} → ${s.dateTo ?? "?"}`,
})

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SpecialServiceScheduleSelectorProps {
  value?: number
  onChange?: (value: number | undefined) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export const SpecialServiceScheduleSelector: React.FC<SpecialServiceScheduleSelectorProps> = ({
  value,
  onChange,
  disabled,
  placeholder = "Buscar servicio especial...",
  className,
}) => {
  const optionValue = React.useMemo(() => {
    if (value === undefined) return undefined
    return { value: String(value), label: "" }
  }, [value])

  const handleChange = React.useCallback(
    (selected: Option | Option[]) => {
      if (!onChange) return
      const option = Array.isArray(selected) ? selected[0] : selected
      onChange(option ? Number(option.value) : undefined)
    },
    [onChange],
  )

  return (
    <SearchableSelector<SpecialServiceScheduleSummaryDto>
      useQueryHook={useGetSpecialServiceSchedulesQuery}
      queryField="specialServiceUnity.unityName"
      toOption={scheduleToOption}
      multiple={false}
      value={optionValue}
      onChange={handleChange}
      placeholder={placeholder}
      emptyIndicator="No se encontraron horarios"
      loadingIndicator="Buscando horarios..."
      disabled={disabled}
      className={className}
      minCharsToSearch={0}
      maxItems={20}
      commandLabel="Seleccionar horario de servicio especial"
    />
  )
}
