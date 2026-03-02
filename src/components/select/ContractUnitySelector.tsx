import React from "react"
import type { ContractUnityDto } from "@/features/contractSchedule/api/contractScheduleModel"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useGetContractUnitiesByContractIdQuery } from "@/features/contractSchedule/api/contractScheduleApi"
import { Loader2 } from "lucide-react"

export interface ContractUnitySelectorProps {
  contractId: number | undefined
  value?: number
  onChange?: (value: number | undefined) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export const ContractUnitySelector: React.FC<ContractUnitySelectorProps> = ({
  contractId,
  value,
  onChange,
  disabled,
  placeholder = "Seleccionar unidad...",
  className,
}) => {
  const { data: unities, isLoading } = useGetContractUnitiesByContractIdQuery(
    contractId!,
    { skip: contractId == null },
  )

  const handleChange = (val: string) => {
    onChange?.(val === "__clear__" ? undefined : Number(val))
  }

  return (
    <Select
      value={value !== undefined ? String(value) : ""}
      onValueChange={handleChange}
      disabled={disabled || isLoading || contractId == null}
    >
      <SelectTrigger className={`w-full ${className ?? ""}`}>
        {isLoading ? (
          <span className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Cargando...
          </span>
        ) : (
          <SelectValue placeholder={placeholder} />
        )}
      </SelectTrigger>
      <SelectContent>
        {(unities ?? []).map((u: ContractUnityDto) => (
          <SelectItem key={u.id} value={String(u.id)}>
            {u.unityName ?? `Unidad #${u.id}`}
            {u.unityCode ? ` (${u.unityCode})` : ""}
          </SelectItem>
        ))}
        {(unities ?? []).length === 0 && !isLoading && contractId != null && (
          <div className="px-2 py-3 text-center text-sm text-muted-foreground">
            Sin unidades para este contrato
          </div>
        )}
      </SelectContent>
    </Select>
  )
}
