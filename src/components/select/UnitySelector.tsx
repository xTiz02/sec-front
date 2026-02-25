import type { UnityDto } from "@/features/unity/api/unityModel"
import React from "react"
import type { Option } from "../custom/MultipleSelector"
import { SearchableSelector } from "../SearchableSelector"
import { useGetUnitiesQuery } from "@/features/unity/api/unityApi"

// ─── Transform ────────────────────────────────────────────────────────────────

const unityToOption = (unity: UnityDto): Option => ({
  value: String(unity.id),
  label: unity.name,
  disable: !unity.active,
})

// ─── Props ────────────────────────────────────────────────────────────────────

export interface UnitySelectorProps {
  /** Single selected unity ID or multiple IDs */
  value?: number | number[]

  /** On change callback */
  onChange?: (value: number | number[]) => void

  /** Multiple selection mode */
  multiple?: boolean

  /** Disabled state */
  disabled?: boolean

  /** Placeholder text */
  placeholder?: string

  /** className */
  className?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export const UnitySelector: React.FC<UnitySelectorProps> = ({
  value,
  onChange,
  multiple = false,
  disabled,
  placeholder = "Buscar unidad...",
  className,
}) => {
  // Convert value to Option format
  const optionValue = React.useMemo(() => {
    if (value === undefined) return undefined

    if (multiple) {
      const ids = Array.isArray(value) ? value : [value]
      return ids.map(id => ({ value: String(id), label: "" }))
    }

    const id = Array.isArray(value) ? value[0] : value
    return { value: String(id), label: "" }
  }, [value, multiple])

  // Handle change from Option to number/number[]
  const handleChange = React.useCallback(
    (selected: Option | Option[]) => {
      if (!onChange) return

      if (multiple) {
        const options = Array.isArray(selected) ? selected : [selected]
        const ids = options.map(opt => Number(opt.value))
        onChange(ids)
      } else {
        const option = Array.isArray(selected) ? selected[0] : selected
        onChange(option ? Number(option.value) : null)
      }
    },
    [onChange, multiple],
  )

  return (
    <SearchableSelector<UnityDto>
      useQueryHook={useGetUnitiesQuery}
      queryField="name"
      toOption={unityToOption}
      multiple={multiple}
      value={optionValue}
      onChange={handleChange}
      placeholder={placeholder}
      emptyIndicator="No se encontraron unidades"
      loadingIndicator="Buscando unidades..."
      disabled={disabled}
      className={className}
      minCharsToSearch={2}
      maxItems={20}
      commandLabel="Seleccionar unidad"
    />
  )
}