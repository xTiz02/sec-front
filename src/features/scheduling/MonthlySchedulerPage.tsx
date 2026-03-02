import { useCallback, useMemo, useState } from "react";
import { Month } from "@/features/assignment/api/assignmentModel";
import { GuardType } from "@/features/guard/api/guardModel";
import type { GuardDto } from "@/features/guard/api/guardModel";
import { TurnType } from "@/features/contractSchedule/api/contractScheduleModel";
import {
  MONTH_INDEX,
  getDayStats,
  ScheduleAssignmentType,
} from "./api/monthlySchedulerModel";
import {
  useGetScheduleMonthlyByPeriodQuery,
  useGenerateMonthScheduleMutation,
  useGetGuardUnityScheduleAssignmentsQuery,
  useGetCalendarAssignmentsQuery,
  useUpdateGuardUnityScheduleAssignmentMutation,
  useAddDailyAssignmentMutation,
  useRemoveDailyAssignmentMutation,
  useCreateGuardMonthlyAssignmentMutation,
  useDeleteGuardMonthlyAssignmentMutation,
  useCreateBulkFreeDayAssignmentsMutation,
  useCreateBulkVacationAssignmentsMutation,
  useRemoveVacationAssignmentMutation,
} from "./api/monthlySchedulerApi";
import { useGetContractSchedulesByContractIdQuery } from "@/features/contractSchedule/api/contractScheduleApi";
import { SchedulerFilters } from "./components/SchedulerFilters";
import { MonthCalendar } from "./components/MonthCalendar";
import { DayDetailPanel } from "./components/DayDetailPanel";
import { Loader2, CalendarDays } from "lucide-react";
import { INDEX_TO_MONTH } from "./api/monthlySchedulerModel";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function currentMonth(): Month {
  return INDEX_TO_MONTH[new Date().getMonth()];
}

function currentYear(): number {
  return new Date().getFullYear();
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MonthlySchedulerPage() {
  // ── Filter state ─────────────────────────────────────────────────────────
  const [contractId, setContractId] = useState<number | undefined>();
  const [contractUnityId, setContractUnityId] = useState<number | undefined>();
  const [month, setMonth] = useState<Month>(currentMonth());
  const [year, setYear] = useState<number>(currentYear());
  const [selectedDate, setSelectedDate] = useState<string | undefined>();

  // ── Schedule monthly check ────────────────────────────────────────────────
  const { data: scheduleMonthly, isLoading: isLoadingSchedule } =
    useGetScheduleMonthlyByPeriodQuery(
      { month, year },
      { skip: contractUnityId == null },
    );

  const scheduleMonthlyId = scheduleMonthly?.id;

  // ── Contract schedule templates (required guard counts per day of week) ──
  const { data: contractSchedules = [] } =
    useGetContractSchedulesByContractIdQuery(contractUnityId!, {
      skip: contractUnityId == null,
    });

  // ── Guard-unit assignments for the month ──────────────────────────────────
  const { data: guardSchedules = [], isLoading: isLoadingGuardSchedules } =
    useGetGuardUnityScheduleAssignmentsQuery(
      {
        contractUnityId: contractUnityId!,
        scheduleMonthlyId: scheduleMonthlyId!,
      },
      { skip: contractUnityId == null || scheduleMonthlyId == null },
    );

  // ── Calendar assignments (all DateGuardUnityAssignment for the month) ─────
  const { data: calendarAssignments = [], isLoading: isLoadingCalendar } =
    useGetCalendarAssignmentsQuery(
      {
        contractUnityId: contractUnityId!,
        scheduleMonthlyId: scheduleMonthlyId!,
      },
      { skip: contractUnityId == null || scheduleMonthlyId == null },
    );

  // ── Mutations ─────────────────────────────────────────────────────────────
  const [generateMonthSchedule, { isLoading: isGenerating }] =
    useGenerateMonthScheduleMutation();
  const [updateGuardUnitySchedule] =
    useUpdateGuardUnityScheduleAssignmentMutation();
  const [addDailyAssignment] = useAddDailyAssignmentMutation();
  const [removeDailyAssignment] = useRemoveDailyAssignmentMutation();
  const [createGuardMonthlyAssignment] =
    useCreateGuardMonthlyAssignmentMutation();
  const [deleteGuardMonthlyAssignment] =
    useDeleteGuardMonthlyAssignmentMutation();
  const [createBulkFreeDayAssignments] =
    useCreateBulkFreeDayAssignmentsMutation();
  const [createBulkVacationAssignments] =
    useCreateBulkVacationAssignmentsMutation();
  const [removeVacationAssignment] = useRemoveVacationAssignmentMutation();

  // ── Derived state ─────────────────────────────────────────────────────────
  const hasSchedule = scheduleMonthlyId != null;

  /** Assignments for the currently selected day */
  const selectedDayAssignments = useMemo(() => {
    if (!selectedDate) return [];
    return calendarAssignments.filter(
      (a) => a.date === selectedDate || a.dayOfMonth?.date === selectedDate,
    );
  }, [selectedDate, calendarAssignments]);

  /** Compute uncovered turns count (days with missing guards in the month) */
  const uncoveredTurns = useMemo(() => {
    if (!hasSchedule || calendarAssignments.length === 0) return 0;
    const monthIdx = MONTH_INDEX[month];
    const totalDays = new Date(year, monthIdx + 1, 0).getDate();
    let count = 0;
    for (let d = 1; d <= totalDays; d++) {
      const dt = new Date(year, monthIdx, d);
      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, "0");
      const dd = String(dt.getDate()).padStart(2, "0");
      const date = `${yyyy}-${mm}-${dd}`;
      const dow = dt.getDay();
      const dowEnums = [
        "SUNDAY",
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
      ];
      const template = contractSchedules.find(
        (t) => t.dayOfWeek === dowEnums[dow],
      );
      if (!template) continue;
      const requiredTotal =
        template.turnAndHours && template.turnAndHours.length > 0
          ? template.turnAndHours.reduce(
              (sum, t) => sum + (t.turnTemplate?.numGuards ?? 0),
              0,
            )
          : template.numOfGuards;
      const stats = getDayStats(date, calendarAssignments);
      if (stats.normalCount < requiredTotal) count++;
    }
    return count;
  }, [hasSchedule, calendarAssignments, contractSchedules, month, year]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleContractChange = useCallback((id: number | undefined) => {
    setContractId(id);
    setContractUnityId(undefined);
    setSelectedDate(undefined);
  }, []);

  const handleContractUnityChange = useCallback((id: number | undefined) => {
    setContractUnityId(id);
    setSelectedDate(undefined);
  }, []);

  const handleMonthChange = useCallback((m: Month) => {
    setMonth(m);
    setSelectedDate(undefined);
  }, []);

  const handleYearChange = useCallback((y: number) => {
    setYear(y);
    setSelectedDate(undefined);
  }, []);

  const handleDayClick = useCallback((date: string) => {
    setSelectedDate((prev) => (prev === date ? undefined : date));
  }, []);

  const handleGenerate = useCallback(
    async (scheduleName: string, scheduleDescription?: string) => {
      if (!contractUnityId) return;
      try {
        await generateMonthSchedule({
          contractUnityId,
          month,
          year,
          scheduleName,
          scheduleDescription,
        }).unwrap();
      } catch (err) {
        console.error("Error generating schedule:", err);
      }
    },
    [contractUnityId, month, year, generateMonthSchedule],
  );

  const handleUpdateGuardType = useCallback(
    async (scheduleAssignmentId: number, guardType: GuardType) => {
      await updateGuardUnitySchedule({
        id: scheduleAssignmentId,
        body: { guardType },
      }).unwrap();
    },
    [updateGuardUnitySchedule],
  );

  const handleAddAssignment = useCallback(
    async (guard: GuardDto, turnType: TurnType, guardType: GuardType) => {
      if (!selectedDate || !contractUnityId || !scheduleMonthlyId) return;

      // Step 1: find or create the GuardUnityScheduleAssignment (monthly pool entry)
      let gsId: number;
      const existingGs = guardSchedules.find(
        (g) => g.guardAssignment?.guardId === guard.id,
      );
      if (existingGs) {
        gsId = existingGs.id;
        // Update monthly type if changed
        if (guardType !== existingGs.guardType) {
          await updateGuardUnitySchedule({
            id: gsId,
            body: { guardType },
          }).unwrap();
        }
      } else {
        // Guard not in monthly pool yet — create the entry
        const newGs = await createGuardMonthlyAssignment({
          guardId: guard.id,
          contractUnityId,
          scheduleMonthlyId,
          guardType,
        }).unwrap();
        gsId = newGs.id;
      }

      // Step 2: resolve TurnAndHour.id from contractSchedules for this day + turnType
      const dowEnums = [
        "SUNDAY",
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
      ];
      const dowStr = dowEnums[new Date(selectedDate + "T00:00:00").getDay()];
      const dayTemplate = contractSchedules.find(
        (cs) => cs.dayOfWeek === dowStr,
      );
      const turnAndHourId =
        dayTemplate?.turnAndHours?.find(
          (t) => t.turnTemplate?.turnType === turnType,
        )?.id ?? null;

      // Step 3: create the daily assignment
      await addDailyAssignment({
        date: selectedDate,
        guardUnityScheduleAssignmentId: gsId,
        turnAndHourId,
        scheduleAssignmentType: ScheduleAssignmentType.NORMAL,
      }).unwrap();
    },
    [
      selectedDate,
      contractUnityId,
      scheduleMonthlyId,
      guardSchedules,
      contractSchedules,
      updateGuardUnitySchedule,
      createGuardMonthlyAssignment,
      addDailyAssignment,
    ],
  );

  const handleRemoveAssignment = useCallback(
    async (assignmentId: number) => {
      await removeDailyAssignment(assignmentId).unwrap();
    },
    [removeDailyAssignment],
  );

  const handleRemoveFromMonthlyPool = useCallback(
    async (gsId: number) => {
      await deleteGuardMonthlyAssignment(gsId).unwrap();
    },
    [deleteGuardMonthlyAssignment],
  );

  const handleAddFreeDay = useCallback(
    async (guard: GuardDto, guardType: GuardType, allWeekday: boolean) => {
      if (!selectedDate || !contractUnityId || !scheduleMonthlyId) return;

      // Step 1: find or create the monthly pool entry
      let gsId: number;
      const existingGs = guardSchedules.find(
        (g) => g.guardAssignment?.guardId === guard.id,
      );
      if (existingGs) {
        gsId = existingGs.id;
        if (guardType !== existingGs.guardType) {
          await updateGuardUnitySchedule({
            id: gsId,
            body: { guardType },
          }).unwrap();
        }
      } else {
        const newGs = await createGuardMonthlyAssignment({
          guardId: guard.id,
          contractUnityId,
          scheduleMonthlyId,
          guardType,
        }).unwrap();
        gsId = newGs.id;
      }

      // Step 2: create the FREE_DAY assignment(s)
      if (allWeekday) {
        // Bulk: compute all dates for this weekday in the month, send one request
        const targetJsDay = new Date(selectedDate + "T00:00:00").getDay();
        const monthIdx = MONTH_INDEX[month];
        const totalDays = new Date(year, monthIdx + 1, 0).getDate();
        const dates: string[] = [];
        for (let d = 1; d <= totalDays; d++) {
          const dt = new Date(year, monthIdx, d);
          if (dt.getDay() === targetJsDay) {
            const yyyy = dt.getFullYear();
            const mm = String(dt.getMonth() + 1).padStart(2, "0");
            const dd = String(dt.getDate()).padStart(2, "0");
            dates.push(`${yyyy}-${mm}-${dd}`);
          }
        }
        await createBulkFreeDayAssignments({
          guardUnityScheduleAssignmentId: gsId,
          dates,
        }).unwrap();
      } else {
        // Single day
        await createBulkFreeDayAssignments({
          dates: [selectedDate],
          guardUnityScheduleAssignmentId: gsId,
        }).unwrap();
      }
    },
    [
      selectedDate,
      contractUnityId,
      scheduleMonthlyId,
      guardSchedules,
      month,
      year,
      updateGuardUnitySchedule,
      createGuardMonthlyAssignment,
      createBulkFreeDayAssignments,
    ],
  );

  const handleAddVacation = useCallback(
    async (
      guard: GuardDto,
      guardType: GuardType,
      dateFrom: string,
      dateTo: string,
    ) => {
      if (!contractUnityId || !scheduleMonthlyId) return;

      // Find or create the monthly pool entry
      let gsId: number;
      const existingGs = guardSchedules.find(
        (g) => g.guardAssignment?.guardId === guard.id,
      );
      if (existingGs) {
        gsId = existingGs.id;
        if (guardType !== existingGs.guardType) {
          await updateGuardUnitySchedule({
            id: gsId,
            body: { guardType },
          }).unwrap();
        }
      } else {
        const newGs = await createGuardMonthlyAssignment({
          guardId: guard.id,
          contractUnityId,
          scheduleMonthlyId,
          guardType,
        }).unwrap();
        gsId = newGs.id;
      }

      await createBulkVacationAssignments({
        guardUnityScheduleAssignmentId: gsId,
        dateFrom,
        dateTo,
      }).unwrap();
    },
    [
      contractUnityId,
      scheduleMonthlyId,
      guardSchedules,
      updateGuardUnitySchedule,
      createGuardMonthlyAssignment,
      createBulkVacationAssignments,
    ],
  );

  const handleRemoveVacation = useCallback(
    async (assignmentId: number) => {
      await removeDailyAssignment(assignmentId).unwrap();
    },
    [removeDailyAssignment],
  );

  const isLoadingMain = isLoadingGuardSchedules || isLoadingCalendar;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* ── Top half: filters + calendar ─────────────────────────────────── */}
      <div
        className={`flex flex-col border-b-4 border-border relative shrink-0 ${
          selectedDate ? "min-h-[400px]" : "flex-1"
        }`}
      >
        {/* Filters */}
        <SchedulerFilters
          contractId={contractId}
          contractUnityId={contractUnityId}
          month={month}
          year={year}
          scheduleMonthly={scheduleMonthly ?? null}
          isLoadingSchedule={isLoadingSchedule}
          totalGuards={guardSchedules.length}
          uncoveredTurns={uncoveredTurns}
          isGenerating={isGenerating}
          onContractChange={handleContractChange}
          onContractUnityChange={handleContractUnityChange}
          onMonthChange={handleMonthChange}
          onYearChange={handleYearChange}
          onGenerate={handleGenerate}
        />

        {/* Calendar area */}
        <div className="flex-1 overflow-hidden relative">
          {/* Loading overlay */}
          {isLoadingMain && hasSchedule && (
            <div className="absolute inset-0 bg-background/60 z-20 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Empty state when no unit selected */}
          {contractUnityId == null ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center space-y-2">
                <CalendarDays className="h-12 w-12 text-muted-foreground/40 mx-auto" />
                <p className="text-muted-foreground font-medium">
                  Selecciona un contrato y una unidad para ver el planificador
                </p>
              </div>
            </div>
          ) : !hasSchedule && !isLoadingSchedule ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center space-y-2">
                <CalendarDays className="h-12 w-12 text-muted-foreground/40 mx-auto" />
                <p className="text-muted-foreground font-medium">
                  No existe un horario para {month} {year}
                </p>
                <p className="text-sm text-muted-foreground">
                  Haz clic en <strong>Generar</strong> para crear el horario de
                  esta unidad.
                </p>
              </div>
            </div>
          ) : (
            <MonthCalendar
              month={month}
              year={year}
              assignments={calendarAssignments}
              contractSchedules={contractSchedules}
              selectedDate={selectedDate}
              hasSchedule={hasSchedule}
              onDayClick={handleDayClick}
            />
          )}
        </div>
      </div>

      {/* ── Bottom half: day detail panel (only when day selected) ───────── */}
      {selectedDate && (
        <DayDetailPanel
          date={selectedDate}
          assignments={selectedDayAssignments}
          guardSchedules={guardSchedules}
          contractSchedules={contractSchedules}
          onClose={() => setSelectedDate(undefined)}
          onUpdateGuardType={handleUpdateGuardType}
          onAddAssignment={handleAddAssignment}
          onRemoveAssignment={handleRemoveAssignment}
          onRemoveFromMonthlyPool={handleRemoveFromMonthlyPool}
          onAddFreeDay={handleAddFreeDay}
          onAddVacation={handleAddVacation}
          onRemoveVacation={handleRemoveVacation}
        />
      )}
    </div>
  );
}
