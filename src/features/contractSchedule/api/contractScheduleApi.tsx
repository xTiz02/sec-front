import { baseApi } from "@/app/baseApi"
import type {
  TurnTemplateDto,
  CreateTurnTemplateRequest,
  UpdateTurnTemplateRequest,
  ContractUnityDto,
  CreateContractUnityRequest,
  ContractScheduleUnitTemplateDto,
  TurnAndHourDto,
  WeeklyScheduleSummaryDto,
  AssignTurnsToWeekRequest,
  ClientContractDto,
  CreateClientContractRequest,
  UpdateClientContractRequest,
} from "./contractScheduleModel"
import type { PageResponse } from "@/features/securiiy/api/securityModel"


export interface TableParams {
  page?: number
  size?: number
  sort?: string
  query?: string
}

export const schedulingApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // ── Turn Templates ─────────────────────────────────────────────────────

    getTurnTemplates: builder.query<PageResponse<TurnTemplateDto>, TableParams>({
      query: ({ page = 0, size = 10, sort, query }) => ({
        url: `/turn-template/all`,
        params: { page, size, ...(sort ? { sort } : {}), ...(query ? { query } : {}) },
      }),
      providesTags: result =>
        result
          ? [
              ...result.content.map(t => ({ type: "TurnTemplate" as const, id: t.id })),
              { type: "TurnTemplate", id: "LIST" },
            ]
          : [{ type: "TurnTemplate", id: "LIST" }],
    }),

    getTurnTemplateById: builder.query<TurnTemplateDto, number>({
      query: id => `/turn-template/${id}`,
      providesTags: (_r, _e, id) => [{ type: "TurnTemplate", id }],
    }),

    createTurnTemplate: builder.mutation<TurnTemplateDto, CreateTurnTemplateRequest>({
      query: body => ({ url: `/turn-template`, method: "POST", body }),
      invalidatesTags: [{ type: "TurnTemplate", id: "LIST" }],
    }),

    updateTurnTemplate: builder.mutation<
      TurnTemplateDto,
      { id: number; body: UpdateTurnTemplateRequest }
    >({
      query: ({ id, body }) => ({ url: `/turn-template/${id}`, method: "PUT", body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "TurnTemplate", id },
        { type: "TurnTemplate", id: "LIST" },
      ],
    }),

    deleteTurnTemplate: builder.mutation<void, number>({
      query: id => ({ url: `/turn-template/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "TurnTemplate", id },
        { type: "TurnTemplate", id: "LIST" },
      ],
    }),

    // Get all turn templates (no pagination) for selects
    getAllTurnTemplates: builder.query<TurnTemplateDto[], void>({
      query: () => `/turn-template/list-all`,
      providesTags: [{ type: "TurnTemplate", id: "LIST" }],
    }),

   
    // ── Client Contract ────────────────────────────────────────────────────

    getClientContracts: builder.query<PageResponse<ClientContractDto>, TableParams>({
      query: ({ page = 0, size = 10, sort, query }) => ({
        url: `/client-contract/all`,
        params: { page, size, ...(sort ? { sort } : {}), ...(query ? { query } : {}) },
      }),
      providesTags: result =>
        result
          ? [
              ...result.content.map(c => ({ type: "ClientContract" as const, id: c.id })),
              { type: "ClientContract", id: "LIST" },
            ]
          : [{ type: "ClientContract", id: "LIST" }],
    }),

    getClientContractById: builder.query<ClientContractDto, number>({
      query: id => `/client-contract/${id}`,
      providesTags: (_r, _e, id) => [{ type: "ClientContract", id }],
    }),

    createClientContract: builder.mutation<ClientContractDto, CreateClientContractRequest>({
      query: body => ({ url: `/client-contract`, method: "POST", body }),
      invalidatesTags: [{ type: "ClientContract", id: "LIST" }],
    }),

    updateClientContract: builder.mutation<
      ClientContractDto,
      { id: number; body: UpdateClientContractRequest }
    >({
      query: ({ id, body }) => ({
        url: `/client-contract/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "ClientContract", id },
        { type: "ClientContract", id: "LIST" },
      ],
    }),

    deleteClientContract: builder.mutation<void, number>({
      query: id => ({ url: `/client-contract/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "ClientContract", id },
        { type: "ClientContract", id: "LIST" },
      ],
    }),

    // ── Contract Unity (many-to-many) ──────────────────────────────────────

    getContractUnitiesByContractId: builder.query<ContractUnityDto[], number>({
      query: contractId => `/contract-unity/by-contract/${contractId}`,
      providesTags: result =>
        result
          ? [
              ...result.map(cu => ({ type: "ContractUnity" as const, id: cu.id })),
              { type: "ContractUnity", id: "LIST" },
            ]
          : [{ type: "ContractUnity", id: "LIST" }],
    }),

    createContractUnity: builder.mutation<ContractUnityDto, CreateContractUnityRequest>({
      query: body => ({ url: `/contract-unity`, method: "POST", body }),
      invalidatesTags: [{ type: "ContractUnity", id: "LIST" }],
    }),

    deleteContractUnity: builder.mutation<void, number>({
      query: id => ({ url: `/contract-unity/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "ContractUnity", id },
        { type: "ContractUnity", id: "LIST" },
      ],
    }),

    // ── Weekly Schedule ────────────────────────────────────────────────────

    getWeeklyScheduleByContractId: builder.query<WeeklyScheduleSummaryDto[], number>({
      query: contractId => `/contract-schedule/by-contract/${contractId}`,
      providesTags: (_r, _e, id) => [
        { type: "WeeklySchedule", id },
        { type: "ContractScheduleUnitTemplate", id: "LIST" },
      ],
    }),

    saveWeeklySchedule: builder.mutation<void, AssignTurnsToWeekRequest>({
      query: body => ({
        url: `/contract-schedule/assign-weekly-turns`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { contractId }) => [
        { type: "WeeklySchedule", id: contractId },
        { type: "ContractUnity", id: "LIST" },
        { type: "ContractScheduleUnitTemplate", id: "LIST" },
        { type: "TurnAndHour", id: "LIST" },
      ],
    }),

    // ── Contract Schedule Unit Template ────────────────────────────────────

    getContractSchedulesByContractId: builder.query<
      ContractScheduleUnitTemplateDto[],
      number
    >({
      query: contractUnityId =>
        `/contract-schedule/${contractUnityId}/summary`,
      providesTags: result =>
        result
          ? [
              ...result.map(s => ({
                type: "ContractScheduleUnitTemplate" as const,
                id: s.id,
              })),
              { type: "ContractScheduleUnitTemplate", id: "LIST" },
            ]
          : [{ type: "ContractScheduleUnitTemplate", id: "LIST" }],
    }),

    // ── Turn and Hour ──────────────────────────────────────────────────────

    getTurnAndHoursByScheduleId: builder.query<TurnAndHourDto[], number>({
      query: scheduleId => `/contract-schedule/${scheduleId}`,
      providesTags: result =>
        result
          ? [
              ...result.map(th => ({ type: "TurnAndHour" as const, id: th.id })),
              { type: "TurnAndHour", id: "LIST" },
            ]
          : [{ type: "TurnAndHour", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetTurnTemplatesQuery,
  useGetTurnTemplateByIdQuery,
  useCreateTurnTemplateMutation,
  useUpdateTurnTemplateMutation,
  useDeleteTurnTemplateMutation,
  useGetAllTurnTemplatesQuery,
  useGetClientContractsQuery,
  useGetClientContractByIdQuery,
  useCreateClientContractMutation,
  useUpdateClientContractMutation,
  useDeleteClientContractMutation,
  useGetContractUnitiesByContractIdQuery,
  useCreateContractUnityMutation,
  useDeleteContractUnityMutation,
  useGetWeeklyScheduleByContractIdQuery,
  useSaveWeeklyScheduleMutation,
  useGetContractSchedulesByContractIdQuery,
  useGetTurnAndHoursByScheduleIdQuery,
} = schedulingApi