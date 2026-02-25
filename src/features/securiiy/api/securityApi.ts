import { baseApi } from "@/app/baseApi"
import type {
  UserDto,
  UserWithEmployeeDto,
  CreateUserRequest,
  UpdateUserRequest,
  AssignProfilesRequest,
  SecurityProfileDto,
  SecurityProfileSummaryDto,
  CreateSecurityProfileRequest,
  UpdateSecurityProfileRequest,
  AssignViewsRequest,
  AssignEndpointsRequest,
  ViewDto,
  EndpointDto,
  PageResponse,
  PageParams,
} from "./securityModel"

export const securityApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // ── Users ──────────────────────────────────────────────────────────────

    getUsers: builder.query<PageResponse<UserWithEmployeeDto>, PageParams>({
      query: ({ page = 0, size = 10, search }) => ({
        url: `/users/all`,
        params: { page, size, ...(search ? { search } : {}) },
      }),
      providesTags: result =>
        result
          ? [
              ...result.content.map(u => ({
                type: "User" as const,
                id: u.id,
              })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),

    getUserById: builder.query<UserDto, number>({
      query: id => `/users/${id}`,
      providesTags: (_r, _e, id) => [{ type: "User", id }],
    }),

    createUser: builder.mutation<UserDto, CreateUserRequest>({
      query: body => ({
        url: `/users`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    updateUser: builder.mutation<UserDto, { id: number; body: UpdateUserRequest }>({
      query: ({ id, body }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),

    deleteUser: builder.mutation<void, number>({
      query: id => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),

    assignProfilesToUser: builder.mutation<
      UserDto,
      { userId: number; body: AssignProfilesRequest }
    >({
      query: ({ userId, body }) => ({
        url: `/users/${userId}/profiles`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { userId }) => [{ type: "User", id: userId }],
    }),

    toggleUserStatus: builder.mutation<UserDto, { id: number; enabled: boolean }>({
      query: ({ id, enabled }) => ({
        url: `/users/${id}/status`,
        method: "PATCH",
        body: { enabled },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),

    // ── Security Profiles ──────────────────────────────────────────────────

    getProfiles: builder.query<SecurityProfileSummaryDto[], void>({
      query: () => `/security-profiles/all`,
      providesTags: result =>
        result
          ? [
              ...result.map(p => ({ type: "SecurityProfile" as const, id: p.id })),
              { type: "SecurityProfile", id: "LIST" },
            ]
          : [{ type: "SecurityProfile", id: "LIST" }],
    }),

    getProfileById: builder.query<SecurityProfileDto, number>({
      query: id => `/security-profiles/${id}`,
      providesTags: (_r, _e, id) => [{ type: "SecurityProfile", id }],
    }),

    createProfile: builder.mutation<SecurityProfileDto, CreateSecurityProfileRequest>({
      query: body => ({
        url: `/security-profiles`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "SecurityProfile", id: "LIST" }],
    }),

    updateProfile: builder.mutation<
      SecurityProfileDto,
      { id: number; body: UpdateSecurityProfileRequest }
    >({
      query: ({ id, body }) => ({
        url: `/security-profiles/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "SecurityProfile", id },
        { type: "SecurityProfile", id: "LIST" },
      ],
    }),

    deleteProfile: builder.mutation<void, number>({
      query: id => ({
        url: `/security-profiles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "SecurityProfile", id },
        { type: "SecurityProfile", id: "LIST" },
      ],
    }),

    assignViewsToProfile: builder.mutation<
      SecurityProfileDto,
      { profileId: number; body: AssignViewsRequest }
    >({
      query: ({ profileId, body }) => ({
        url: `/security-profiles/${profileId}/views`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { profileId }) => [
        { type: "SecurityProfile", id: profileId },
      ],
    }),

    assignEndpointsToProfile: builder.mutation<
      SecurityProfileDto,
      { profileId: number; body: AssignEndpointsRequest }
    >({
      query: ({ profileId, body }) => ({
        url: `/security-profiles/${profileId}/endpoints`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { profileId }) => [
        { type: "SecurityProfile", id: profileId },
      ],
    }),

    // ── Views ──────────────────────────────────────────────────────────────

    getAllViews: builder.query<ViewDto[], void>({
      query: () => `/views/all`,
      providesTags: [{ type: "View", id: "LIST" }],
    }),

    // ── Endpoints ──────────────────────────────────────────────────────────

    getAllEndpoints: builder.query<EndpointDto[], void>({
      query: () => `/endpoints/all`,
      providesTags: [{ type: "Endpoint", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useAssignProfilesToUserMutation,
  useToggleUserStatusMutation,
  useGetProfilesQuery,
  useGetProfileByIdQuery,
  useCreateProfileMutation,
  useUpdateProfileMutation,
  useDeleteProfileMutation,
  useAssignViewsToProfileMutation,
  useAssignEndpointsToProfileMutation,
  useGetAllViewsQuery,
  useGetAllEndpointsQuery,
} = securityApi