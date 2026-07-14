import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function ProtectedRoute() {
  const { user, ownerNoCompany, noCompanySession, isLoading } = useAuth()

  if (isLoading) return null
  if (user || ownerNoCompany) return <Outlet />
  // any other authenticated-but-no-company session goes straight to the join-a-company screen
  // instead of bouncing through /login first
  if (noCompanySession) return <Navigate to="/signup" replace />

  return <Navigate to="/login" replace />
}
