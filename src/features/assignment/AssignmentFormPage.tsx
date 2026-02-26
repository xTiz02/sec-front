import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  useGetAssignmentByIdQuery,
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
} from "./api/assignmentApi"
import {
  ZoneType,
  ZoneTypeLabel,
  Month,
  MonthLabel,
  type ScheduleMonthlyDto,
  type CreateEmployeeAssignmentRequest,
  type UpdateEmployeeAssignmentRequest,
} from "./api/assignmentModel"
import type { UnityDto } from "@/features/unity/api/unityModel"

import { EmployeeSelector } from "@/components/select/EmployeeSelector"
import { ScheduleMonthlySelector } from "@/components/select/ScheduleMonthlySelector"
import { UnitySelector } from "@/components/select/UnitySelector"

import { Field, FieldError, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Building2,
  Info,
  Loader2,
  MapPin,
  PlusCircle,
  Save,
  Trash2,
  UserSearch,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface SelectedUnit {
  unityId: number
  unity: UnityDto
  zoneType: ZoneType
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const assignmentSchema = z.object({
  employeeId: z.coerce
    .number({ required_error: "El jefe de operaciones es requerido" })
    .min(1, "Seleccione un jefe de operaciones"),
  scheduleMonthlyId: z.coerce.number().optional().nullable(),
  zoneType: z.nativeEnum(ZoneType, {
    required_error: "La zona es requerida",
  }),
  month: z.nativeEnum(Month, {
    required_error: "El mes es requerido",
  }),
  year: z.coerce
    .number({ required_error: "El año es requerido" })
    .min(2020, "Año inválido")
    .max(2100, "Año inválido"),
})

type AssignmentFormValues = z.infer<typeof assignmentSchema>

// ─── Component ────────────────────────────────────────────────────────────────

export const AssignmentFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id

  // ── API hooks ──────────────────────────────────────────────────────────────

  const { data: assignment, isLoading: loadingAssignment } = useGetAssignmentByIdQuery(
    Number(id),
    { skip: !isEdit },
  )

  const [createAssignment, { isLoading: creating }] = useCreateAssignmentMutation()
  const [updateAssignment, { isLoading: updating }] = useUpdateAssignmentMutation()
  const isSubmitting = creating || updating

  // ── Form ───────────────────────────────────────────────────────────────────

  const currentYear = new Date().getFullYear()

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      employeeId: undefined,
      scheduleMonthlyId: null,
      zoneType: ZoneType.NORTE,
      month: Month.JANUARY,
      year: currentYear,
    },
  })

  const watchZoneType = form.watch("zoneType")

  // ── Local state: selected units ────────────────────────────────────────────

  const [selectedUnits, setSelectedUnits] = useState<SelectedUnit[]>([])
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [localSearch, setLocalSearch] = useState("")
  const [isDirty, setIsDirty] = useState(false)

  // Track selected ScheduleMonthly for auto-fill
  const [selectedScheduleMonthly, setSelectedScheduleMonthly] =
    useState<ScheduleMonthlyDto | null>(null)

  // ── Populate form on edit ──────────────────────────────────────────────────

  useEffect(() => {
    if (assignment) {
      form.reset({
        employeeId: assignment.employeeId,
        scheduleMonthlyId: assignment.scheduleMonthlyId ?? null,
        zoneType: assignment.zoneType,
        month: assignment.month,
        year: assignment.year,
      })

      if (assignment.scheduleMonthly) {
        setSelectedScheduleMonthly(assignment.scheduleMonthly)
      }

      if (assignment.unitAssignments) {
        setSelectedUnits(
          assignment.unitAssignments.map(ua => ({
            unityId: ua.unityId,
            unity: ua.unity!,
            zoneType: ua.zoneType,
          })),
        )
      }
    }
  }, [assignment])

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleAddUnits = useCallback(
    (unityIds: number | number[]) => {
      // UnitySelector with multiple returns number[]
      // We need to fetch unity data — for now we store the IDs
      // The selector already provides the data through its internal query
      // But we only get IDs back. We'll handle this by adding a placeholder.
      // In practice, we need the full unity info. We'll refetch or use cache.
    },
    [],
  )

  const handleAddMultipleUnities = useCallback(
    (ids: number[]) => {
      setSelectedUnits(prev => {
        const existingIds = new Set(prev.map(u => u.unityId))
        const newItems = ids
          .filter(id => !existingIds.has(id))
          .map(id => ({
            unityId: id,
            unity: { id, name: "", code: "", active: true } as UnityDto,
            zoneType: watchZoneType,
          }))
        return [...prev, ...newItems]
      })
      setIsDirty(true)
      setAddDialogOpen(false)
    },
    [watchZoneType],
  )

  const handleRemoveUnit = useCallback((unityId: number) => {
    setSelectedUnits(prev => prev.filter(u => u.unityId !== unityId))
    setIsDirty(true)
  }, [])

  const handleUnitZoneChange = useCallback((unityId: number, zone: ZoneType) => {
    setSelectedUnits(prev =>
      prev.map(u => (u.unityId === unityId ? { ...u, zoneType: zone } : u)),
    )
    setIsDirty(true)
  }, [])

  // ── Computed ───────────────────────────────────────────────────────────────

  const filteredUnits = useMemo(() => {
    if (!localSearch.trim()) return selectedUnits
    const search = localSearch.toLowerCase()
    return selectedUnits.filter(
      u =>
        u.unity.name?.toLowerCase().includes(search) ||
        u.unity.code?.toLowerCase().includes(search) ||
        u.unity.clientName?.toLowerCase().includes(search),
    )
  }, [selectedUnits, localSearch])

  const uniqueZones = useMemo(() => {
    const zones = new Set(selectedUnits.map(u => u.zoneType))
    return zones.size
  }, [selectedUnits])

  // ── Submit ─────────────────────────────────────────────────────────────────

  const onSubmit = async (values: AssignmentFormValues) => {
    const unitAssignments = selectedUnits.map(u => ({
      unityId: u.unityId,
      zoneType: u.zoneType,
    }))

    try {
      if (isEdit) {
        const body: UpdateEmployeeAssignmentRequest = {
          ...values,
          scheduleMonthlyId: values.scheduleMonthlyId ?? undefined,
          unitAssignments,
        }
        await updateAssignment({ id: Number(id), body }).unwrap()
      } else {
        const body: CreateEmployeeAssignmentRequest = {
          employeeId: values.employeeId,
          scheduleMonthlyId: values.scheduleMonthlyId ?? undefined,
          zoneType: values.zoneType,
          month: values.month,
          year: values.year,
          unitAssignments,
        }
        await createAssignment(body).unwrap()
      }
      navigate("/modules/scheduling/assignments")
    } catch (err) {
      console.error(err)
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────

  if (isEdit && loadingAssignment) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Year options
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 2 + i)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/modules/scheduling/assignments")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEdit ? "Editar Asignación" : "Configuración de Asignación"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Administre las zonas y unidades supervisadas por cada Jefe de Operaciones.
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── Left Column ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-4 space-y-6">
            {/* Supervisor & Period Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <UserSearch className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Datos del Supervisor</CardTitle>
                    <CardDescription>Defina quién y cuándo</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  {/* Employee Selector */}
                  <Controller
                    name="employeeId"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Jefe de Operaciones</FieldLabel>
                        <EmployeeSelector
                          value={field.value}
                          onChange={val => field.onChange(val)}
                          placeholder="Seleccionar Jefe..."
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  {/* Schedule Monthly Selector */}
                  <div className="border-t pt-4">
                    <Field>
                      <FieldLabel>Entidad de Mes (Predefinido)</FieldLabel>
                      <ScheduleMonthlySelector
                        value={form.watch("scheduleMonthlyId") ?? undefined}
                        onChange={val => {
                          form.setValue("scheduleMonthlyId", val)
                          if (val === null) {
                            setSelectedScheduleMonthly(null)
                          }
                        }}
                        placeholder="Usar configuración manual..."
                      />
                    </Field>
                  </div>

                  {/* Month & Year */}
                  <div className="grid grid-cols-2 gap-4">
                    <Controller
                      name="month"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel>Mes</FieldLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={!!selectedScheduleMonthly}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Mes" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(Month).map(m => (
                                <SelectItem key={m} value={m}>
                                  {MonthLabel[m]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />
                    <Controller
                      name="year"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel>Año</FieldLabel>
                          <Select
                            value={String(field.value)}
                            onValueChange={v => field.onChange(Number(v))}
                            disabled={!!selectedScheduleMonthly}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Año" />
                            </SelectTrigger>
                            <SelectContent>
                              {yearOptions.map(y => (
                                <SelectItem key={y} value={String(y)}>
                                  {y}
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

            {/* Zone Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                    <MapPin className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Zona Principal</CardTitle>
                    <CardDescription>Área de influencia predeterminada</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Controller
                  name="zoneType"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Seleccionar Zona</FieldLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar zona" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(ZoneType).map(z => (
                            <SelectItem key={z} value={z}>
                              {ZoneTypeLabel[z]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Esta zona se aplicará por defecto a las nuevas unidades agregadas.
                      </p>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-4">
                  <span className="text-3xl font-black text-primary">
                    {selectedUnits.length}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Unidades Total
                  </span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-4">
                  <span className="text-3xl font-black text-emerald-500">
                    {uniqueZones}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Zonas Activas
                  </span>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* ── Right Column ────────────────────────────────────────────────── */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Unit Selection Card */}
            <Card className="flex-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                      <Building2 className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Selección de Unidades</CardTitle>
                      <CardDescription>Agregue unidades a la supervisión</CardDescription>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-primary"
                    onClick={() => setAddDialogOpen(!addDialogOpen)}
                  >
                    <PlusCircle className="mr-1 h-4 w-4" />
                    Agregar Unidades
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Units Selector (collapsible) */}
                {addDialogOpen && (
                  <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                    <FieldLabel>Buscar y seleccionar unidades</FieldLabel>
                    <UnitySelector
                      multiple
                      placeholder="Buscar unidad por nombre..."
                      onChange={ids => {
                        handleAddMultipleUnities(ids as number[])
                      }}
                    />
                  </div>
                )}

                {/* Search */}
                <div className="relative">
                  <Input
                    placeholder="Filtrar unidades por nombre, código o cliente..."
                    value={localSearch}
                    onChange={e => setLocalSearch(e.target.value)}
                    className="pl-10"
                  />
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>

                {/* Units Table */}
                {selectedUnits.length > 0 ? (
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Unidad</TableHead>
                          <TableHead>Zona de Supervisión</TableHead>
                          <TableHead className="text-right w-[80px]">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUnits.map(unit => (
                          <TableRow key={unit.unityId}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                                  <Building2 className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">
                                    {unit.unity.code || `U-${unit.unityId}`}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {unit.unity.name}
                                    {unit.unity.clientName && ` • ${unit.unity.clientName}`}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={unit.zoneType}
                                onValueChange={(v: ZoneType) =>
                                  handleUnitZoneChange(unit.unityId, v)
                                }
                              >
                                <SelectTrigger className="w-[160px] h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.values(ZoneType).map(z => (
                                    <SelectItem key={z} value={z}>
                                      {ZoneTypeLabel[z]}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => handleRemoveUnit(unit.unityId)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="flex items-center justify-between border-t px-4 py-3 bg-muted/30">
                      <span className="text-xs text-muted-foreground">
                        Mostrando {filteredUnits.length} de {selectedUnits.length} unidades
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
                    <Building2 className="h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      No hay unidades asignadas
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Utilice el botón "Agregar Unidades" para comenzar
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Bar */}
            <div className="flex items-center justify-between rounded-xl border bg-card p-4 sticky bottom-4 z-40 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                <span>
                  {isDirty || form.formState.isDirty
                    ? "Cambios no guardados"
                    : "Sin cambios pendientes"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/modules/scheduling/assignments")}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Guardar Asignación
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
