import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  useCreateTurnTemplateMutation,
  useUpdateTurnTemplateMutation,
  useGetTurnTemplateByIdQuery,
} from "../api/contractScheduleApi"
import { TurnType, TurnTypeLabel } from "../api/contractScheduleModel"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Save, Loader2, Clock } from "lucide-react"

// ─── Schema ───────────────────────────────────────────────────────────────────

const turnTemplateSchema = z.object({
  name: z
    .string({ required_error: "El nombre es requerido" })
    .min(3, "Mínimo 3 caracteres")
    .max(100),
  numGuards: z.coerce
    .number({ required_error: "El número de guardias es requerido" })
    .int()
    .min(1, "Debe ser al menos 1 guardia"),
  timeFrom: z
    .string({ required_error: "La hora de inicio es requerida" })
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Formato HH:mm requerido"),
  timeTo: z
    .string({ required_error: "La hora de fin es requerida" })
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Formato HH:mm requerido"),
  turnType: z.nativeEnum(TurnType, {
    required_error: "El tipo de turno es requerido",
  }),
})

type TurnTemplateFormValues = z.infer<typeof turnTemplateSchema>

// ─── Component ────────────────────────────────────────────────────────────────

export const TurnTemplateFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id

  const { data: turnTemplate, isLoading: loadingTemplate } = useGetTurnTemplateByIdQuery(
    Number(id),
    { skip: !isEdit },
  )

  const [createTurnTemplate, { isLoading: creating }] = useCreateTurnTemplateMutation()
  const [updateTurnTemplate, { isLoading: updating }] = useUpdateTurnTemplateMutation()
  const isSubmitting = creating || updating

  const form = useForm<TurnTemplateFormValues>({
    resolver: zodResolver(turnTemplateSchema),
    defaultValues: {
      name: "",
      numGuards: 1,
      timeFrom: "08:00",
      timeTo: "18:00",
      turnType: TurnType.DAY,
    },
  })

  useEffect(() => {
    if (turnTemplate) {
      form.reset({
        name: turnTemplate.name,
        numGuards: turnTemplate.numGuards,
        timeFrom: turnTemplate.timeFrom,
        timeTo: turnTemplate.timeTo,
        turnType: turnTemplate.turnType,
      })
    }
  }, [turnTemplate])

  const onSubmit = async (values: TurnTemplateFormValues) => {
    try {
      if (isEdit) {
        await updateTurnTemplate({ id: Number(id), body: values }).unwrap()
      } else {
        await createTurnTemplate(values).unwrap()
      }
      navigate("/modules/scheduling/turn-templates")
    } catch (err) {
      console.error(err)
    }
  }

  if (isEdit && loadingTemplate) {
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
          onClick={() => navigate("/modules/scheduling/turn-templates")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEdit ? "Editar Plantilla de Turno" : "Nueva Plantilla de Turno"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEdit
              ? "Modifica los datos de la plantilla."
              : "Crea una plantilla reutilizable para asignar a días de la semana."}
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Información Básica
            </CardTitle>
            <CardDescription>
              Nombre y configuración del turno
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="name">Nombre de la Plantilla</FieldLabel>
                    <Input
                      id="name"
                      placeholder="Ej. Turno Mañana, Diurno Extendido"
                      {...field}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>
                      Un nombre descriptivo para identificar esta plantilla
                    </FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="turnType"
                control={form.control}
                render={({ field, fieldState }) => {
                  const isInvalid = fieldState.invalid
                  return (
                    <FieldSet data-invalid={isInvalid}>
                      <FieldLegend variant="label">Tipo de Turno</FieldLegend>
                      <FieldDescription>
                        Selecciona si es un turno diurno o nocturno
                      </FieldDescription>
                      <RadioGroup
                        name={field.name}
                        value={String(field.value)}
                        onValueChange={(v: any) => field.onChange(v)}
                        aria-invalid={isInvalid}
                      >
                        {Object.entries(TurnTypeLabel).map(([value, label]) => (
                          <FieldLabel
                            key={value}
                            htmlFor={`turnType-${value}`}
                            className="cursor-pointer"
                          >
                            <Field orientation="horizontal">
                              <FieldContent>
                                <span className="font-medium">{label}</span>
                              </FieldContent>
                              <RadioGroupItem value={value} id={`turnType-${value}`} />
                            </Field>
                          </FieldLabel>
                        ))}
                      </RadioGroup>
                      {isInvalid && <FieldError errors={[fieldState.error]} />}
                    </FieldSet>
                  )
                }}
              />
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Horario y Capacidad</CardTitle>
            <CardDescription>
              Define el rango horario y número de guardias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  name="timeFrom"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="timeFrom">Hora Inicio</FieldLabel>
                      <Input
                        id="timeFrom"
                        type="time"
                        {...field}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="timeTo"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="timeTo">Hora Fin</FieldLabel>
                      <Input
                        id="timeTo"
                        type="time"
                        {...field}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>

              <Controller
                name="numGuards"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="max-w-xs">
                    <FieldLabel htmlFor="numGuards">Número de Guardias</FieldLabel>
                    <Input
                      id="numGuards"
                      type="number"
                      min="1"
                      {...field}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>
                      Cantidad de guardias necesarios para este turno
                    </FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
            onClick={() => navigate("/modules/scheduling/turn-templates")}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isEdit ? "Guardar Cambios" : "Crear Plantilla"}
          </Button>
        </div>
      </form>
    </div>
  )
}