import { baseApi } from "@/app/baseApi"
import type {
  ClientDto,
  CreateClientRequest,
  UpdateClientRequest,
} from "./clientModel"
import type { PageResponse } from "@/features/securiiy/api/securityModel"


const V1 = "/secure/api/v1"

// ─── Query params shared shape ─────────────────────────────────────────────────
export interface TableParams {
  page?: number
  size?: number
  sort?: string   // e.g. "lastName,asc"
  query?: string  // e.g. "lastName:garcia,active:true,"
}

export const operationsApi = baseApi.injectEndpoints({
  endpoints: builder => ({

    // ── Clients ────────────────────────────────────────────────────────────

    getClients: builder.query<PageResponse<ClientDto>, TableParams>({
      query: ({ page = 0, size = 10, sort, query }) => ({
        url: `/client/all`,
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
              ...result.content.map(c => ({ type: "Client" as const, id: c.id })),
              { type: "Client", id: "LIST" },
            ]
          : [{ type: "Client", id: "LIST" }],
    }),

    getClientById: builder.query<ClientDto, number>({
      query: id => `/client/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Client", id }],
    }),

    createClient: builder.mutation<ClientDto, CreateClientRequest>({
      query: body => ({ url: `/client`, method: "POST", body }),
      invalidatesTags: [{ type: "Client", id: "LIST" }],
    }),

    updateClient: builder.mutation<ClientDto, { id: number; body: UpdateClientRequest }>({
      query: ({ id, body }) => ({ url: `/client/${id}`, method: "PUT", body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Client", id },
        { type: "Client", id: "LIST" },
      ],
    }),

    deleteClient: builder.mutation<void, number>({
      query: id => ({ url: `/client/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Client", id },
        { type: "Client", id: "LIST" },
      ],
    }),
    
  }),
  overrideExisting: false,
})

export const {
  useGetClientsQuery,
  useGetClientByIdQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
} = operationsApi