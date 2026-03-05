import { baseApi } from "@/app/baseApi"
import type {
  ScheduleExceptionDto,
  CreateScheduleExceptionRequest,
} from "./scheduleExceptionModel"

export const scheduleExceptionApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    /** All exceptions for a specific DateGuardUnityAssignment */
    getExceptionsByDateAssignment: builder.query<ScheduleExceptionDto[], number>({
      query: dateGuardUnityAssignmentId =>
        `/schedule-exception/by-date-assignment/${dateGuardUnityAssignmentId}`,
      providesTags: result =>
        result
          ? [
              ...result.map(e => ({ type: "ScheduleException" as const, id: e.id })),
              { type: "ScheduleException", id: "LIST" },
            ]
          : [{ type: "ScheduleException", id: "LIST" }],
    }),

    /** Create a new exception (absence + optional replacement) */
    createScheduleException: builder.mutation<
      ScheduleExceptionDto,
      CreateScheduleExceptionRequest
    >({
      query: body => ({ url: `/schedule-exception`, method: "POST", body }),
      invalidatesTags: [
        { type: "ScheduleException", id: "LIST" },
        { type: "DailyAssignment", id: "LIST" },
      ],
    }),

    /** Remove an exception record */
    deleteScheduleException: builder.mutation<void, number>({
      query: id => ({ url: `/schedule-exception/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "ScheduleException", id },
        { type: "ScheduleException", id: "LIST" },
        { type: "DailyAssignment", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetExceptionsByDateAssignmentQuery,
  useCreateScheduleExceptionMutation,
  useDeleteScheduleExceptionMutation,
} = scheduleExceptionApi
