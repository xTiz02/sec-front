import { baseApi } from "@/app/baseApi"
import type {
  UnityDto,
  CreateUnityRequest,
  UpdateUnityRequest,
} from "./unityModel"
import type { PageResponse } from "@/features/securiiy/api/securityModel"

  // ─── Query params shared shape ─────────────────────────────────────────────────
export interface TableParams {
  page?: number
  size?: number
  sort?: string   // e.g. "lastName,asc"
  query?: string  // e.g. "lastName:garcia,active:true,"
}

export const operationsApi = baseApi.injectEndpoints({
  endpoints: builder => ({

    // ── Unities ────────────────────────────────────────────────────────────

    getUnities: builder.query<PageResponse<UnityDto>, TableParams>({
      query: ({ page = 0, size = 10, sort, query }) => ({
        url: `/unity/all`,
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
              ...result.content.map(u => ({ type: "Unity" as const, id: u.id })),
              { type: "Unity", id: "LIST" },
            ]
          : [{ type: "Unity", id: "LIST" }],
    }),

    getUnityById: builder.query<UnityDto, number>({
      query: id => `/unity/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Unity", id }],
    }),

    createUnity: builder.mutation<UnityDto, CreateUnityRequest>({
      query: body => ({ url: `/unity`, method: "POST", body }),
      invalidatesTags: [{ type: "Unity", id: "LIST" }],
    }),

    updateUnity: builder.mutation<UnityDto, { id: number; body: UpdateUnityRequest }>({
      query: ({ id, body }) => ({ url: `/unity/${id}`, method: "PUT", body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Unity", id },
        { type: "Unity", id: "LIST" },
      ],
    }),

    deleteUnity: builder.mutation<void, number>({
      query: id => ({ url: `/unity/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Unity", id },
        { type: "Unity", id: "LIST" },
      ],
    }),

  }),
  overrideExisting: false,
})

export const {
  useGetUnitiesQuery,
  useGetUnityByIdQuery,
  useCreateUnityMutation,
  useUpdateUnityMutation,
  useDeleteUnityMutation,
} = operationsApi