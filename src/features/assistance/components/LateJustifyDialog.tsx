import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { AssistanceTypeLabel } from "../api/assistanceModel"
import type { GuardAssistanceEventDto } from "../api/assistanceModel"

interface LateJustifyDialogProps {
  event: GuardAssistanceEventDto | null
  onClose: () => void
  onSubmit: (eventId: number, description: string) => Promise<void>
  isSubmitting: boolean
}

export function LateJustifyDialog({ event, onClose, onSubmit, isSubmitting }: LateJustifyDialogProps) {
  const [description, setDescription] = useState("")

  const handleSubmit = async () => {
    if (!event || !description.trim()) return
    await onSubmit(event.id, description.trim())
    setDescription("")
    onClose()
  }

  return (
    <Dialog open={event !== null} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm mx-4">
        <DialogHeader>
          <DialogTitle>Justificar Tardanza</DialogTitle>
          <DialogDescription>
            {event && (
              <>
                {AssistanceTypeLabel[event.assistanceType]} ·{" "}
                {event.differenceInMinutes != null && `+${event.differenceInMinutes} min`}
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <Textarea
          rows={4}
          placeholder="Describe el motivo de la tardanza..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="resize-none text-sm"
        />
        <DialogFooter className="flex-col gap-2">
          <Button
            className="w-full"
            disabled={!description.trim() || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Enviar Justificación
          </Button>
          <Button variant="outline" className="w-full" onClick={onClose}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
