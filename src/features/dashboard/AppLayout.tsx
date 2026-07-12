import { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronUp, LogOut, Settings } from 'lucide-react'
import { Header, Sidebar, ThemeToggle } from '../../components/ui'
import { getUserDepartment } from '../../lib/userDepartment'
import { useAuth } from '../auth/AuthContext'
import { listNotifications } from '../notifications/api'
import { getNavItemsForRole } from './navigation'

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  gestor: 'Gestor',
  colaborador: 'Colaborador',
}

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const department = useMemo(() => getUserDepartment(user), [user])

  useEffect(() => {
    if (!user) return
    listNotifications({ id: user.id, role: user.role, department }).then((data) => {
      setUnreadCount(data.filter((n) => !n.read).length)
    })
  }, [user, department, location.pathname])

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
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        header={<span className="font-brand text-lg font-bold text-text-primary">Praxis</span>}
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
          <div className="relative">
            <motion.button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              whileTap={{ scale: 0.97 }}
              className="flex w-full items-center gap-2.5 rounded-md p-1.5 text-left transition-colors hover:bg-surface-hover"
            >
              <motion.div
                whileHover={{ scale: 1.08, rotate: -4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary"
              >
                {initials}
              </motion.div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">{user.name}</p>
                <p className="truncate text-xs text-text-muted">{roleLabels[user.role]}</p>
              </div>
              <motion.span
                animate={{ rotate: menuOpen ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                className="shrink-0 text-text-muted"
              >
                <ChevronUp size={14} />
              </motion.span>
            </motion.button>

            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8, transition: { duration: 0.12 } }}
                    transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                    className="absolute bottom-full left-0 z-20 mb-2 w-full rounded-lg border border-border bg-surface-card p-1.5 shadow-[var(--shadow-level-2)]"
                  >
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
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        }
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          notificationCount={unreadCount}
          onNotificationsClick={() => navigate('/notificacoes')}
          onMenuClick={() => setSidebarOpen(true)}
          rightSlot={<ThemeToggle />}
        />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
