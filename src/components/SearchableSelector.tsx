import type { PageResponse } from "@/features/securiiy/api/securityModel"
import MultipleSelector, { type Option } from "./custom/MultipleSelector"
import { useDebounce } from "@/hooks/useDebounse"
import React, { useCallback, useEffect, useState } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SearchableSelectorConfig<T> {
  /** RTK Query hook to fetch data */
  useQueryHook: (params: {
    page?: number
    size?: number
    query?: string
  }) => { data?: PageResponse<T>; isLoading: boolean; isFetching: boolean }

  /** Field name for query string filter (e.g., "name", "code", "client.name") */
  queryField: string

  /** Transform backend entity to Option format */
  toOption: (item: T) => Option

  /** Is multiple selection enabled */
  multiple?: boolean

  /** Minimum characters to trigger search (default: 3) */
  minCharsToSearch?: number

  /** Debounce delay in ms (default: 400) */
  debounceDelay?: number

  /** Placeholder text */
  placeholder?: string

  /** Empty indicator text */
  emptyIndicator?: string

  /** Loading indicator text */
  loadingIndicator?: string

  /** Max items to show (default: 20) */
  maxItems?: number

  /** className for the selector */
  className?: string

  /** Badge className */
  badgeClassName?: string

  /** Hide clear all button */
  hideClearAllButton?: boolean

  /** Hide placeholder when selected */
  hidePlaceholderWhenSelected?: boolean
}

export interface SearchableSelectorProps<T> extends SearchableSelectorConfig<T> {
  /** Controlled value */
  value?: Option | Option[]

  /** On change callback */
  onChange?: (value: Option | Option[]) => void

  /** Disabled state */
  disabled?: boolean

  /** Command props label */
  commandLabel?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SearchableSelector<T>({
  useQueryHook,
  queryField,
  toOption,
  multiple = false,
  minCharsToSearch = 3,
  debounceDelay = 400,
  placeholder = "Buscar...",
  emptyIndicator = "No se encontraron resultados",
  loadingIndicator = "Buscando...",
  maxItems = 20,
  value,
  onChange,
  disabled,
  commandLabel,
  className,
  badgeClassName,
  hideClearAllButton = false,
  hidePlaceholderWhenSelected = false,
}: SearchableSelectorProps<T>) {
  const [inputValue, setInputValue] = useState("")
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([])

  const debouncedInput = useDebounce(inputValue, debounceDelay)

  // Build query string
  const queryString =
    debouncedInput.length >= minCharsToSearch
      ? `${queryField}:${debouncedInput},`
      : undefined

  // Fetch data
  const { data, isLoading, isFetching } = useQueryHook({
    page: 0,
    size: maxItems,
    query: queryString,
  })

  // Transform to options
  const options: Option[] = React.useMemo(() => {
    if (!data?.content) return []
    return data.content.map(toOption)
  }, [data, toOption])

  // Sync external value to internal state
  useEffect(() => {
    if (value === undefined) return

    if (multiple) {
      setSelectedOptions(Array.isArray(value) ? value : [value])
    } else {
      setSelectedOptions(Array.isArray(value) ? value : [value])
    }
  }, [value, multiple])

  // Handle selection change
  const handleChange = useCallback(
    (newOptions: Option[]) => {
      setSelectedOptions(newOptions)

      if (multiple) {
        onChange?.(newOptions)
      } else {
        onChange?.(newOptions[0] ?? null)
      }
    },
    [multiple, onChange],
  )

  // For single select: limit to 1 item
  const maxSelected = multiple ? Number.MAX_SAFE_INTEGER : 1

  return (
    <MultipleSelector
      value={selectedOptions}
      onChange={handleChange}
      onSearch={async (search: string) => {
        setInputValue(search)
        return options
      }}
      options={options}
      placeholder={placeholder}
      emptyIndicator={
        isLoading || isFetching ? (
          <p className="text-center text-sm text-muted-foreground">
            {loadingIndicator}
          </p>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            {debouncedInput.length < minCharsToSearch
              ? `Escribe al menos ${minCharsToSearch} caracteres`
              : emptyIndicator}
          </p>
        )
      }
      loadingIndicator={
        <p className="text-center text-sm text-muted-foreground">
          {loadingIndicator}
        </p>
      }
      maxSelected={maxSelected}
      disabled={disabled}
      className={className}
      badgeClassName={badgeClassName}
      hideClearAllButton={hideClearAllButton}
      hidePlaceholderWhenSelected={hidePlaceholderWhenSelected}
      commandProps={{
        label: commandLabel ?? placeholder,
      }}
      delay={0} // We handle debounce ourselves
      triggerSearchOnFocus={false}
    />
  )
}