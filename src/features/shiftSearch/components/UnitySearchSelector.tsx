import { useState } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { ChevronsUpDown, X } from "lucide-react"
import { useDebounce } from "@/hooks/useDebounse"
import { useSearchUnityLiteQuery } from "../api/shiftSearchApi"
import type { UnityLiteView } from "../api/shiftSearchModel"

// ─── Props ────────────────────────────────────────────────────────────────────

interface UnitySearchSelectorProps {
  value?: UnityLiteView | null
  onChange: (value: UnityLiteView | null) => void
  placeholder?: string
  disabled?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export function UnitySearchSelector({
  value,
  onChange,
  placeholder = "Buscar unidad...",
  disabled,
}: UnitySearchSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearch = useDebounce(searchTerm, 350)

  const { data, isFetching } = useSearchUnityLiteQuery(
    { searchTerm: debouncedSearch, page: 0, size: 20 },
    { skip: debouncedSearch.length < 2 },
  )

  const items = data?.content ?? []

  const handleSelect = (item: UnityLiteView) => {
    onChange(item)
    setOpen(false)
    setSearchTerm("")
  }

  return (
    <div className="flex items-center gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            disabled={disabled}
            className="flex-1 min-w-0 justify-between font-normal h-9 text-sm"
          >
            {value ? (
              <span className="truncate">{value.unityName}</span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-80" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Nombre de unidad..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              {debouncedSearch.length < 2 ? (
                <CommandEmpty>Escribe al menos 2 caracteres</CommandEmpty>
              ) : isFetching ? (
                <CommandEmpty>Buscando...</CommandEmpty>
              ) : items.length === 0 ? (
                <CommandEmpty>Sin resultados para "{debouncedSearch}"</CommandEmpty>
              ) : (
                items.map(item => {
                  const key =
                    item.unityId != null ? `u-${item.unityId}` : `s-${item.specialServiceUnityId}`
                  return (
                    <CommandItem
                      key={key}
                      value={key}
                      onSelect={() => handleSelect(item)}
                      className="flex flex-col items-start py-2.5"
                    >
                      <p className="text-sm font-medium">{item.unityName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {item.specialServiceUnityId ? "Servicio Especial" : "Unidad"}
                        {item.unityCode ? ` · ${item.unityCode}` : ""}
                        {item.clientName ? ` · ${item.clientName}` : ""}
                      </p>
                    </CommandItem>
                  )
                })
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={() => onChange(null)}
          disabled={disabled}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  )
}
