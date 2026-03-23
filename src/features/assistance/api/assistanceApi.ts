import { baseApi } from "@/app/baseApi"
import type {
  GuardCurrentShiftDto,
  GuardAssistanceEventDto,
  GuardRequestDto,
  CreateAssistanceEventRequest,
  CreateLateJustificationRequest,
} from "./assistanceModel"

export const assistanceApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    /** Get the guard's current shift info + today's events + extra hours state */
    getCurrentShift: builder.query<GuardCurrentShiftDto, void>({
      query: () => "/guard-assistance/current-shift",
      providesTags: [{ type: "GuardAssistance", id: "CURRENT" }],
    }),

    /** Mark attendance (ENTRY / EXIT / BREAK_START / BREAK_END) */
    markAttendance: builder.mutation<GuardAssistanceEventDto, CreateAssistanceEventRequest>({
      query: body => ({ url: "/guard-assistance/mark", method: "POST", body }),
      invalidatesTags: [{ type: "GuardAssistance", id: "CURRENT" }],
    }),

    /** Submit a late-justification request for a given attendance event */
    submitLateJustification: builder.mutation<GuardRequestDto, CreateLateJustificationRequest>({
      query: body => ({ url: "/guard-request/late-justification", method: "POST", body }),
      invalidatesTags: [{ type: "GuardAssistance", id: "CURRENT" }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetCurrentShiftQuery,
  useMarkAttendanceMutation,
  useSubmitLateJustificationMutation,
} = assistanceApi
