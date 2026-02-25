
import {
  SIGN_OUT_ENDPOINT,
  HOME_PATH,
} from "../../routes/endpoints"
import { useAppDispatch } from "../../app/hooks"
import type { NavigateFunction } from "react-router-dom"
import { resetAuth } from "../slice/authSlice"
import { getCookie } from "@/utils/cookieUtils"

export const signOut = async (
  dispatch: ReturnType<typeof useAppDispatch>,
  navigate: NavigateFunction,
) => {
  // const accessToken = getCookie("access_token")

  // if (accessToken) {
  //   try {
  //     const signOutUrl = `${SIGN_OUT_ENDPOINT}`
  //     await fetch(signOutUrl, {
  //       method: "POST",
  //       headers: {
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //       credentials: "include",
  //     })
  //   } catch (error) {
  //     console.error("Error during sign-out:", error)
  //   }
  // }

  dispatch(resetAuth())
  navigate(HOME_PATH, { replace: true })
}
