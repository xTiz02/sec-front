import type { ClientDto } from "@/features/client/api/clientModel"
import React from "react"
import type { Option } from "../custom/MultipleSelector"
import { SearchableSelector } from "../SearchableSelector"
import { useGetClientsQuery } from "@/features/client/api/clientApi"

// ─── Transform ────────────────────────────────────────────────────────────────

const clientToOption = (client: ClientDto): Option => ({
  value: String(client.id),
  label: client.name,
  disable: !client.active,
})

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ClientSelectorProps {
  /** Single selected client ID or multiple IDs */
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

  /** Include inactive clients in results */
  includeInactive?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ClientSelector: React.FC<ClientSelectorProps> = ({
  value,
  onChange,
  multiple = false,
  disabled,
  placeholder = "Buscar cliente...",
  className,
  includeInactive = false,
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
    <SearchableSelector<ClientDto>
      useQueryHook={useGetClientsQuery}
      queryField="name"
      toOption={clientToOption}
      multiple={multiple}
      value={optionValue}
      onChange={handleChange}
      placeholder={placeholder}
      emptyIndicator="No se encontraron clientes"
      loadingIndicator="Buscando clientes..."
      disabled={disabled}
      className={className}
      minCharsToSearch={2}
      maxItems={20}
      commandLabel="Seleccionar cliente"
    />
  )
}