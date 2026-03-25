import { SECURE_API_V1 } from "@/routes/endpoints"
import { fetchBaseQuery, type BaseQueryFn } from "@reduxjs/toolkit/query"
import type { FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query"
import { toast } from "sonner"

const rawBaseQuery = fetchBaseQuery({
  baseUrl: SECURE_API_V1,
  credentials: "include",
})

export const customBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions)
  if(result.error) {
    const errorMessage = result.error.data?.message || "An error occurred"
    toast.warning(errorMessage, { position: "top-right" })
  }
  // navigate to sign out
  if (result.error && result.error.status === 401) {
    window.location.href = "/sign-out"
  }

  return result
}
