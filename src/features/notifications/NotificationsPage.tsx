import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Award, BookOpen, CheckCheck, ClipboardList, Megaphone, Reply, ShieldCheck, Trash2, UserPlus, type LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button, Skeleton, useToast } from '../../components/ui'
import { cn } from '../../lib/cn'
import { staggerContainer, staggerItem } from '../../lib/motionVariants'
import { getUserDepartment } from '../../lib/userDepartment'
import type { AppNotification, NotificationType } from '../../mocks/notifications'
import { useAuth } from '../auth/AuthContext'
import { dismissAllNotifications, dismissNotification, listNotifications, markAllAsRead, markAsRead } from './api'

const iconByType: Record<NotificationType, LucideIcon> = {
  aviso: Megaphone,
  'aviso-respondido': Reply,
  documento: BookOpen,
  'procedimento-publicado': ClipboardList,
  'procedimento-concluido': Award,
  'novo-usuario': UserPlus,
  'permissao-alterada': ShieldCheck,
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function NotificationsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<(AppNotification & { read: boolean })[]>([])
  const [loading, setLoading] = useState(true)
  const [clearingAll, setClearingAll] = useState(false)

  const department = useMemo(() => getUserDepartment(user), [user])

  useEffect(() => {
    if (!user) return
    listNotifications({ id: user.id, role: user.role, department }).then((data) => {
      setNotifications(data)
      setLoading(false)
    })
  }, [user, department])

  const unreadCount = notifications.filter((n) => !n.read).length

  async function handleOpen(notification: AppNotification & { read: boolean }) {
    if (!user) return
    if (!notification.read) {
      await markAsRead(notification.id, user.id)
      setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)))
    }
    if (notification.linkTo) navigate(notification.linkTo)
  }

  async function handleMarkAllRead() {
    if (!user) return
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
    if (unreadIds.length === 0) return
    await markAllAsRead(unreadIds, user.id)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  async function handleDismiss(id: string) {
    if (!user) return
    const removed = notifications.find((n) => n.id === id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    try {
      await dismissNotification(id, user.id)
    } catch (err) {
      if (removed) setNotifications((prev) => [...prev, removed].sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
      toast(err instanceof Error ? err.message : 'Não foi possível apagar a notificação.', 'error')
    }
  }

  async function handleClearAll() {
    if (!user || notifications.length === 0) return
    const ids = notifications.map((n) => n.id)
    setClearingAll(true)
    const previous = notifications
    setNotifications([])
    try {
      await dismissAllNotifications(ids, user.id)
    } catch (err) {
      setNotifications(previous)
      toast(err instanceof Error ? err.message : 'Não foi possível limpar as notificações.', 'error')
    } finally {
      setClearingAll(false)
    }
  }

  return (
    <div className="mx-auto max-w-[900px] p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Central de Notificações</h1>
          <p className="mt-1 text-sm text-text-muted">
            {unreadCount > 0 ? `${unreadCount} não lida${unreadCount > 1 ? 's' : ''}` : 'Tudo em dia por aqui.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="secondary" onClick={handleMarkAllRead}>
              <CheckCheck size={16} />
              Marcar todas como lidas
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="secondary" onClick={handleClearAll} disabled={clearingAll}>
              <Trash2 size={16} />
              Limpar tudo
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-sm text-text-muted">
            Nenhuma notificação por aqui ainda.
          </motion.p>
        ) : (
          <motion.ul variants={staggerContainer} initial="hidden" animate="show" className="space-y-2">
            <AnimatePresence mode="popLayout">
              {notifications.map((notification) => {
                const Icon = iconByType[notification.type]
                return (
                  <motion.li key={notification.id} variants={staggerItem} layout>
                    <motion.div
                      whileHover={{ y: -4, scale: 1.01 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                      className={cn(
                        'group relative flex w-full items-start gap-3 rounded-lg border bg-surface-card p-4 shadow-[var(--shadow-level-1)] transition-shadow hover:border-border-strong hover:shadow-[var(--shadow-level-2)]',
                        !notification.read && 'border-primary/40',
                      )}
                    >
                      {!notification.read && <span className="absolute left-0 top-4 h-[calc(100%-2rem)] w-1 rounded-full bg-primary" />}
                      <div
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-text-secondary transition-transform duration-300 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110',
                          notification.type === 'procedimento-concluido' && 'bg-amber-400/15 text-amber-500 dark:text-amber-400',
                        )}
                      >
                        <Icon size={18} />
                      </div>
                      <button type="button" onClick={() => handleOpen(notification)} className="min-w-0 flex-1 text-left">
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn('text-sm', notification.read ? 'text-text-secondary' : 'font-semibold text-text-primary')}>
                            {notification.title}
                          </p>
                          <span className="shrink-0 text-xs text-text-muted">{formatDateTime(notification.createdAt)}</span>
                        </div>
                        <p className="mt-0.5 text-sm text-text-muted">{notification.description}</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDismiss(notification.id)}
                        aria-label="Apagar notificação"
                        title="Apagar notificação"
                        className="shrink-0 self-start rounded-md p-1.5 text-text-muted opacity-0 transition-opacity hover:bg-error-bg hover:text-error group-hover:opacity-100 focus-visible:opacity-100"
                      >
                        <Trash2 size={15} />
                      </button>
                    </motion.div>
                  </motion.li>
                )
              })}
            </AnimatePresence>
          </motion.ul>
        )}
      </div>
    </div>
  )
}
