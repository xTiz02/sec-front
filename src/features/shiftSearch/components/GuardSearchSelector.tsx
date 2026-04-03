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
import { Badge } from "@/components/ui/badge"
import { ChevronsUpDown, X } from "lucide-react"
import { useDebounce } from "@/hooks/useDebounse"
import { useSearchGuardLiteQuery } from "../api/shiftSearchApi"
import type { GuardLiteView } from "../api/shiftSearchModel"
import { GuardTypeLabel } from "@/features/guard/api/guardModel"

// ─── Props ────────────────────────────────────────────────────────────────────

interface GuardSearchSelectorProps {
  value?: GuardLiteView | null
  onChange: (value: GuardLiteView | null) => void
  placeholder?: string
  disabled?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GuardSearchSelector({
  value,
  onChange,
  placeholder = "Buscar guardia...",
  disabled,
}: GuardSearchSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearch = useDebounce(searchTerm, 350)

  const { data, isFetching } = useSearchGuardLiteQuery(
    { searchTerm: debouncedSearch, page: 0, size: 20 },
    { skip: debouncedSearch.length < 2 },
  )

  const items = data?.content ?? []

  const handleSelect = (item: GuardLiteView) => {
    onChange(item)
    setOpen(false)
    setSearchTerm("")
  }

  return (
    <div className="flex items-start gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            disabled={disabled}
            className="flex-1 justify-between font-normal h-auto min-h-9 py-1.5 text-sm"
          >
            {value ? (
              <span className="flex flex-col items-start gap-0.5 text-left min-w-0">
                <span className="flex items-center gap-1.5 min-w-0">
                  <span className="font-semibold truncate">{value.fullName}</span>
                  <Badge
                    variant="outline"
                    className={`text-[9px] shrink-0 ${value.externalGuardId ? "border-amber-400 text-amber-700" : "border-blue-400 text-blue-700"}`}
                  >
                    {value.externalGuardId ? "Externo" : "Guardia"}
                  </Badge>
                </span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  {value.documentNumber}
                  {value.identificationType ? ` · ${value.identificationType}` : ""}
                  {value.guardType ? ` · ${GuardTypeLabel[value.guardType]}` : ""}
                </span>
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-80" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Nombre o DNI..."
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
                items.map(item => (
                  <CommandItem
                    key={item.guardId != null ? `g-${item.guardId}` : `e-${item.externalGuardId}`}
                    value={String(item.guardId ?? item.externalGuardId)}
                    onSelect={() => handleSelect(item)}
                    className="flex flex-col items-start py-2.5"
                  >
                    <p className="text-sm font-medium">{item.fullName}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {item.externalGuardId ? "Externo" : "Guardia"}
                      {item.documentNumber ? ` · ${item.documentNumber}` : ""}
                      {item.code ? ` · Cód: ${item.code}` : ""}
                    </p>
                  </CommandItem>
                ))
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
