import { useRef, useState } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Upload,
  XCircle,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  useValidateScheduleExcelMutation,
  useImportScheduleExcelMutation,
} from "../api/monthlySchedulerApi"
import type {
  ScheduleExcelValidationResult,
  ScheduleExcelValidationSuccess,
  ScheduleExcelValidationError,
} from "../api/monthlySchedulerApi"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isValidationError(r: ScheduleExcelValidationResult): r is ScheduleExcelValidationError {
  return "position" in r || ("description" in r && !("yearMonth" in r))
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "pick" | "validating" | "preview" | "importing"

interface ImportScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (scheduleMonthlyId: number) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ImportScheduleDialog({
  open,
  onOpenChange,
  onSuccess,
}: ImportScheduleDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [step, setStep] = useState<Step>("pick")
  const [validationResult, setValidationResult] = useState<ScheduleExcelValidationResult | null>(
    null,
  )
  const [importError, setImportError] = useState<string | null>(null)

  const [validateExcel] = useValidateScheduleExcelMutation()
  const [importExcel] = useImportScheduleExcelMutation()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      setValidationResult(null)
      setImportError(null)
    }
  }

  const handleValidate = async () => {
    if (!file) return
    setStep("validating")
    try {
      const result = await validateExcel(file).unwrap()
      setValidationResult(result)
      setStep("preview")
    } catch {
      setStep("pick")
    }
  }

  const handleImport = async () => {
    if (!file) return
    setStep("importing")
    setImportError(null)
    try {
      const result = await importExcel(file).unwrap()
      handleClose()
      onSuccess(result.scheduleMonthlyId)
    } catch {
      setImportError("Ocurrió un error al importar. Por favor, inténtalo de nuevo.")
      setStep("preview")
    }
  }

  const handleClose = () => {
    setFile(null)
    setStep("pick")
    setValidationResult(null)
    setImportError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    onOpenChange(false)
  }

  const handleRetry = () => {
    setFile(null)
    setValidationResult(null)
    setImportError(null)
    setStep("pick")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const successData = validationResult && !isValidationError(validationResult)
    ? (validationResult as ScheduleExcelValidationSuccess)
    : null
  const errorData = validationResult && isValidationError(validationResult)
    ? (validationResult as ScheduleExcelValidationError)
    : null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            Importar Programación desde Excel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* ── File picker (pick / validating) ─────────────────────────────── */}
          {(step === "pick" || step === "validating") && (
            <div
              className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">
                  {file ? file.name : "Haz clic para seleccionar el archivo Excel"}
                </p>
                {file ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">.xlsx, .xls</p>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* ── Preview: validation error ─────────────────────────────────── */}
          {step === "preview" && errorData && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-destructive">Error de validación</p>
                  {errorData.position && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Posición:{" "}
                      <span className="font-mono">{errorData.position}</span>
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">{errorData.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Preview: validation success ───────────────────────────────── */}
          {step === "preview" && successData && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                  Excel válido — listo para importar
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-3 bg-muted rounded">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase">
                    Período
                  </p>
                  <p className="font-medium mt-0.5">{successData.yearMonth}</p>
                </div>
                <div className="p-3 bg-muted rounded">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase">
                    Días
                  </p>
                  <p className="font-medium mt-0.5">{successData.totalDays}</p>
                </div>
                <div className="p-3 bg-muted rounded col-span-2">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase">
                    Cliente
                  </p>
                  <p className="font-medium mt-0.5">{successData.cliente}</p>
                </div>
                <div className="p-3 bg-muted rounded">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase">
                    Unidades
                  </p>
                  <p className="font-medium mt-0.5">{successData.unidades}</p>
                </div>
                <div className="p-3 bg-muted rounded">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase">
                    Filas Excel
                  </p>
                  <p className="font-medium mt-0.5">{successData.filasExcel}</p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                Al confirmar se crearán todas las asignaciones del Excel. Esta acción no se puede
                deshacer fácilmente.
              </p>

              {importError && (
                <p className="text-sm text-destructive">{importError}</p>
              )}
            </div>
          )}

          {/* ── Importing spinner ─────────────────────────────────────────── */}
          {step === "importing" && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Importando programación...</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={step === "importing"}>
            Cancelar
          </Button>

          {step === "pick" && (
            <Button onClick={handleValidate} disabled={!file}>
              <Upload className="mr-2 h-4 w-4" />
              Validar Excel
            </Button>
          )}

          {step === "validating" && (
            <Button disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Validando...
            </Button>
          )}

          {step === "preview" && errorData && (
            <Button variant="outline" onClick={handleRetry}>
              Seleccionar otro archivo
            </Button>
          )}

          {step === "preview" && successData && (
            <Button onClick={handleImport}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Confirmar Importación
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
