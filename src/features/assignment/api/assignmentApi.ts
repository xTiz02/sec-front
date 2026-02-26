import { baseApi } from "@/app/baseApi"
import type { PageResponse } from "@/features/securiiy/api/securityModel"
import type {
  EmployeeAssignmentMonthlyDto,
  ScheduleMonthlyDto,
  CreateEmployeeAssignmentRequest,
  UpdateEmployeeAssignmentRequest,
} from "./assignmentModel"

// ─── Query params ─────────────────────────────────────────────────────────────

export interface TableParams {
  page?: number
  size?: number
  sort?: string
  query?: string
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const assignmentApi = baseApi.injectEndpoints({
  endpoints: builder => ({

    // ── Employee Assignment Monthly ────────────────────────────────────────

    getAssignments: builder.query<PageResponse<EmployeeAssignmentMonthlyDto>, TableParams>({
      query: ({ page = 0, size = 10, sort, query }) => ({
        url: `/employee-assignment-monthly/all`,
        params: {
          page,
          size,
          ...(sort ? { sort } : {}),
          ...(query ? { query } : {}),
        },
      }),
      providesTags: result =>
        result
          ? [
              ...result.content.map(a => ({ type: "Assignment" as const, id: a.id })),
              { type: "Assignment", id: "LIST" },
            ]
          : [{ type: "Assignment", id: "LIST" }],
    }),

    getAssignmentById: builder.query<EmployeeAssignmentMonthlyDto, number>({
      query: id => `/employee-assignment-monthly/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Assignment", id }],
    }),

    createAssignment: builder.mutation<EmployeeAssignmentMonthlyDto, CreateEmployeeAssignmentRequest>({
      query: body => ({ url: `/employee-assignment-monthly`, method: "POST", body }),
      invalidatesTags: [{ type: "Assignment", id: "LIST" }],
    }),

    updateAssignment: builder.mutation<
      EmployeeAssignmentMonthlyDto,
      { id: number; body: UpdateEmployeeAssignmentRequest }
    >({
      query: ({ id, body }) => ({ url: `/employee-assignment-monthly/${id}`, method: "PUT", body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Assignment", id },
        { type: "Assignment", id: "LIST" },
      ],
    }),

    deleteAssignment: builder.mutation<void, number>({
      query: id => ({ url: `/employee-assignment-monthly/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Assignment", id },
        { type: "Assignment", id: "LIST" },
      ],
    }),

    // ── Schedule Monthly ───────────────────────────────────────────────────

    getScheduleMonthlyList: builder.query<PageResponse<ScheduleMonthlyDto>, TableParams>({
      query: ({ page = 0, size = 10, sort, query }) => ({
        url: `/schedule-monthly/all`,
        params: {
          page,
          size,
          ...(sort ? { sort } : {}),
          ...(query ? { query } : {}),
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
  }),
  overrideExisting: false,
})

export const {
  useGetAssignmentsQuery,
  useGetAssignmentByIdQuery,
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
  useGetScheduleMonthlyListQuery,
} = assignmentApi
