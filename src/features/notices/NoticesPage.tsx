import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Button, ConfirmDialog, Skeleton, useToast } from '../../components/ui'
import { cn } from '../../lib/cn'
import { staggerContainer, staggerItem } from '../../lib/motionVariants'
import { teamMembers } from '../../mocks/teamMembers'
import type { Notice } from '../../mocks/notices'
import { useAuth } from '../auth/AuthContext'
import { createNotice, deleteNotice, listNotices, markAsRead } from './api'
import { NoticeCard } from './components/NoticeCard'
import { NoticeFormModal, type NoticeFormValues } from './components/NoticeFormModal'

type Tab = 'received' | 'sent'

export function NoticesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('received')
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<Notice | null>(null)

  const department = useMemo(() => teamMembers.find((m) => m.id === user?.id)?.department, [user])

  useEffect(() => {
    listNotices().then((data) => {
      setNotices(data)
      setLoading(false)
    })
  }, [])

  const received = useMemo(() => {
    return notices
      .filter((n) => (n.recipientType === 'user' && n.recipientId === user?.id) || (n.recipientType === 'department' && n.recipientId === department))
      .sort((a, b) => (a.read === b.read ? b.createdAt.localeCompare(a.createdAt) : a.read ? 1 : -1))
  }, [notices, user, department])

  const sent = useMemo(() => {
    return notices.filter((n) => n.authorId === user?.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [notices, user])

  const unreadCount = received.filter((n) => !n.read).length

  async function handleMarkRead(id: string) {
    const updated = await markAsRead(id)
    setNotices((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))
  }

  async function handleCreate(values: NoticeFormValues) {
    if (!user) return
    const newNotice = await createNotice({ ...values, authorId: user.id, authorName: user.name })
    setNotices((prev) => [newNotice, ...prev])
    toast(`Aviso enviado para ${newNotice.recipientLabel}.`)
  }

  async function handleDelete() {
    if (!deleting) return
    await deleteNotice(deleting.id)
    setNotices((prev) => prev.filter((n) => n.id !== deleting.id))
    toast('Aviso excluído.', 'error')
  }

  const visible = tab === 'received' ? received : sent

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Avisos</h1>
          <p className="mt-1 text-sm text-text-muted">Deixe um recado sobre uma função para quem vem depois de você.</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus size={16} />
          Novo aviso
        </Button>
      </div>

      <div className="relative mt-6 inline-flex rounded-md border border-border-strong bg-surface p-1">
        {(['received', 'sent'] as const).map((t) => {
          const isSelected = tab === t
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                'relative z-10 flex items-center gap-2 rounded-sm px-4 py-1.5 text-sm font-medium transition-colors',
                isSelected ? 'text-primary-foreground' : 'text-text-secondary hover:text-text-primary',
              )}
            >
              {isSelected && (
                <motion.span
                  layoutId="notices-tab-highlight"
                  transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                  className="absolute inset-0 -z-10 rounded-sm bg-primary"
                />
              )}
              {t === 'received' ? 'Recebidos' : 'Enviados'}
              {t === 'received' && unreadCount > 0 && (
                <span
                  className={cn(
                    'flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold',
                    isSelected ? 'bg-primary-foreground/25 text-primary-foreground' : 'bg-primary/15 text-primary',
                  )}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-sm text-text-muted">
            {tab === 'received' ? 'Nenhum aviso recebido.' : 'Você ainda não enviou nenhum aviso.'}
          </motion.p>
        ) : (
          <motion.div key={tab} variants={staggerContainer} initial="hidden" animate="show" className="space-y-3">
            <AnimatePresence mode="popLayout">
              {visible.map((notice) => (
                <motion.div key={notice.id} variants={staggerItem} exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }} layout>
                  <NoticeCard
                    notice={notice}
                    variant={tab === 'received' ? 'received' : 'sent'}
                    onMarkRead={tab === 'received' ? () => handleMarkRead(notice.id) : undefined}
                    onDelete={tab === 'sent' ? () => setDeleting(notice) : undefined}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {user && <NoticeFormModal open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} currentUserId={user.id} />}

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Excluir aviso"
        description="Tem certeza que deseja excluir este aviso? Essa ação não pode ser desfeita."
        confirmLabel="Excluir"
      />
    </div>
  )
}
