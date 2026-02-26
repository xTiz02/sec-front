import { baseApi } from "@/app/baseApi"
import type { GuardDto, CreateGuardRequest, UpdateGuardRequest } from "./guardModel"
import type { PageResponse } from "@/features/securiiy/api/securityModel"
import type { TableParams } from "@/features/employee/api/employeeApi"

export const guardApi = baseApi.injectEndpoints({
  endpoints: builder => ({

    getGuards: builder.query<PageResponse<GuardDto>, TableParams>({
      query: ({ page = 0, size = 10, sort, query }) => ({
        url: `/guard/all`,
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
              ...result.content.map(g => ({ type: "Guard" as const, id: g.id })),
              { type: "Guard", id: "LIST" },
            ]
          : [{ type: "Guard", id: "LIST" }],
    }),

    getGuardById: builder.query<GuardDto, number>({
      query: id => `/guard/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Guard", id }],
    }),

    createGuard: builder.mutation<GuardDto, CreateGuardRequest>({
      query: body => ({ url: `/guard`, method: "POST", body }),
      invalidatesTags: [{ type: "Guard", id: "LIST" }],
    }),

    updateGuard: builder.mutation<GuardDto, { id: number; body: UpdateGuardRequest }>({
      query: ({ id, body }) => ({ url: `/guard/${id}`, method: "PUT", body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Guard", id },
        { type: "Guard", id: "LIST" },
      ],
    }),

    deleteGuard: builder.mutation<void, number>({
      query: id => ({ url: `/guard/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Guard", id },
        { type: "Guard", id: "LIST" },
      ],
    }),

  }),
  overrideExisting: false,
})

export const {
  useGetGuardsQuery,
  useGetGuardByIdQuery,
  useCreateGuardMutation,
  useUpdateGuardMutation,
  useDeleteGuardMutation,
} = guardApi
