import { baseApi } from "@/app/baseApi"
import type {
  SpecialServiceUnityDto,
  CreateSpecialServiceUnityRequest,
  UpdateSpecialServiceUnityRequest,
} from "./specialServiceUnityModel"
import type { PageResponse } from "@/features/securiiy/api/securityModel"
import type { TableParams } from "@/features/employee/api/employeeApi"

export const specialServiceUnityApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getSpecialServiceUnities: builder.query<PageResponse<SpecialServiceUnityDto>, TableParams>({
      query: ({ page = 0, size = 10, sort, query }) => ({
        url: `/special-service-unity/all`,
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
              ...result.content.map(u => ({ type: "SpecialServiceUnity" as const, id: u.id })),
              { type: "SpecialServiceUnity", id: "LIST" },
            ]
          : [{ type: "SpecialServiceUnity", id: "LIST" }],
    }),

    getSpecialServiceUnityById: builder.query<SpecialServiceUnityDto, number>({
      query: id => `/special-service-unity/${id}`,
      providesTags: (_r, _e, id) => [{ type: "SpecialServiceUnity", id }],
    }),

    createSpecialServiceUnity: builder.mutation<
      SpecialServiceUnityDto,
      CreateSpecialServiceUnityRequest
    >({
      query: body => ({ url: `/special-service-unity`, method: "POST", body }),
      invalidatesTags: [{ type: "SpecialServiceUnity", id: "LIST" }],
    }),

    updateSpecialServiceUnity: builder.mutation<
      SpecialServiceUnityDto,
      { id: number; body: UpdateSpecialServiceUnityRequest }
    >({
      query: ({ id, body }) => ({ url: `/special-service-unity/${id}`, method: "PUT", body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "SpecialServiceUnity", id },
        { type: "SpecialServiceUnity", id: "LIST" },
      ],
    }),

    deleteSpecialServiceUnity: builder.mutation<void, number>({
      query: id => ({ url: `/special-service-unity/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "SpecialServiceUnity", id },
        { type: "SpecialServiceUnity", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetSpecialServiceUnitiesQuery,
  useGetSpecialServiceUnityByIdQuery,
  useCreateSpecialServiceUnityMutation,
  useUpdateSpecialServiceUnityMutation,
  useDeleteSpecialServiceUnityMutation,
} = specialServiceUnityApi
