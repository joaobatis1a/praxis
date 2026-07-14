import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function ProtectedRoute() {
  const { user, ownerNoCompany, isLoading } = useAuth()

  if (isLoading) return null
  // ownerNoCompany covers the Praxis owner with a valid session but no company profile —
  // still gets past this gate so they can reach /suporte; company-scoped routes are further
  // gated by RequireCompanyProfile.
  if (!user && !ownerNoCompany) return <Navigate to="/login" replace />

  return <Outlet />
}
