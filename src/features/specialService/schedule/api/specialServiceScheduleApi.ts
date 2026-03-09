import { baseApi } from "@/app/baseApi"
import type { PageResponse } from "@/features/securiiy/api/securityModel"
import type { TableParams } from "@/features/employee/api/employeeApi"
import type {
  SpecialServiceScheduleDto,
  SpecialServiceScheduleSummaryDto,
  SpecialServiceDayAssignmentDto,
  CreateSpecialServiceScheduleRequest,
  AddSpecialServiceAssignmentRequest,
  CreateSpecialServiceExceptionRequest,
} from "./specialServiceScheduleModel"
import type { ScheduleExceptionDto } from "@/features/scheduling/api/scheduleExceptionModel"

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

    /** Create an exception for a special service day assignment (backend creates GuardAssignment) */
    createSpecialServiceException: builder.mutation<
      ScheduleExceptionDto,
      CreateSpecialServiceExceptionRequest
    >({
      query: body => ({ url: `/schedule-exception/special-service`, method: "POST", body }),
      invalidatesTags: [
        { type: "ScheduleException", id: "LIST" },
        { type: "SpecialServiceSchedule", id: "LIST" },
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
  useCreateSpecialServiceExceptionMutation,
} = specialServiceScheduleApi
