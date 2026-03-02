import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  useCreateGuardMutation,
  useUpdateGuardMutation,
  useGetGuardByIdQuery,
} from "./api/guardApi"
import { GuardType, GuardTypeLabel } from "./api/guardModel"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EmployeeSelector } from "@/components/select/EmployeeSelector"

// ─── Schema ───────────────────────────────────────────────────────────────────

const GUARD_TYPE_VALUES = Object.values(GuardType) as [GuardType, ...GuardType[]]

const guardSchema = z.object({
  employeeId: z.coerce
    .number({ required_error: "El empleado es requerido" })
    .int()
    .positive("Seleccione un empleado"),
  licenseNumber: z
    .string({ required_error: "El número de licencia es requerido" })
    .min(1, "El número de licencia es requerido")
    .max(50),
  guardType: z.enum(GUARD_TYPE_VALUES, {
    message: "El tipo de guardia es requerido",
  }),
  photoUrl: z.string().max(500).optional().or(z.literal("")),
})

type GuardFormValues = z.infer<typeof guardSchema>

// ─── Component ────────────────────────────────────────────────────────────────

export const GuardFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id

  const { data: guard, isLoading: loadingGuard } = useGetGuardByIdQuery(Number(id), {
    skip: !isEdit,
  })

  const [createGuard, { isLoading: creating }] = useCreateGuardMutation()
  const [updateGuard, { isLoading: updating }] = useUpdateGuardMutation()
  const isSubmitting = creating || updating

  const form = useForm<GuardFormValues>({
    resolver: zodResolver(guardSchema),
    defaultValues: {
      employeeId: undefined,
      licenseNumber: "",
      guardType: undefined,
      photoUrl: "",
    },
  })

  useEffect(() => {
    if (guard) {
      form.reset({
        employeeId: guard.employeeId,
        licenseNumber: guard.licenseNumber,
        guardType: guard.guardType,
        photoUrl: guard.photoUrl ?? "",
      })
    }
  }, [guard])

  const onSubmit = async (values: GuardFormValues) => {
    const payload = {
      ...values,
      photoUrl: values.photoUrl || undefined,
    }

    try {
      if (isEdit) {
        await updateGuard({ id: Number(id), body: payload }).unwrap()
      } else {
        await createGuard(payload).unwrap()
      }
      navigate("/modules/personal/guards")
    } catch (err) {
      console.error(err)
    }
  }

  if (isEdit && loadingGuard) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/modules/personal/guards")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEdit ? "Editar Guardia" : "Nuevo Guardia"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEdit
              ? "Modifica los datos del guardia."
              : "Completa los datos para registrar un nuevo guardia."}
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Guard data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datos del Guardia</CardTitle>
            <CardDescription>
              Empleado asociado, licencia y tipo de guardia.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Empleado */}
                <Controller
                  name="employeeId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Empleado</FieldLabel>
                      <EmployeeSelector
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Seleccionar empleado..."
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Número de licencia */}
                <Controller
                  name="licenseNumber"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="licenseNumber">
                        Número de Licencia
                      </FieldLabel>
                      <Input
                        id="licenseNumber"
                        placeholder="LIC-001234"
                        {...field}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Tipo de guardia */}
                <Controller
                  name="guardType"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Tipo de Guardia</FieldLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                          className="w-full"
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Seleccionar tipo..." />
                        </SelectTrigger>
                        <SelectContent>
                          {GUARD_TYPE_VALUES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {GuardTypeLabel[type]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              {/* URL de foto */}
              <Controller
                name="photoUrl"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="photoUrl">URL de Foto (opcional)</FieldLabel>
                    <Input
                      id="photoUrl"
                      placeholder="https://..."
                      {...field}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/modules/personal/guards")}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isEdit ? "Guardar Cambios" : "Crear Guardia"}
          </Button>
        </div>
      </form>
    </div>
  )
}
