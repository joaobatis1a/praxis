import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

/** Gates every company-scoped route behind having an actual profile — the Praxis owner can be
 * authenticated with no company (see ownerNoCompany in AuthContext) and should land on /suporte
 * instead, since there's nothing else for them to see. */
export function RequireCompanyProfile() {
  const { user } = useAuth()

  if (!user) return <Navigate to="/suporte" replace />

  return <Outlet />
}
