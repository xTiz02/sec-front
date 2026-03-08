import { baseApi } from "@/app/baseApi"
import type {
  ExternalGuardDto,
  CreateExternalGuardRequest,
  UpdateExternalGuardRequest,
} from "./externalGuardModel"
import type { PageResponse } from "@/features/securiiy/api/securityModel"
import type { TableParams } from "@/features/employee/api/employeeApi"

export const externalGuardApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getExternalGuards: builder.query<PageResponse<ExternalGuardDto>, TableParams>({
      query: ({ page = 0, size = 10, sort, query }) => ({
        url: `/external-guard/all`,
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
              ...result.content.map(g => ({ type: "ExternalGuard" as const, id: g.id })),
              { type: "ExternalGuard", id: "LIST" },
            ]
          : [{ type: "ExternalGuard", id: "LIST" }],
    }),

    getExternalGuardById: builder.query<ExternalGuardDto, number>({
      query: id => `/external-guard/${id}`,
      providesTags: (_r, _e, id) => [{ type: "ExternalGuard", id }],
    }),

    createExternalGuard: builder.mutation<ExternalGuardDto, CreateExternalGuardRequest>({
      query: body => ({ url: `/external-guard`, method: "POST", body }),
      invalidatesTags: [{ type: "ExternalGuard", id: "LIST" }],
    }),

    updateExternalGuard: builder.mutation<
      ExternalGuardDto,
      { id: number; body: UpdateExternalGuardRequest }
    >({
      query: ({ id, body }) => ({ url: `/external-guard/${id}`, method: "PUT", body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "ExternalGuard", id },
        { type: "ExternalGuard", id: "LIST" },
      ],
    }),

    deleteExternalGuard: builder.mutation<void, number>({
      query: id => ({ url: `/external-guard/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "ExternalGuard", id },
        { type: "ExternalGuard", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetExternalGuardsQuery,
  useGetExternalGuardByIdQuery,
  useCreateExternalGuardMutation,
  useUpdateExternalGuardMutation,
  useDeleteExternalGuardMutation,
} = externalGuardApi
