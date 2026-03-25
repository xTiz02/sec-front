import { baseApi } from "@/app/baseApi"
import type { ScheduleMonthlyDto, Month } from "@/features/assignment/api/assignmentModel"
import type {
  GuardUnityScheduleAssignmentDto,
  DateGuardUnityAssignmentDto,
  GenerateMonthScheduleRequest,
  UpdateGuardUnityScheduleRequest,
  CreateDailyAssignmentRequest,
  CreateGuardMonthlyAssignmentRequest,
  CreateBulkFreeDayRequest,
  CreateVacationAssignmentRequest,
} from "./monthlySchedulerModel"

export const monthlySchedulerApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // ── ScheduleMonthly ────────────────────────────────────────────────────

    /** Get a ScheduleMonthly by month + year (null if not found) */
    getScheduleMonthlyByPeriod: builder.query<
      ScheduleMonthlyDto | null,
      { month: Month; year: number }
    >({
      query: ({ month, year }) => ({
        url: `/schedule-monthly/by-period`,
        params: { month, year },
      }),
      providesTags: [{ type: "MonthSchedule", id: "PERIOD" }],
    }),

    // ── Generate monthly schedule (creates ScheduleMonthly + all assignments) ──

    generateMonthSchedule: builder.mutation<ScheduleMonthlyDto, GenerateMonthScheduleRequest>({
      query: body => ({ url: `/schedule-monthly/generate-month`, method: "POST", body }),
      invalidatesTags: [
        { type: "MonthSchedule", id: "PERIOD" },
        { type: "MonthSchedule", id: "LIST" },
        { type: "GuardUnitySchedule", id: "LIST" },
        { type: "DailyAssignment", id: "LIST" },
      ],
    }),

    // ── GuardUnityScheduleAssignment ───────────────────────────────────────

    /** All guard-unit-month assignments for a contractUnity + scheduleMonthly */
    getGuardUnityScheduleAssignments: builder.query<
      GuardUnityScheduleAssignmentDto[],
      { contractUnityId: number; scheduleMonthlyId: number }
    >({
      query: ({ contractUnityId, scheduleMonthlyId }) => ({
        url: `/guard-unity-schedule/by-contract-unity`,
        params: { contractUnityId, scheduleMonthlyId },
      }),
      providesTags: result =>
        result
          ? [
              ...result.map(g => ({ type: "GuardUnitySchedule" as const, id: g.id })),
              { type: "GuardUnitySchedule", id: "LIST" },
            ]
          : [{ type: "GuardUnitySchedule", id: "LIST" }],
    }),

    /** Update guardType for a guard in the current month (doesn't affect base profile) */
    updateGuardUnityScheduleAssignment: builder.mutation<
      GuardUnityScheduleAssignmentDto,
      { id: number; body: UpdateGuardUnityScheduleRequest }
    >({
      query: ({ id, body }) => ({
        url: `/guard-unity-schedule/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "GuardUnitySchedule", id },
        { type: "GuardUnitySchedule", id: "LIST" },
      ],
    }),

    // ── DateGuardUnityAssignment (Calendar data) ───────────────────────────

    /** All daily assignments for a contractUnity + scheduleMonthly (calendar view) */
    getCalendarAssignments: builder.query<
      DateGuardUnityAssignmentDto[],
      { contractUnityId: number; scheduleMonthlyId: number }
    >({
      query: ({ contractUnityId, scheduleMonthlyId }) => ({
        url: `/date-guard-unity-assignment/calendar`,
        params: { contractUnityId, scheduleMonthlyId },
      }),
      providesTags: result =>
        result
          ? [
              ...result.map(d => ({ type: "DailyAssignment" as const, id: d.id })),
              { type: "DailyAssignment", id: "LIST" },
            ]
          : [{ type: "DailyAssignment", id: "LIST" }],
    }),

    /** Add a guard to a specific day */
    addDailyAssignment: builder.mutation<DateGuardUnityAssignmentDto, CreateDailyAssignmentRequest>({
      query: body => ({ url: `/date-guard-unity-assignment`, method: "POST", body }),
      invalidatesTags: [{ type: "DailyAssignment", id: "LIST" }],
    }),

    /** Remove a guard from a specific day */
    removeDailyAssignment: builder.mutation<void, number>({
      query: id => ({ url: `/date-guard-unity-assignment/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "DailyAssignment", id },
        { type: "DailyAssignment", id: "LIST" },
        { type: "GuardUnitySchedule", id: "LIST" },
      ],
    }),

    // ── GuardUnityScheduleAssignment pool management ───────────────────────

    /** Add a guard to the monthly pool (creates GuardUnityScheduleAssignment) */
    createGuardMonthlyAssignment: builder.mutation<
      GuardUnityScheduleAssignmentDto,
      CreateGuardMonthlyAssignmentRequest
    >({
      query: body => ({ url: `/guard-unity-schedule`, method: "POST", body }),
      invalidatesTags: [{ type: "GuardUnitySchedule", id: "LIST" }],
    }),

    /** Remove a guard from the monthly pool (cascades to daily assignments) */
    deleteGuardMonthlyAssignment: builder.mutation<void, number>({
      query: id => ({ url: `/guard-unity-schedule/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "GuardUnitySchedule", id },
        { type: "GuardUnitySchedule", id: "LIST" },
        { type: "DailyAssignment", id: "LIST" },
      ],
    }),

    /** Create FREE_DAY assignments for a guard across multiple dates in one request */
    createBulkFreeDayAssignments: builder.mutation<
      DateGuardUnityAssignmentDto[],
      CreateBulkFreeDayRequest
    >({
      query: body => ({
        url: `/date-guard-unity-assignment/bulk-free-days`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "DailyAssignment", id: "LIST" }],
    }),

    /** Create a VACATIONAL assignment — single day (toDate omitted) or date range (toDate set) */
    createVacationAssignment: builder.mutation<
      DateGuardUnityAssignmentDto,
      CreateVacationAssignmentRequest
    >({
      query: body => ({
        url: `/date-guard-unity-assignment/vacation`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "DailyAssignment", id: "LIST" }],
    }),

    /** Remove a vacation assignment by id */
    removeVacationAssignment: builder.mutation<void, number>({
      query: id => ({ url: `/date-guard-unity-assignment/vacation/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "DailyAssignment", id },
        { type: "DailyAssignment", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetScheduleMonthlyByPeriodQuery,
  useGenerateMonthScheduleMutation,
  useGetGuardUnityScheduleAssignmentsQuery,
  useUpdateGuardUnityScheduleAssignmentMutation,
  useGetCalendarAssignmentsQuery,
  useAddDailyAssignmentMutation,
  useRemoveDailyAssignmentMutation,
  useCreateGuardMonthlyAssignmentMutation,
  useDeleteGuardMonthlyAssignmentMutation,
  useCreateBulkFreeDayAssignmentsMutation,
  useCreateVacationAssignmentMutation,
  useRemoveVacationAssignmentMutation,
} = monthlySchedulerApi
