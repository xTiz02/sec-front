import { baseApi } from "@/app/baseApi"
import type { PageResponse } from "@/features/securiiy/api/securityModel"
import type { EventAuditDto, EventAuditParams } from "./eventAuditModel"

export const eventAuditApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getEventAudits: builder.query<PageResponse<EventAuditDto>, EventAuditParams>({
      query: ({ term, page = 0, size = 20 }) => ({
        url: `/events/all`,
        params: {
          page,
          size,
          ...(term ? { term } : {}),
        },
      }),
      providesTags: [{ type: "Attendance", id: "EVENT_AUDIT" }],
    }),
  }),
  overrideExisting: false,
})

export const { useGetEventAuditsQuery } = eventAuditApi
