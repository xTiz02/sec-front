import { cn } from "@/lib/utils"
import { BadgeCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AssistanceProblemType,
  AssistanceProblemTypeLabel,
  AssistanceTypeLabel,
  RequestStatusLabel,
} from "../api/assistanceModel"
import type { GuardAssistanceEventDto, GuardRequestDto } from "../api/assistanceModel"
import { fmtTime } from "../utils/assistanceUtils"

interface LatenessAlertProps {
  event: GuardAssistanceEventDto
  request?: GuardRequestDto
  onJustify: (event: GuardAssistanceEventDto) => void
}

export function LatenessAlert({ event, request, onJustify }: LatenessAlertProps) {
  const isLate = event.assistanceProblemType === AssistanceProblemType.LATE
  const isJustified = event.assistanceProblemType === AssistanceProblemType.LATE_JUSTIFIED
  if (!isLate && !isJustified) return null

  const statusColor = isJustified
    ? "border-blue-200 bg-blue-50 dark:bg-blue-900/10"
    : "border-amber-200 bg-amber-50 dark:bg-amber-900/10"

  return (
    <div className={cn("flex items-center justify-between gap-3 p-3 rounded-lg border", statusColor)}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "text-xs font-bold",
              isJustified ? "text-blue-700 dark:text-blue-300" : "text-amber-700 dark:text-amber-300",
            )}
          >
            {AssistanceProblemTypeLabel[event.assistanceProblemType]}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {AssistanceTypeLabel[event.assistanceType]} · {fmtTime(event.markTime)}
          </span>
          {event.differenceInMinutes != null && event.differenceInMinutes > 0 && (
            <span className="text-[10px] text-destructive font-bold">
              +{event.differenceInMinutes} min
            </span>
          )}
        </div>
        {request && (
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Justificación: {RequestStatusLabel[request.requestStatus]}
          </p>
        )}
      </div>
      {isLate && !request && (
        <Button
          size="sm"
          variant="outline"
          className="shrink-0 text-xs h-7 border-amber-300 text-amber-700 hover:bg-amber-100"
          onClick={() => onJustify(event)}
        >
          Justificar
        </Button>
      )}
      {isJustified && <BadgeCheck className="h-4 w-4 text-blue-500 shrink-0" />}
    </div>
  )
}
