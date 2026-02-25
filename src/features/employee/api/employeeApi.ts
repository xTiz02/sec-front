import { baseApi } from "@/app/baseApi"
import type {
  EmployeeDto,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
} from "./employeeModel"
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

    // ── Employees ──────────────────────────────────────────────────────────

    getEmployees: builder.query<PageResponse<EmployeeDto>, TableParams>({
      query: ({ page = 0, size = 10, sort, query }) => ({
        url: `/employee/all`,
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
              ...result.content.map(e => ({ type: "Employee" as const, id: e.id })),
              { type: "Employee", id: "LIST" },
            ]
          : [{ type: "Employee", id: "LIST" }],
    }),

    getEmployeeById: builder.query<EmployeeDto, number>({
      query: id => `/employee/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Employee", id }],
    }),

    createEmployee: builder.mutation<EmployeeDto, CreateEmployeeRequest>({
      query: body => ({ url: `/employee`, method: "POST", body }),
      invalidatesTags: [{ type: "Employee", id: "LIST" }],
    }),

    updateEmployee: builder.mutation<EmployeeDto, { id: number; body: UpdateEmployeeRequest }>({
      query: ({ id, body }) => ({ url: `/employee/${id}`, method: "PUT", body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Employee", id },
        { type: "Employee", id: "LIST" },
      ],
    }),

    deleteEmployee: builder.mutation<void, number>({
      query: id => ({ url: `/employee/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Employee", id },
        { type: "Employee", id: "LIST" },
      ],
    }),

  }),
  overrideExisting: false,
})

export const {
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} = operationsApi