import { motion } from 'framer-motion'
import { Building2, CheckCheck, ClipboardList, Trash2, User } from 'lucide-react'
import { Badge, Button } from '../../../components/ui'
import { cn } from '../../../lib/cn'
import type { Notice } from '../../../mocks/notices'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

interface NoticeCardProps {
  notice: Notice
  variant: 'received' | 'sent'
  onMarkRead?: () => void
  onDelete?: () => void
}

export function NoticeCard({ notice, variant, onMarkRead, onDelete }: NoticeCardProps) {
  const unread = variant === 'received' && !notice.read

  return (
    <motion.div
      layout
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      className={cn(
        'group relative rounded-lg border bg-surface-card p-4 shadow-[var(--shadow-level-1)] transition-shadow hover:shadow-[var(--shadow-level-2)]',
        unread ? 'border-primary/40' : 'border-border',
      )}
    >
      {unread && <span className="absolute left-0 top-4 h-[calc(100%-2rem)] w-1 rounded-full bg-primary" />}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="neutral">
            <ClipboardList size={11} />
            {notice.procedureTitle}
          </Badge>
          {unread && <Badge variant="primary">Não lido</Badge>}
          {variant === 'sent' && <Badge variant={notice.read ? 'success' : 'neutral'}>{notice.read ? 'Lido' : 'Aguardando leitura'}</Badge>}
        </div>
        <span className="shrink-0 text-xs text-text-muted">{formatDateTime(notice.createdAt)}</span>
      </div>

      <p className="mt-3 text-sm text-text-primary">{notice.description}</p>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <span>
            {variant === 'received' ? `De: ${notice.authorName}` : `De você`}
          </span>
          <span className="flex items-center gap-1">
            {notice.recipientType === 'user' ? <User size={12} /> : <Building2 size={12} />}
            Para: {notice.recipientLabel}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {variant === 'received' && !notice.read && onMarkRead && (
            <Button variant="ghost" size="sm" onClick={onMarkRead}>
              <CheckCheck size={14} />
              Marcar como lida
            </Button>
          )}
          {onDelete && (
            <motion.button
              type="button"
              onClick={onDelete}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              aria-label="Excluir aviso"
              className="rounded-md p-1.5 text-text-muted opacity-50 transition-all hover:bg-error-bg hover:text-error hover:opacity-100 group-hover:opacity-100"
            >
              <Trash2 size={14} />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
