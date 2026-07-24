import { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronUp, LifeBuoy, LogOut, User, Users, Wrench } from 'lucide-react'
import { Header, Logo, Sidebar, ThemeToggle } from '../../components/ui'
import { isSupabase } from '../../lib/dataSource'
import { useTheme } from '../../lib/theme-provider'
import { getUserDepartment } from '../../lib/userDepartment'
import { useAuth } from '../auth/AuthContext'
import { listNotifications } from '../notifications/api'
import { setThemePreference } from '../settings/api'
import { getNavItemsForRole } from './navigation'

const maintenanceNavItem = { to: '/manutencao', label: 'Manutenção', icon: Wrench }
const maintenanceTeamNavItem = { to: '/time', label: 'Time', icon: Users }
const maintenanceNoCompanyNavItems = [
  { to: '/suporte', label: 'Suporte', icon: LifeBuoy },
  maintenanceNavItem,
  maintenanceTeamNavItem,
]

const roleLabels: Record<string, string> = {
  admin: 'Proprietário',
  gestor: 'Gestor',
  colaborador: 'Colaborador',
}

export function AppLayout() {
  const { user, maintenanceNoCompany, noCompanySession, isMaintenanceAccount, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const { theme, setTheme } = useTheme()

  const department = useMemo(() => getUserDepartment(user), [user])

  useEffect(() => {
    if (!user) return
    listNotifications({ id: user.id, role: user.role, department }).then((data) => {
      setUnreadCount(data.filter((n) => !n.read).length)
    })
  }, [user, department, location.pathname])

  // pulls the account's saved theme in on login, so it follows the user across devices —
  // runs once per user (not on every local theme change), a plain toggle persists separately below
  useEffect(() => {
    if (isSupabase && user?.theme && user.theme !== theme) setTheme(user.theme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  if (!user && !maintenanceNoCompany) return null

  const items = user
    ? [...getNavItemsForRole(user.role), ...(isMaintenanceAccount ? [maintenanceNavItem, maintenanceTeamNavItem] : [])]
    : maintenanceNoCompanyNavItems
  const displayName = user?.name ?? 'Suporte Praxis'
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="flex h-dvh bg-background">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        header={<Logo textClassName="text-text-primary" />}
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
                <p className="text-sm font-medium text-text-primary">{displayName}</p>
                <p className="text-xs text-text-muted">{user ? roleLabels[user.role] : 'Manutenção Praxis'}</p>
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
                      <p className="text-sm font-medium text-text-primary">{displayName}</p>
                      <p className="text-xs text-text-muted">{user?.email ?? noCompanySession?.email}</p>
                    </div>
                    <div className="my-1 border-t border-border" />
                    {(user || maintenanceNoCompany) && (
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false)
                          setSidebarOpen(false)
                          navigate('/perfil')
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                      >
                        <User size={16} />
                        Meu perfil
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false)
                        setSidebarOpen(false)
                        logout()
                      }}
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
          rightSlot={
            <ThemeToggle
              onAfterToggle={(next) => {
                if (isSupabase && user) setThemePreference(user.id, next).catch(() => {})
              }}
            />
          }
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
