import { baseApi } from "@/app/baseApi"
import type {
  UnitMonitoringStatusDto,
  GuardShiftDetailDto,
  LiveAssistanceEventDto,
} from "./monitoringModel"

export const monitoringApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    /** All contract unities with location + today's shift counts */
    getUnitMonitoringStatus: builder.query<UnitMonitoringStatusDto[], { date: string }>({
      query: ({ date }) => ({ url: `/monitoring/unit-status`, params: { date } }),
      providesTags: [{ type: "UnitMonitoring", id: "LIST" }],
    }),

    /** Guard shifts for a specific unit on a given date */
    getUnitShiftDetails: builder.query<
      GuardShiftDetailDto[],
      { contractUnityId: number; date: string }
    >({
      query: ({ contractUnityId, date }) => ({
        url: `/monitoring/unit-shifts`,
        params: { contractUnityId, date },
      }),
      providesTags: (_r, _e, { contractUnityId }) => [
        { type: "UnitMonitoring", id: contractUnityId },
      ],
    }),

    /** Recent assistance events for the live feed */
    getLiveAssistances: builder.query<LiveAssistanceEventDto[], { date: string }>({
      query: ({ date }) => ({ url: `/monitoring/live-assists`, params: { date } }),
      providesTags: [{ type: "GuardAssistance", id: "LIVE" }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetUnitMonitoringStatusQuery,
  useGetUnitShiftDetailsQuery,
  useGetLiveAssistancesQuery,
} = monitoringApi
