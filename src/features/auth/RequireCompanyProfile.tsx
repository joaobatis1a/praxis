import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

/** Gates every company-scoped route behind having an actual profile — a maintenance account can
 * be authenticated with no company (see maintenanceNoCompany in AuthContext) and should land on
 * /manutencao instead, since there's nothing else for them to see here. */
export function RequireCompanyProfile() {
  const { user } = useAuth()

  if (!user) return <Navigate to="/manutencao" replace />

  return <Outlet />
}
