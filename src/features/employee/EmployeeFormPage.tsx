import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useGetEmployeeByIdQuery,
} from "./api/employeeApi";
import {
  Country,
  CountryLabel,
  Gender,
  GenderLabel,
  IdentificationType,
  IdentificationTypeLabel,
  EmployeeType,
  EmployeeTypeLabel,
} from "./api/employeeModel";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// ─── Schema ───────────────────────────────────────────────────────────────────

const employeeSchema = z.object({
  firstName: z
    .string({ required_error: "El nombre es requerido" })
    .min(2, "Mínimo 2 caracteres")
    .max(100),
  lastName: z
    .string({ required_error: "El apellido es requerido" })
    .min(2, "Mínimo 2 caracteres")
    .max(100),
  documentNumber: z
    .string({ required_error: "El número de documento es requerido" })
    .min(5, "Mínimo 5 caracteres")
    .max(20),
  identificationType: z.nativeEnum(IdentificationType, {
    required_error: "El tipo de documento es requerido",
  }),
  email: z
    .string({ required_error: "El correo es requerido" })
    .email("Correo electrónico inválido"),
  mobilePhone: z.string().max(20).optional().or(z.literal("")),
  address: z.string().max(255).optional().or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")),
  country: z.nativeEnum(Country).optional(),
  gender: z.nativeEnum(Gender).optional(),
  employeeType: z.nativeEnum(EmployeeType, {
    required_error: "El tipo de empleado es requerido",
  }),
  userId: z.coerce.number().int().positive().optional().or(z.literal("")),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

// ─── Component ────────────────────────────────────────────────────────────────

export const EmployeeFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { data: employee, isLoading: loadingEmployee } =
    useGetEmployeeByIdQuery(Number(id), { skip: !isEdit });

  const [createEmployee, { isLoading: creating }] = useCreateEmployeeMutation();
  const [updateEmployee, { isLoading: updating }] = useUpdateEmployeeMutation();
  const isSubmitting = creating || updating;

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      documentNumber: "",
      email: "",
      mobilePhone: "",
      address: "",
      birthDate: "",
      employeeType: EmployeeType.NONE,
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (employee) {
      console.log("Populating form with employee data:", employee);
      form.reset({
        firstName: employee.firstName,
        lastName: employee.lastName,
        documentNumber: employee.documentNumber,
        identificationType: employee.identificationType,
        email: employee.email,
        mobilePhone: employee.mobilePhone ?? "",
        address: employee.address ?? "",
        birthDate: employee.birthDate ?? "",
        country: employee.country,
        gender: employee.gender,
        employeeType: employee.employeeType ?? EmployeeType.NONE,
        userId: employee.userId ?? "",
      });
    }
  }, [employee]);

  const onSubmit = async (values: EmployeeFormValues) => {
    const payload = {
      ...values,
      mobilePhone: values.mobilePhone || undefined,
      address: values.address || undefined,
      birthDate: values.birthDate || undefined,
      userId: values.userId ? Number(values.userId) : undefined,
    };

    try {
      if (isEdit) {
        await updateEmployee({ id: Number(id), body: payload }).unwrap();
      } else {
        await createEmployee(payload as any).unwrap();
      }
      navigate("/modules/personal/employees");
    } catch (err) {
      console.error(err);
    }
  };

  if (isEdit && loadingEmployee) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/modules/personal/employees")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEdit ? "Editar Empleado" : "Nuevo Empleado"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEdit
              ? "Modifica los datos del empleado."
              : "Completa los datos para registrar un nuevo empleado."}
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datos Personales</CardTitle>
            <CardDescription>
              Información de identificación del empleado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
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
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="identificationType"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="identificationType">
                        Tipo de Documento
                      </FieldLabel>
                      <Select
                        key={field.value ?? "empty"}
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id="identificationType"
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(IdentificationTypeLabel).map(
                            ([k, v]) => (
                              <SelectItem key={k} value={k}>
                                {v}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="documentNumber"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="documentNumber">
                        Número de Documento
                      </FieldLabel>
                      <Input
                        id="documentNumber"
                        placeholder="12345678"
                        {...field}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="gender"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="gender">Género</FieldLabel>
                      <Select
                        key={field.value ?? "empty"}
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id="gender"
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(GenderLabel).map(([k, v]) => (
                            <SelectItem key={k} value={k}>
                              {v}
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
                <Controller
                  name="birthDate"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="birthDate">
                        Fecha de Nacimiento
                      </FieldLabel>
                      <Input
                        id="birthDate"
                        type="date"
                        {...field}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="country"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="country">País</FieldLabel>
                      <Select
                        key={field.value ?? "empty"}
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id="country"
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CountryLabel).map(([k, v]) => (
                            <SelectItem key={k} value={k}>
                              {v}
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
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Contact data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datos de Contacto</CardTitle>
            <CardDescription>Correo, teléfono y dirección.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="email">
                        Correo Electrónico
                      </FieldLabel>
                      <Input
                        id="email"
                        type="email"
                        placeholder="juan@empresa.com"
                        {...field}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="mobilePhone"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="mobilePhone">
                        Teléfono Móvil
                      </FieldLabel>
                      <Input
                        id="mobilePhone"
                        placeholder="+51 999 999 999"
                        {...field}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
              <Controller
                name="address"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="address">Dirección</FieldLabel>
                    <Input
                      id="address"
                      placeholder="Av. Principal 123, Lima"
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

        {/* System */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datos del Sistema</CardTitle>
            <CardDescription>
              Tipo de empleado y vinculación con el usuario del sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Controller
              name="employeeType"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="max-w-xs">
                  <FieldLabel htmlFor="employeeType">Tipo de Empleado</FieldLabel>
                  <Select
                    key={field.value ?? "empty"}
                    value={field.value ?? undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="employeeType" aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(EmployeeTypeLabel).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
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
            <Controller
              name="userId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="max-w-xs">
                  <FieldLabel htmlFor="userId">ID de Usuario</FieldLabel>
                  <Input
                    id="userId"
                    type="number"
                    placeholder="ID del usuario vinculado"
                    {...field}
                    value={field.value ?? ""}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/modules/personal/employees")}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isEdit ? "Guardar Cambios" : "Crear Empleado"}
          </Button>
        </div>
      </form>
    </div>
  );
};
