import type { PayloadAction } from "@reduxjs/toolkit"
import { clearAllCookies } from "@/utils/cookieUtils"
import { createAppSlice } from "../../app/createAppSlice"

interface ViewResponse {
  id: number
  name: string
  description: string
  route: string
}

interface ViewAuthorizationResponse {
  id: number
  view: ViewResponse
}

interface EndpointResponse {
  id: number
  name: string
  description: string
  route: string
  permissionType: string
}

interface AuthorizedEndpointResponse {
  id: number
  endpoint: EndpointResponse
}

export interface SecurityProfileResponse {
  id: number
  name: string
  description: string
  viewAuthorizationList: ViewAuthorizationResponse[]
  authorizedEndpointList: AuthorizedEndpointResponse[]
}

export interface UserResponse {
  id: number
  username: string
  enabled: boolean
  accountLocked: boolean
  securityProfileSet: SecurityProfileResponse[]
}

interface AuthState {
  user: UserResponse | null
}

const initialState: AuthState = {
  user: null,
}

export const authSlice = createAppSlice({
  name: "auth",
  initialState,
  reducers: {
    authCheckSuccess: (state, action: PayloadAction<UserResponse>) => {
      state.user = action.payload
    },
    authCheckFailure: state => {
      state.user = null
    },
    updateAuth: (state, action: PayloadAction<Partial<AuthState>>) => {
      return {
        ...state,
        ...action.payload,
        user: action.payload.user
          ? { ...state.user, ...action.payload.user }
          : state.user,
      }
    },
    resetAuth: state => {
      state.user = null
      clearAllCookies()
    },
  },
})

export const { updateAuth, authCheckSuccess, authCheckFailure, resetAuth } =
  authSlice.actions
export default authSlice.reducer
