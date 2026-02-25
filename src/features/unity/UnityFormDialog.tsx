import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  useCreateUnityMutation,
  useUpdateUnityMutation,
} from "./api/unityApi"
import type { UnityDto } from "./api/unityModel"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  Loader2,
  Navigation,
} from "lucide-react"
import { ClientSelector } from "@/components/select/ClientSelector"

// ─── Schema ───────────────────────────────────────────────────────────────────

const unitySchema = z.object({
  clientId: z.coerce
    .number({ required_error: "El cliente es requerido" })
    .int()
    .positive("Selecciona un cliente"),
  code: z
    .string({ required_error: "El código es requerido" })
    .min(2, "Mínimo 2 caracteres")
    .max(50),
  name: z
    .string({ required_error: "El nombre es requerido" })
    .min(2, "Mínimo 2 caracteres")
    .max(150),
  description: z.string().max(255).optional().or(z.literal("")),
  direction: z.string().max(255).optional().or(z.literal("")),
  latitude: z.coerce.number().optional().or(z.literal("")),
  longitude: z.coerce.number().optional().or(z.literal("")),
  rangeCoverage: z.coerce
    .number()
    .min(0, "Debe ser mayor a 0")
    .optional()
    .or(z.literal("")),
  active: z.boolean().default(true),
})

type UnityFormValues = z.infer<typeof unitySchema>

// ─── Unity Form Dialog ────────────────────────────────────────────────────────

interface UnityFormDialogProps {
  open: boolean
  onClose: () => void
  editUnity?: UnityDto
}

const UnityFormDialog = ({ open, onClose, editUnity }: UnityFormDialogProps) => {
  const isEdit = !!editUnity
  const [createUnity, { isLoading: creating }] = useCreateUnityMutation()
  const [updateUnity, { isLoading: updating }] = useUpdateUnityMutation()
  const isSubmitting = creating || updating

  const form = useForm<UnityFormValues>({
    resolver: zodResolver(unitySchema),
    defaultValues: {
      clientId: undefined,
      code: "",
      name: "",
      description: "",
      direction: "",
      latitude: "",
      longitude: "",
      rangeCoverage: "",
      active: true,
    },
  })

  useEffect(() => {
    if (editUnity) {
      form.reset({
        clientId: editUnity.clientId,
        code: editUnity.code,
        name: editUnity.name,
        description: editUnity.description ?? "",
        direction: editUnity.direction ?? "",
        latitude: editUnity.latitude ?? "",
        longitude: editUnity.longitude ?? "",
        rangeCoverage: editUnity.rangeCoverage ?? "",
        active: editUnity.active,
      })
    } else {
      form.reset({
        clientId: undefined,
        code: "",
        name: "",
        description: "",
        direction: "",
        latitude: "",
        longitude: "",
        rangeCoverage: "",
        active: true,
      })
    }
  }, [editUnity, open])

  const onSubmit = async (values: UnityFormValues) => {
    const payload = {
      ...values,
      description: values.description || undefined,
      direction: values.direction || undefined,
      latitude: values.latitude !== "" ? Number(values.latitude) : undefined,
      longitude: values.longitude !== "" ? Number(values.longitude) : undefined,
      rangeCoverage: values.rangeCoverage !== "" ? Number(values.rangeCoverage) : undefined,
    }
    try {
      if (isEdit) {
        await updateUnity({ id: editUnity!.id, body: payload }).unwrap()
      } else {
        await createUnity(payload as any).unwrap()
      }
      onClose()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Unidad" : "Nueva Unidad"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifica los datos de la unidad."
              : "Registra una nueva sede o sucursal del cliente."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-1">
          <FieldGroup>
            {/* Client + status */}
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="clientId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="clientId">Cliente</FieldLabel>
                    <ClientSelector
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Buscar cliente..."
                      className="w-full"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="active"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                    <FieldContent>
                      <FieldLabel htmlFor="active">Estado</FieldLabel>
                    </FieldContent>
                    <Switch
                      id="active"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            {/* Code + name */}
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="code"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="code">Código</FieldLabel>
                    <Input
                      id="code"
                      placeholder="SAMSUNG-NORTE"
                      {...field}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="name">Nombre</FieldLabel>
                    <Input
                      id="name"
                      placeholder="Samsung Norte"
                      {...field}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="description">Descripción</FieldLabel>
                  <Input
                    id="description"
                    placeholder="Descripción de la unidad (opcional)"
                    {...field}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="direction"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="direction">Dirección</FieldLabel>
                  <Input
                    id="direction"
                    placeholder="Av. Industrial 456, Lima"
                    {...field}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Separator />

            {/* GPS + coverage */}
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Navigation className="h-3.5 w-3.5" />
              Geolocalización (opcional)
            </p>
            <div className="grid grid-cols-3 gap-4">
              <Controller
                name="latitude"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="latitude">Latitud</FieldLabel>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      placeholder="-12.046374"
                      {...field}
                      value={field.value ?? ""}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="longitude"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="longitude">Longitud</FieldLabel>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      placeholder="-77.042793"
                      {...field}
                      value={field.value ?? ""}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="rangeCoverage"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="rangeCoverage">Rango (m)</FieldLabel>
                    <Input
                      id="rangeCoverage"
                      type="number"
                      step="1"
                      placeholder="100"
                      {...field}
                      value={field.value ?? ""}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>Radio de cobertura GPS</FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
          </FieldGroup>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Guardar Cambios" : "Crear Unidad"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
export default UnityFormDialog