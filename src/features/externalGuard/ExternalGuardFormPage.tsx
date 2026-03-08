import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  useCreateExternalGuardMutation,
  useUpdateExternalGuardMutation,
  useGetExternalGuardByIdQuery,
} from "./api/externalGuardApi"
import {
  Gender,
  GenderLabel,
  IdentificationType,
  IdentificationTypeLabel,
  Country,
  CountryLabel,
} from "./api/externalGuardModel"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
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
import { Label } from "@/components/ui/label"

// ─── Schema ───────────────────────────────────────────────────────────────────

const externalGuardSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido").max(100),
  lastName: z.string().min(1, "El apellido es requerido").max(100),
  email: z.string().email("Email inválido"),
  mobilePhone: z.string().max(30).optional().or(z.literal("")),
  documentNumber: z.string().min(1, "El número de documento es requerido").max(50),
  identificationType: z.nativeEnum(IdentificationType).optional(),
  gender: z.nativeEnum(Gender).optional(),
  country: z.nativeEnum(Country).optional(),
  businessName: z.string().max(200).optional().or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")),
  active: z.boolean(),
})

type ExternalGuardFormValues = z.infer<typeof externalGuardSchema>

const IDENTIFICATION_TYPES = Object.values(IdentificationType) as IdentificationType[]
const GENDERS = Object.values(Gender) as Gender[]
const COUNTRIES = Object.values(Country) as Country[]

// ─── Component ────────────────────────────────────────────────────────────────

export const ExternalGuardFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id

  const { data: guard, isLoading: loadingGuard } = useGetExternalGuardByIdQuery(
    Number(id),
    { skip: !isEdit },
  )

  const [createExternalGuard, { isLoading: creating }] = useCreateExternalGuardMutation()
  const [updateExternalGuard, { isLoading: updating }] = useUpdateExternalGuardMutation()
  const isSubmitting = creating || updating

  const form = useForm<ExternalGuardFormValues>({
    resolver: zodResolver(externalGuardSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      mobilePhone: "",
      documentNumber: "",
      identificationType: undefined,
      gender: undefined,
      country: undefined,
      businessName: "",
      birthDate: "",
      active: true,
    },
  })

  useEffect(() => {
    if (guard) {
      form.reset({
        firstName: guard.firstName,
        lastName: guard.lastName,
        email: guard.email,
        mobilePhone: guard.mobilePhone ?? "",
        documentNumber: guard.documentNumber,
        identificationType: guard.identificationType,
        gender: guard.gender,
        country: guard.country,
        businessName: guard.businessName ?? "",
        birthDate: guard.birthDate ?? "",
        active: guard.active,
      })
    }
  }, [guard])

  const onSubmit = async (values: ExternalGuardFormValues) => {
    const payload = {
      ...values,
      mobilePhone: values.mobilePhone || undefined,
      businessName: values.businessName || undefined,
      birthDate: values.birthDate || undefined,
    }
    try {
      if (isEdit) {
        await updateExternalGuard({ id: Number(id), body: payload }).unwrap()
      } else {
        await createExternalGuard(payload).unwrap()
      }
      navigate("/modules/personal/external-guards")
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
          onClick={() => navigate("/modules/personal/external-guards")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEdit ? "Editar Guardia Externo" : "Nuevo Guardia Externo"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEdit
              ? "Modifica los datos del guardia externo."
              : "Completa los datos para registrar un guardia externo."}
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Datos Personales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datos Personales</CardTitle>
            <CardDescription>Nombre, género y fecha de nacimiento.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Nombre */}
                <Controller
                  name="firstName"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="firstName">Nombre</FieldLabel>
                      <Input
                        id="firstName"
                        placeholder="Juan"
                        {...field}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                {/* Apellido */}
                <Controller
                  name="lastName"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="lastName">Apellido</FieldLabel>
                      <Input
                        id="lastName"
                        placeholder="Pérez"
                        {...field}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                {/* Género */}
                <Controller
                  name="gender"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Género</FieldLabel>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={v => field.onChange(v || undefined)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          {GENDERS.map(g => (
                            <SelectItem key={g} value={g}>
                              {GenderLabel[g]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                {/* Fecha de nacimiento */}
                <Controller
                  name="birthDate"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="birthDate">Fecha de Nacimiento</FieldLabel>
                      <Input
                        id="birthDate"
                        type="date"
                        {...field}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Contacto */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contacto</CardTitle>
            <CardDescription>Email y teléfono de contacto.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Email */}
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input
                        id="email"
                        type="email"
                        placeholder="ejemplo@correo.com"
                        {...field}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                {/* Teléfono */}
                <Controller
                  name="mobilePhone"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="mobilePhone">Teléfono Móvil</FieldLabel>
                      <Input
                        id="mobilePhone"
                        placeholder="+54 9 11 1234-5678"
                        {...field}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Identificación */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Identificación</CardTitle>
            <CardDescription>Documento de identidad y país de origen.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Tipo documento */}
                <Controller
                  name="identificationType"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Tipo de Documento</FieldLabel>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={v => field.onChange(v || undefined)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          {IDENTIFICATION_TYPES.map(t => (
                            <SelectItem key={t} value={t}>
                              {IdentificationTypeLabel[t]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                {/* Número documento */}
                <Controller
                  name="documentNumber"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="documentNumber">Número de Documento</FieldLabel>
                      <Input
                        id="documentNumber"
                        placeholder="12345678"
                        {...field}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                {/* País */}
                <Controller
                  name="country"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="sm:col-span-2">
                      <FieldLabel>País</FieldLabel>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={v => field.onChange(v || undefined)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map(c => (
                            <SelectItem key={c} value={c}>
                              {CountryLabel[c]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Empresa */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Empresa</CardTitle>
            <CardDescription>Empresa u organización que contrata al guardia.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Controller
                name="businessName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="businessName">Razón Social / Empresa</FieldLabel>
                    <Input
                      id="businessName"
                      placeholder="Empresa S.A."
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
            onClick={() => navigate("/modules/personal/external-guards")}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isEdit ? "Guardar Cambios" : "Crear Guardia Externo"}
          </Button>
        </div>
      </form>
    </div>
  )
}
