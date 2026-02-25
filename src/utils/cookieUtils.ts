import { DOMAIN_COOKIE } from "@/routes/endpoints"


export interface CookieOptions {
  path?: string
  expires?: number | Date
  secure?: boolean
  sameSite?: "Strict" | "Lax" | "None" | ""
  domain?: string
}

export const setCookie = (
  name: string,
  value: string,
  options: CookieOptions = {},
): void => {
  const { path = "/", expires, secure = false, sameSite = "" } = options

  let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=${path}`

  if (DOMAIN_COOKIE) cookieStr += `; domain=${DOMAIN_COOKIE}`

  if (expires) {
    const date =
      typeof expires === "number"
        ? new Date(Date.now() + expires * 864e5)
        : expires
    cookieStr += `; expires=${date.toUTCString()}`
  }

  if (secure) cookieStr += "; Secure"
  if (sameSite) cookieStr += `; SameSite=${sameSite}`

  document.cookie = cookieStr
}

export const getCookie = (name: string): string | null => {
  const cookies = document.cookie.split("; ")
  const match = cookies.find(cookie =>
    cookie.startsWith(`${encodeURIComponent(name)}=`),
  )
  return match ? decodeURIComponent(match.split("=")[1]) : null
}

export const deleteCookie = (name: string, path = "/"): void => {
  document.cookie = `${encodeURIComponent(name)}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
}

export const clearAllCookies = (): void => {
  const cookies = document.cookie.split("; ")
  cookies.forEach(cookie => {
    const name = cookie.split("=")[0]
    deleteCookie(name)
  })
}
