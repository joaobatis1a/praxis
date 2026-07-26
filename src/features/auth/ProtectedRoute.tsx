import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function ProtectedRoute() {
  const { user, maintenanceNoCompany, noCompanySession, isLoading, maintenanceChecked } = useAuth()

  if (isLoading) return null
  if (user || maintenanceNoCompany) return <Outlet />
  // a bare no-company session might still turn out to be a maintenance account (the check is
  // async, via an RPC) — wait for it before bouncing to /signup, otherwise a freshly created
  // maintenance account flashes through the "enter your code" screen before self-correcting,
  // instead of landing straight on /manutencao.
  if (noCompanySession && !maintenanceChecked) return null
  // any other authenticated-but-no-company session goes straight to the join-a-company screen
  // instead of bouncing through /login first
  if (noCompanySession) return <Navigate to="/signup" replace />

  return <Navigate to="/login" replace />
}
