import { LogOut } from 'lucide-react'
import { Button, Card } from '../components/ui'
import { useAuth } from '../features/auth/AuthContext'

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  gestor: 'Gestor',
  colaborador: 'Colaborador',
}

export function DashboardPlaceholderPage() {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md text-center">
        <p className="text-sm text-text-muted">Login realizado com sucesso</p>
        <h1 className="mt-1 text-2xl font-bold text-text-primary">Olá, {user?.name}</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Perfil: {user ? roleLabels[user.role] : ''}
        </p>
        <p className="mt-4 text-sm text-text-muted">
          O dashboard completo é o próximo módulo a ser construído.
        </p>
        <Button variant="secondary" className="mt-6" onClick={logout}>
          <LogOut size={16} />
          Sair
        </Button>
      </Card>
    </div>
  )
}
