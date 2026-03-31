import { baseApi } from "@/app/baseApi"
import type { ScheduleMonthlyDto, Month } from "@/features/assignment/api/assignmentModel"
import type { PageResponse } from "@/features/securiiy/api/securityModel"
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

export interface ScheduleMonthlyListParams {
  page?: number
  size?: number
  name?: string
  month?: Month
  year?: number
}

// ─── Excel import types ───────────────────────────────────────────────────────

export type ScheduleExcelValidationSuccess = {
  yearMonth: string
  totalDays: number
  cliente: string
  unidades: number
  filasExcel: number
}

export type ScheduleExcelValidationError = {
  position: string
  description: string
}

export type ScheduleExcelValidationResult =
  | ScheduleExcelValidationSuccess
  | ScheduleExcelValidationError

export interface ImportScheduleExcelResult {
  scheduleMonthlyId: number
}

export const monthlySchedulerApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // ── ScheduleMonthly ────────────────────────────────────────────────────

    /** Paginated list of all ScheduleMonthly records */
    getScheduleMonthlys: builder.query<PageResponse<ScheduleMonthlyDto>, ScheduleMonthlyListParams>({
      query: ({ page = 0, size = 10, name, month, year }) => ({
        url: `/schedule-monthly`,
        params: {
          page,
          size,
          ...(name ? { name } : {}),
          ...(month ? { month } : {}),
          ...(year ? { year } : {}),
        },
      }),
      providesTags: result =>
        result
          ? [
              ...result.content.map(s => ({ type: "MonthSchedule" as const, id: s.id })),
              { type: "MonthSchedule", id: "LIST" },
            ]
          : [{ type: "MonthSchedule", id: "LIST" }],
    }),

    /** Get a single ScheduleMonthly by id */
    getScheduleMonthlyById: builder.query<ScheduleMonthlyDto, number>({
      query: id => `/schedule-monthly/${id}`,
      providesTags: (_r, _e, id) => [{ type: "MonthSchedule", id }],
    }),

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

    /** All GuardUnityScheduleAssignments for a given scheduleMonthly (all contract unities) */
    getGuardUnitySchedulesByScheduleMonthly: builder.query<
      GuardUnityScheduleAssignmentDto[],
      number
    >({
      query: scheduleMonthlyId => ({
        url: `/guard-unity-schedule/by-schedule-monthly`,
        params: { scheduleMonthlyId },
      }),
      providesTags: result =>
        result
          ? [
              ...result.map(g => ({ type: "GuardUnitySchedule" as const, id: g.id })),
              { type: "GuardUnitySchedule", id: "LIST" },
            ]
          : [{ type: "GuardUnitySchedule", id: "LIST" }],
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

    // ── Excel import ───────────────────────────────────────────────────────

    /** Validate an Excel schedule file — returns preview info or validation error */
    validateScheduleExcel: builder.mutation<ScheduleExcelValidationResult, File>({
      query: file => {
        const formData = new FormData()
        formData.append("file", file)
        return {
          url: `/storage/schedule/upload-file/validate`,
          method: "POST",
          body: formData,
        }
      },
    }),

    /** Process and import a validated Excel schedule file.
     *  TODO: confirm the exact endpoint URL with the backend team.
     *  Returns { scheduleMonthlyId } on success. */
    importScheduleExcel: builder.mutation<ImportScheduleExcelResult, File>({
      query: file => {
        const formData = new FormData()
        formData.append("file", file)
        return {
          url: `/storage/schedule/upload-file/create`,
          method: "POST",
          body: formData,
        }
      },
      invalidatesTags: [
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
  useGetScheduleMonthlysQuery,
  useGetScheduleMonthlyByIdQuery,
  useGetScheduleMonthlyByPeriodQuery,
  useGetGuardUnitySchedulesByScheduleMonthlyQuery,
  useGenerateMonthScheduleMutation,
  useValidateScheduleExcelMutation,
  useImportScheduleExcelMutation,
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
