import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'
import type { Role } from './types'

export function RequireRole({ roles }: { roles: Role[] }) {
  const { user } = useAuth()

  if (!user || !roles.includes(user.role)) return <Navigate to="/dashboard" replace />

  return <Outlet />
}
