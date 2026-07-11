import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { LogOut, Settings } from 'lucide-react'
import { Header, Sidebar, ThemeToggle } from '../../components/ui'
import { useAuth } from '../auth/AuthContext'
import { getNavItemsForRole } from './navigation'

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  gestor: 'Gestor',
  colaborador: 'Colaborador',
}

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  if (!user) return null

  const items = getNavItemsForRole(user.role)
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        header={<span className="text-lg font-bold text-text-primary">Praxis</span>}
        sections={[
          {
            items: items.map((item) => ({
              to: item.to,
              label: item.label,
              icon: <item.icon size={18} />,
            })),
          },
        ]}
        footer={
          <div className="flex items-center gap-2 px-1 text-xs text-text-muted">
            <span className="truncate">{roleLabels[user.role]}</span>
          </div>
        }
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          notificationCount={3}
          onNotificationsClick={() => navigate('/notificacoes')}
          rightSlot={<ThemeToggle />}
          avatar={
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary"
              >
                {initials}
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-10 z-20 w-56 rounded-lg border border-border bg-surface-card p-1.5 shadow-[var(--shadow-level-2)]">
                    <div className="px-2.5 py-2">
                      <p className="truncate text-sm font-medium text-text-primary">{user.name}</p>
                      <p className="truncate text-xs text-text-muted">{user.email}</p>
                    </div>
                    <div className="my-1 border-t border-border" />
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false)
                        navigate('/configuracoes')
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                    >
                      <Settings size={16} />
                      Configurações
                    </button>
                    <button
                      type="button"
                      onClick={logout}
                      className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-error hover:bg-error-bg"
                    >
                      <LogOut size={16} />
                      Sair
                    </button>
                  </div>
                </>
              )}
            </div>
          }
        />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
