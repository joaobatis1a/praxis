import { useAuth } from '../auth/AuthContext'
import { AdminDashboardPage } from './AdminDashboardPage'
import { ColaboradorDashboardPage } from './ColaboradorDashboardPage'

export function DashboardPage() {
  const { user } = useAuth()

  if (user?.role === 'colaborador') return <ColaboradorDashboardPage />
  return <AdminDashboardPage />
}
