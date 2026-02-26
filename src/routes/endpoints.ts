// BASE ROUTES
export const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8082"
export const SECURE_API_V1 = BASE_URL + "/secure/api/v1"
export const SECURE_API_V2 = BASE_URL + "/secure/api/v2"
export const HOME_PATH = "/"
export const PUBLIC_BASE_ENDPOINT = BASE_URL + "/public/api/v1"

// AUTHORIZATION
export const SELF_ENDPOINT = `${SECURE_API_V1}/users/self`
export const HOST = import.meta.env.VITE_HOST || "http://localhost:5173"
export const SIGN_OUT_ENDPOINT = PUBLIC_BASE_ENDPOINT + "/logout"
export const LOGIN_ENDPOINT = PUBLIC_BASE_ENDPOINT + "/auth/login"

// ENVIRONMENT
export const ENVIRONMENT = import.meta.env.MODE // development by default
export const DOMAIN_COOKIE = import.meta.env.VITE_DOMAIN_COOKIE || ""
