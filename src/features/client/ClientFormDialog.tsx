import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  useCreateClientMutation,
  useUpdateClientMutation,
} from "./api/clientApi"
import type { ClientDto } from "./api/clientModel"
import {
  Field,
  FieldContent,
  FieldError,
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
import {  Loader2} from "lucide-react"

// ─── Schema ───────────────────────────────────────────────────────────────────

const clientSchema = z.object({
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
  active: z.boolean().default(true),
})

type ClientFormValues = z.infer<typeof clientSchema>


// ─── Client Form Dialog ───────────────────────────────────────────────────────

interface ClientFormDialogProps {
  open: boolean
  onClose: () => void
  editClient?: ClientDto
}

const ClientFormDialog = ({ open, onClose, editClient }: ClientFormDialogProps) => {
  const isEdit = !!editClient
  const [createClient, { isLoading: creating }] = useCreateClientMutation()
  const [updateClient, { isLoading: updating }] = useUpdateClientMutation()
  const isSubmitting = creating || updating

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: { code: "", name: "", description: "", direction: "", active: true },
  })

  useEffect(() => {
    if (editClient) {
      form.reset({
        code: editClient.code,
        name: editClient.name,
        description: editClient.description ?? "",
        direction: editClient.direction ?? "",
        active: editClient.active,
      })
    } else {
      form.reset({ code: "", name: "", description: "", direction: "", active: true })
    }
  }, [editClient, open])

  const onSubmit = async (values: ClientFormValues) => {
    const payload = {
      ...values,
      description: values.description || undefined,
      direction: values.direction || undefined,
    }
    try {
      if (isEdit) {
        await updateClient({ id: editClient!.id, body: payload }).unwrap()
      } else {
        await createClient(payload).unwrap()
      }
      onClose()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifica los datos del cliente."
              : "Registra una nueva organización cliente."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="code"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="code">Código</FieldLabel>
                  <Input
                    id="code"
                    placeholder="SAMSUNG-001"
                    {...field}
                    aria-invalid={fieldState.invalid}
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
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="name">Nombre</FieldLabel>
                <Input
                  id="name"
                  placeholder="Samsung Electronics"
                  {...field}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="description">Descripción</FieldLabel>
                <Input
                  id="description"
                  placeholder="Descripción del cliente (opcional)"
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
                  placeholder="Av. Principal 123, Lima"
                  {...field}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Guardar Cambios" : "Crear Cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ClientFormDialog