import { baseApi } from "@/app/baseApi"
import type { PageResponse } from "@/features/securiiy/api/securityModel"
import type {
  GuardLiteView,
  UnityLiteView,
  ShiftSearchParams,
  ShiftSearchResultDto,
} from "./shiftSearchModel"

export const shiftSearchApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    /** Unified Guard + ExternalGuard search (any field match) */
    searchGuardLite: builder.query<
      PageResponse<GuardLiteView>,
      { searchTerm?: string; page?: number; size?: number }
    >({
      query: ({ searchTerm = "", page = 0, size = 20 }) => ({
        url: `/guard/lite-search`,
        params: { searchTerm, page, size },
      }),
    }),

    /** Unified Unity + SpecialServiceUnity search (any field match) */
    searchUnityLite: builder.query<
      PageResponse<UnityLiteView>,
      { searchTerm?: string; page?: number; size?: number }
    >({
      query: ({ searchTerm = "", page = 0, size = 20 }) => ({
        url: `/unity/lite-search`,
        params: { searchTerm, page, size },
      }),
    }),

    /** Paginated search of DateGuardUnityAssignment with all filters */
    searchShifts: builder.query<PageResponse<ShiftSearchResultDto>, ShiftSearchParams>({
      query: params => ({
        url: `/date-guard-unity-assignment/search`,
        params,
      }),
      providesTags: [{ type: "DailyAssignment", id: "SEARCH" }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useSearchGuardLiteQuery,
  useSearchUnityLiteQuery,
  useSearchShiftsQuery,
} = shiftSearchApi
