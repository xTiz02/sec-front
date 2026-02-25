import { useEffect} from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Loader2,
} from "lucide-react"
import type { ClientContractDto } from "../api/contractScheduleModel"
import { useCreateClientContractMutation, useUpdateClientContractMutation } from "../api/contractScheduleApi"
import { ClientSelector } from "@/components/select/ClientSelector"
import { Switch } from "@/components/ui/switch"



// ─── Schema ───────────────────────────────────────────────────────────────────

const clientContractSchema = z.object({
  clientId: z.coerce
    .number({ required_error: "El cliente es requerido" })
    .int()
    .positive("Selecciona un cliente"),
  name: z
    .string({ required_error: "El nombre es requerido" })
    .min(3, "Mínimo 3 caracteres")
    .max(150),
  description: z.string().max(255).optional().or(z.literal("")),
  active: z.boolean().default(true),
})

type ClientContractFormValues = z.infer<typeof clientContractSchema>


// ─── Form Dialog ──────────────────────────────────────────────────────────────

interface ClientContractFormDialogProps {
  open: boolean
  onClose: () => void
  editContract?: ClientContractDto
}

const ClientContractFormDialog = ({
  open,
  onClose,
  editContract,
}: ClientContractFormDialogProps) => {
  const isEdit = !!editContract
  const [createClientContract, { isLoading: creating }] = useCreateClientContractMutation()
  const [updateClientContract, { isLoading: updating }] = useUpdateClientContractMutation()
  const isSubmitting = creating || updating

  const form = useForm<ClientContractFormValues>({
    resolver: zodResolver(clientContractSchema),
    defaultValues: { clientId: undefined, name: "", description: "", active: true },
  })

  useEffect(() => {
    if (editContract) {
      form.reset({
        clientId: editContract.clientId,
        name: editContract.name,
        description: editContract.description ?? "",
        active: editContract.active,
      })
    } else {
      form.reset({ clientId: undefined, name: "", description: "", active: true })
    }
  }, [editContract, open])

  const onSubmit = async (values: ClientContractFormValues) => {
    const payload = {
      ...values,
      description: values.description || undefined,
    }
    try {
      if (isEdit) {
        await updateClientContract({ id: editContract!.id, body: payload }).unwrap()
      } else {
        await createClientContract(payload as any).unwrap()
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
          <DialogTitle>
            {isEdit ? "Editar Contrato de Cliente" : "Nuevo Contrato de Cliente"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifica los datos del contrato."
              : "Crea un contrato para un cliente."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
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
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="col-span-2">
                  <FieldLabel htmlFor="name">Nombre del Contrato</FieldLabel>
                  <Input
                    id="name"
                    placeholder="Contrato 2024"
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
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="description">Descripción</FieldLabel>
                <Input
                  id="description"
                  placeholder="Descripción opcional"
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
              {isEdit ? "Guardar Cambios" : "Crear Contrato"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ClientContractFormDialog