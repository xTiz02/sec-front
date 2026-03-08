import { baseApi } from "@/app/baseApi"
import type { PageResponse } from "@/features/securiiy/api/securityModel"
import type { TableParams } from "@/features/employee/api/employeeApi"
import type {
  SpecialServiceScheduleDto,
  SpecialServiceScheduleSummaryDto,
  SpecialServiceDayAssignmentDto,
  CreateSpecialServiceScheduleRequest,
  AddSpecialServiceAssignmentRequest,
} from "./specialServiceScheduleModel"

export const specialServiceScheduleApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getSpecialServiceSchedules: builder.query<
      PageResponse<SpecialServiceScheduleSummaryDto>,
      TableParams
    >({
      query: ({ page = 0, size = 10, sort, query }) => ({
        url: `/special-service-schedule/all`,
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
              ...result.content.map(s => ({ type: "SpecialServiceSchedule" as const, id: s.id })),
              { type: "SpecialServiceSchedule", id: "LIST" },
            ]
          : [{ type: "SpecialServiceSchedule", id: "LIST" }],
    }),

    getSpecialServiceScheduleById: builder.query<SpecialServiceScheduleDto, number>({
      query: id => `/special-service-schedule/${id}`,
      providesTags: (_r, _e, id) => [{ type: "SpecialServiceSchedule", id }],
    }),

    createSpecialServiceSchedule: builder.mutation<
      SpecialServiceScheduleDto,
      CreateSpecialServiceScheduleRequest
    >({
      query: body => ({ url: `/special-service-schedule`, method: "POST", body }),
      invalidatesTags: [{ type: "SpecialServiceSchedule", id: "LIST" }],
    }),

    deleteSpecialServiceSchedule: builder.mutation<void, number>({
      query: id => ({ url: `/special-service-schedule/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "SpecialServiceSchedule", id },
        { type: "SpecialServiceSchedule", id: "LIST" },
      ],
    }),

    addSpecialServiceAssignment: builder.mutation<
      SpecialServiceDayAssignmentDto,
      { scheduleId: number; body: AddSpecialServiceAssignmentRequest }
    >({
      query: ({ scheduleId, body }) => ({
        url: `/special-service-schedule/${scheduleId}/assignment`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { scheduleId }) => [
        { type: "SpecialServiceSchedule", id: scheduleId },
      ],
    }),

    removeSpecialServiceAssignment: builder.mutation<void, { assignmentId: number; scheduleId: number }>({
      query: ({ assignmentId }) => ({
        url: `/special-service-schedule/assignment/${assignmentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { scheduleId }) => [
        { type: "SpecialServiceSchedule", id: scheduleId },
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetSpecialServiceSchedulesQuery,
  useGetSpecialServiceScheduleByIdQuery,
  useCreateSpecialServiceScheduleMutation,
  useDeleteSpecialServiceScheduleMutation,
  useAddSpecialServiceAssignmentMutation,
  useRemoveSpecialServiceAssignmentMutation,
} = specialServiceScheduleApi
