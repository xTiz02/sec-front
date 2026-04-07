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

    /** Mark attendance (ENTRY / EXIT / BREAK_START / BREAK_END).
     *  Sent as multipart/form-data so the backend can forward the photo directly to S3. */
    markAttendance: builder.mutation<GuardAssistanceEventDto, CreateAssistanceEventRequest>({
      query: ({ dateGuardUnityAssignmentId, assistanceType, photoFile, latitude, longitude }) => {
        const formData = new FormData()
        formData.append("dateGuardUnityAssignmentId", String(dateGuardUnityAssignmentId))
        formData.append("assistanceType", assistanceType)
        if (photoFile) formData.append("photo", photoFile, photoFile.name)
        if (latitude != null) formData.append("latitude", String(latitude))
        if (longitude != null) formData.append("longitude", String(longitude))
        return { url: "/guard-assistance/mark", method: "POST", body: formData }
      },
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
