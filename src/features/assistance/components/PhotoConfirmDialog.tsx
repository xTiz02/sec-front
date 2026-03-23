import { CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { AssistanceTypeLabel } from "../api/assistanceModel"
import type { AssistanceType } from "../api/assistanceModel"

interface PhotoConfirmDialogProps {
  photoUrl: string | null
  markType: AssistanceType | null
  onConfirm: () => Promise<void>
  onCancel: () => void
  isConfirming: boolean
}

export function PhotoConfirmDialog({
  photoUrl,
  markType,
  onConfirm,
  onCancel,
  isConfirming,
}: PhotoConfirmDialogProps) {
  return (
    <Dialog open={photoUrl !== null} onOpenChange={v => !v && onCancel()}>
      <DialogContent className="max-w-sm mx-4">
        <DialogHeader>
          <DialogTitle>
            Confirmar {markType ? AssistanceTypeLabel[markType] : ""}
          </DialogTitle>
          <DialogDescription>
            Verifica tu foto antes de confirmar la marcación.
          </DialogDescription>
        </DialogHeader>
        {photoUrl && (
          <div className="rounded-xl overflow-hidden border border-border aspect-square max-h-64 flex items-center justify-center bg-black">
            <img src={photoUrl} alt="Foto de marcación" className="w-full h-full object-cover" />
          </div>
        )}
        <DialogFooter className="flex-col gap-2">
          <Button className="w-full" onClick={onConfirm} disabled={isConfirming}>
            {isConfirming ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Confirmar Marcación
          </Button>
          <Button variant="outline" className="w-full" onClick={onCancel} disabled={isConfirming}>
            Retomar Foto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
