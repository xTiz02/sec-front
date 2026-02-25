import React, { useEffect } from "react"

// import { LoadingOverlay } from "../../features/common/loading/LoadingOverlay"
import { useAppSelector, useAppDispatch } from "../../app/hooks"
import { useNavigate } from "react-router-dom"
import { signOut } from "../signout/signOut"

const SignOut = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAppSelector(state => state.auth)

  useEffect(() => {
    signOut(dispatch, navigate)
  }, [])

  // return <LoadingOverlay open={!!user} message="Cerrando Sesión" />
  return <>Cerrando Sesión</>
}

export default SignOut