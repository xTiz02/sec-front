import type { EmployeeDto } from "@/features/employee/api/employeeModel"
import React from "react"
import type { Option } from "../custom/MultipleSelector"
import { SearchableSelector } from "../SearchableSelector"
import { useGetEmployeesQuery } from "@/features/employee/api/employeeApi"

// ─── Transform ────────────────────────────────────────────────────────────────

const employeeToOption = (employee: EmployeeDto): Option => ({
  value: String(employee.id),
  label: `${employee.firstName} ${employee.lastName}`,
})

// ─── Props ────────────────────────────────────────────────────────────────────

export interface EmployeeSelectorProps {
  value?: number | number[]
  onChange?: (value: number | number[]) => void
  multiple?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({
  value,
  onChange,
  multiple = false,
  disabled,
  placeholder = "Buscar empleado...",
  className,
}) => {
  const optionValue = React.useMemo(() => {
    if (value === undefined) return undefined

    if (multiple) {
      const ids = Array.isArray(value) ? value : [value]
      return ids.map(id => ({ value: String(id), label: "" }))
    }

    const id = Array.isArray(value) ? value[0] : value
    return { value: String(id), label: "" }
  }, [value, multiple])

  const handleChange = React.useCallback(
    (selected: Option | Option[]) => {
      if (!onChange) return

      if (multiple) {
        const options = Array.isArray(selected) ? selected : [selected]
        const ids = options.map(opt => Number(opt.value))
        onChange(ids)
      } else {
        const option = Array.isArray(selected) ? selected[0] : selected
        onChange(option ? Number(option.value) : (null as any))
      }
    },
    [onChange, multiple],
  )

  return (
    <SearchableSelector<EmployeeDto>
      useQueryHook={useGetEmployeesQuery}
      queryField="firstName"
      toOption={employeeToOption}
      multiple={multiple}
      value={optionValue}
      onChange={handleChange}
      placeholder={placeholder}
      emptyIndicator="No se encontraron empleados"
      loadingIndicator="Buscando empleados..."
      disabled={disabled}
      className={className}
      minCharsToSearch={2}
      maxItems={20}
      commandLabel="Seleccionar empleado"
    />
  )
}
