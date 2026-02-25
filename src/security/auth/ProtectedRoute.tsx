import React, { useEffect } from "react"
import { useAppSelector } from "../../app/hooks"
import { useAuthorization } from "./useAuthorization"
import MainLayout from "@/components/MainLayout"

export const ProtectedRoute: React.FC = () => {
  const { user } = useAppSelector(state => state.auth)
  const { verifyAuthorization } = useAuthorization()

  useEffect(() => {
    verifyAuthorization()
  }, [location.pathname])

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="text-sm text-slate-500">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  return <MainLayout />
}
