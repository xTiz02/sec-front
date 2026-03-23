import { useRef, useState, useEffect, useCallback } from "react"
import { Camera, CheckCircle, Loader2, RefreshCw, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type CameraState = "REQUESTING" | "STREAMING" | "CAPTURED" | "ERROR"

interface CameraDialogProps {
  open: boolean
  title: string
  isConfirming: boolean
  onCapture: (base64: string) => Promise<void>
  onCancel: () => void
}

export function CameraDialog({
  open,
  title,
  isConfirming,
  onCapture,
  onCancel,
}: CameraDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [cameraState, setCameraState] = useState<CameraState>("REQUESTING")
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null)
  const [capturedBase64, setCapturedBase64] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }, [])

  const startStream = useCallback(async () => {
    setCameraState("REQUESTING")
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
          setCameraState("STREAMING")
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "No se pudo acceder a la cámara"
      setError(message)
      setCameraState("ERROR")
    }
  }, [])

  // Start/stop stream when dialog opens/closes
  useEffect(() => {
    if (!open) {
      stopStream()
      setCameraState("REQUESTING")
      setCapturedUrl(null)
      setCapturedBase64(null)
      setError(null)
      return
    }
    void startStream()
    return () => stopStream()
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCapture = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || cameraState !== "STREAMING") return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext("2d")?.drawImage(video, 0, 0)

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85)
    setCapturedUrl(dataUrl)
    setCapturedBase64(dataUrl.split(",")[1])
    stopStream()
    setCameraState("CAPTURED")
  }, [cameraState, stopStream])

  const handleRetake = useCallback(() => {
    setCapturedUrl(null)
    setCapturedBase64(null)
    void startStream()
  }, [startStream])

  const handleConfirm = useCallback(async () => {
    if (!capturedBase64) return
    await onCapture(capturedBase64)
  }, [capturedBase64, onCapture])

  return (
    <Dialog open={open} onOpenChange={v => !v && !isConfirming && onCancel()}>
      <DialogContent className="max-w-sm mx-4 p-0 overflow-hidden gap-0">
        <DialogHeader className="px-4 pt-4 pb-3">
          <DialogTitle className="text-base">{title}</DialogTitle>
        </DialogHeader>

        {/* Camera / preview area */}
        <div className="relative bg-black w-full aspect-[4/3] flex items-center justify-center overflow-hidden">
          {/* Live stream */}
          <video
            ref={videoRef}
            className={cn(
              "w-full h-full object-cover scale-x-[-1]", // mirror front camera
              cameraState !== "STREAMING" && "hidden",
            )}
            playsInline
            muted
          />

          {/* Captured photo preview */}
          {cameraState === "CAPTURED" && capturedUrl && (
            <img
              src={capturedUrl}
              alt="Foto capturada"
              className="w-full h-full object-cover scale-x-[-1]"
            />
          )}

          {/* Loading spinner */}
          {cameraState === "REQUESTING" && (
            <div className="flex flex-col items-center gap-3 text-white">
              <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
              <p className="text-sm text-slate-300">Activando cámara...</p>
            </div>
          )}

          {/* Error state */}
          {cameraState === "ERROR" && (
            <div className="flex flex-col items-center gap-3 text-center px-6">
              <Camera className="h-8 w-8 text-red-400" />
              <p className="text-sm text-red-300">{error}</p>
              <Button
                size="sm"
                variant="outline"
                className="border-slate-600 text-slate-200 hover:bg-slate-800"
                onClick={handleRetake}
              >
                Intentar de nuevo
              </Button>
            </div>
          )}

          {/* Shutter button overlay (streaming only) */}
          {cameraState === "STREAMING" && (
            <button
              onClick={handleCapture}
              className="absolute bottom-5 left-1/2 -translate-x-1/2 size-16 rounded-full border-4 border-white bg-white/20 backdrop-blur-sm hover:bg-white/30 active:scale-90 transition-all"
              aria-label="Tomar foto"
            >
              <div className="size-full rounded-full flex items-center justify-center">
                <div className="size-10 rounded-full bg-white" />
              </div>
            </button>
          )}

          {/* Captured: top hint */}
          {cameraState === "CAPTURED" && (
            <div className="absolute top-3 left-0 right-0 flex justify-center">
              <span className="bg-black/60 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Confirma o retoma
              </span>
            </div>
          )}
        </div>

        {/* Hidden canvas used for frame capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Action buttons */}
        <div className="p-4 space-y-2">
          {cameraState === "CAPTURED" && (
            <>
              <Button
                className="w-full"
                onClick={handleConfirm}
                disabled={isConfirming}
              >
                {isConfirming ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Confirmar Marcación
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleRetake}
                disabled={isConfirming}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retomar Foto
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={onCancel}
            disabled={isConfirming}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
