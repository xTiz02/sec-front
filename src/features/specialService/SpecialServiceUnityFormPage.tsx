import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  useCreateSpecialServiceUnityMutation,
  useUpdateSpecialServiceUnityMutation,
  useGetSpecialServiceUnityByIdQuery,
} from "./api/specialServiceUnityApi"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  code: z.string().min(1, "El código es requerido").max(50),
  unityName: z.string().min(1, "El nombre es requerido").max(200),
  unityDescription: z.string().max(500).optional().or(z.literal("")),
  address: z.string().max(300).optional().or(z.literal("")),
  active: z.boolean(),
})

type FormValues = z.infer<typeof schema>

// ─── Component ────────────────────────────────────────────────────────────────

export const SpecialServiceUnityFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id

  const { data: unity, isLoading: loadingUnity } = useGetSpecialServiceUnityByIdQuery(
    Number(id),
    { skip: !isEdit },
  )

  const [createUnity, { isLoading: creating }] = useCreateSpecialServiceUnityMutation()
  const [updateUnity, { isLoading: updating }] = useUpdateSpecialServiceUnityMutation()
  const isSubmitting = creating || updating

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: "",
      unityName: "",
      unityDescription: "",
      address: "",
      active: true,
    },
  })

  useEffect(() => {
    if (unity) {
      form.reset({
        code: unity.code,
        unityName: unity.unityName,
        unityDescription: unity.unityDescription ?? "",
        address: unity.address ?? "",
        active: unity.active,
      })
    }
  }, [unity])

  const onSubmit = async (values: FormValues) => {
    const payload = {
      ...values,
      unityDescription: values.unityDescription || undefined,
      address: values.address || undefined,
    }
    try {
      if (isEdit) {
        await updateUnity({ id: Number(id), body: payload }).unwrap()
      } else {
        await createUnity(payload).unwrap()
      }
      navigate("/modules/special-services/unities")
    } catch (err) {
      console.error(err)
    }
  }

  if (isEdit && loadingUnity) {
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
          onClick={() => navigate("/modules/special-services/unities")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEdit ? "Editar Unidad" : "Nueva Unidad de Servicio Especial"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEdit
              ? "Modifica los datos del establecimiento."
              : "Registra un lugar o establecimiento para servicios eventuales."}
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Datos del lugar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datos del Establecimiento</CardTitle>
            <CardDescription>Nombre, código identificador y descripción.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Nombre */}
                <Controller
                  name="unityName"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="unityName">Nombre del Establecimiento</FieldLabel>
                      <Input
                        id="unityName"
                        placeholder="Salón El Marqués"
                        {...field}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                {/* Código */}
                <Controller
                  name="code"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="code">Código</FieldLabel>
                      <Input
                        id="code"
                        placeholder="SSU-001"
                        {...field}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>

              {/* Descripción */}
              <Controller
                name="unityDescription"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="unityDescription">Descripción (opcional)</FieldLabel>
                    <Textarea
                      id="unityDescription"
                      rows={3}
                      placeholder="Descripción del lugar, tipo de evento habitual, capacidad, etc."
                      {...field}
                      className="resize-none"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Ubicación */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ubicación</CardTitle>
            <CardDescription>Dirección física del establecimiento.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Controller
                name="address"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="address">Dirección</FieldLabel>
                    <Input
                      id="address"
                      placeholder="Av. Corrientes 1234, Buenos Aires"
                      {...field}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Estado */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <Controller
              name="active"
              control={form.control}
              render={({ field }) => (
                <div className="flex items-center gap-3">
                  <Switch
                    id="active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label htmlFor="active" className="text-sm font-medium cursor-pointer">
                    {field.value ? "Activo" : "Inactivo"}
                  </Label>
                </div>
              )}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/modules/special-services/unities")}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isEdit ? "Guardar Cambios" : "Crear Unidad"}
          </Button>
        </div>
      </form>
    </div>
  )
}
