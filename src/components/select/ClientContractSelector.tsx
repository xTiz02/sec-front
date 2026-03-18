import React from "react"
import type { ClientContractDto } from "@/features/contractSchedule/api/contractScheduleModel"
import type { Option } from "../custom/MultipleSelector"
import { SearchableSelector } from "../SearchableSelector"
import { useGetClientContractsQuery } from "@/features/contractSchedule/api/contractScheduleApi"

const contractToOption = (c: ClientContractDto): Option => ({
  value: String(c.id),
  label: c.clientName ? `${c.clientName} — ${c.name}` : c.name,
  disable: !c.active,
})

export interface ClientContractSelectorProps {
  value?: number
  onChange?: (value: number | undefined) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export const ClientContractSelector: React.FC<ClientContractSelectorProps> = ({
  value,
  onChange,
  disabled,
  placeholder = "Buscar contrato...",
  className,
}) => {
  const optionValue = React.useMemo(
    () => (value !== undefined ? { value: String(value), label: "" } : undefined),
    [value],
  )

  const handleChange = React.useCallback(
    (selected: Option | Option[]) => {
      if (!onChange) return
      const option = Array.isArray(selected) ? selected[0] : selected
      onChange(option ? Number(option.value) : undefined)
    },
    
    [onChange],
  )

  return (
    <SearchableSelector<ClientContractDto>
      useQueryHook={useGetClientContractsQuery}
      queryField="name"
      toOption={contractToOption}
      multiple={false}
      value={optionValue}
      onChange={handleChange}
      placeholder={placeholder}
      emptyIndicator="No se encontraron contratos"
      loadingIndicator="Buscando contratos..."
      disabled={disabled}
      className={className}
      minCharsToSearch={1}
      maxItems={20}
      commandLabel="Seleccionar contrato"
    />
  )
}
