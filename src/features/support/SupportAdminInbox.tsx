import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, RotateCcw, Trash2 } from 'lucide-react'
import { Badge, Card, ConfirmDialog, Skeleton, useToast } from '../../components/ui'
import { isSupabase } from '../../lib/dataSource'
import { supabase } from '../../lib/supabaseClient'
import { cn } from '../../lib/cn'
import { staggerContainer, staggerItem } from '../../lib/motionVariants'
import { useAuth } from '../auth/AuthContext'
import { deleteTicket, listAllTickets, rowToMessage, rowToTicket, sendMessage, setTicketStatus, type MessageRow, type TicketRow } from './api'
import { TicketThread } from './components/TicketThread'
import type { SupportTicket, SupportTicketStatus } from './types'

const statusLabel: Record<SupportTicketStatus, string> = {
  aberto: 'Aberto',
  resolvido: 'Resolvido',
  encerrado: 'Encerrado',
}

const statusVariant: Record<SupportTicketStatus, 'warning' | 'success' | 'neutral'> = {
  aberto: 'warning',
  resolvido: 'success',
  encerrado: 'neutral',
}

const statusOrder: SupportTicketStatus[] = ['aberto', 'resolvido', 'encerrado']

const roleLabel: Record<SupportTicket['userRole'], string> = {
  admin: 'Proprietário',
  gestor: 'Gestor',
  colaborador: 'Colaborador',
}

export function SupportAdminInbox() {
  const { user, noCompanySession } = useAuth()
  // A bare maintenance account (redeemed via a maintenance code, no company) has no `user` —
  // only `noCompanySession` — but can still reply here, so it needs its own identity fallback.
  const sender = user ?? noCompanySession
  const { toast } = useToast()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<SupportTicket | null>(null)

  useEffect(() => {
    listAllTickets().then((data) => {
      setTickets(data)
      setLoading(false)
    })
  }, [])

  function addMessage(ticketId: string, msg: SupportTicket['messages'][number]) {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId && !t.messages.some((m) => m.id === msg.id) ? { ...t, messages: [...t.messages, msg] } : t)),
    )
  }

  useEffect(() => {
    if (!isSupabase) return
    const channel = supabase!
      .channel('support-admin-inbox')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_tickets' }, (payload) => {
        const row = payload.new as TicketRow
        setTickets((prev) => (prev.some((t) => t.id === row.id) ? prev : [rowToTicket(row, []), ...prev]))
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages' }, (payload) => {
        const msg = rowToMessage(payload.new as MessageRow)
        addMessage(msg.ticketId, msg)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'support_tickets' }, (payload) => {
        const row = payload.new as TicketRow
        if (row.hidden_by_admin) {
          setTickets((prev) => prev.filter((t) => t.id !== row.id))
          return
        }
        setTickets((prev) => prev.map((t) => (t.id === row.id ? { ...t, status: row.status, title: row.title } : t)))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'support_tickets' }, (payload) => {
        const oldId = (payload.old as { id: string }).id
        setTickets((prev) => prev.filter((t) => t.id !== oldId))
      })
      .subscribe()
    return () => {
      supabase!.removeChannel(channel)
    }
  }, [])

  async function handleSendMessage(ticketId: string, text: string) {
    if (!sender) return
    try {
      const msg = await sendMessage(ticketId, { id: sender.id, name: sender.name }, text, true)
      addMessage(ticketId, msg)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível enviar a mensagem.', 'error')
    }
  }

  async function handleStatusChange(ticketId: string, status: SupportTicketStatus) {
    try {
      await setTicketStatus(ticketId, status)
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status } : t)))
      toast(status === 'resolvido' ? 'Chamado marcado como resolvido.' : 'Chamado reaberto.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível atualizar o status.', 'error')
    }
  }

  async function handleDelete() {
    if (!deleting) return
    try {
      await deleteTicket(deleting.id, true)
      setTickets((prev) => prev.filter((t) => t.id !== deleting.id))
      setDeleting(null)
      toast('Chamado excluído.', 'error')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível excluir o chamado.', 'error')
    }
  }

  const sorted = [...tickets].sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status))

  return (
    <div className="mx-auto max-w-[860px] p-6 lg:p-8">
      <motion.h1 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-text-primary">
        Central de Suporte
      </motion.h1>
      <p className="mt-1 text-sm text-text-muted">Mensagens enviadas pelas empresas que usam o Praxis.</p>

      {loading ? (
        <div className="mt-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <Card className="mt-6">
          <p className="text-sm text-text-muted">Nenhuma mensagem por enquanto.</p>
        </Card>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="mt-6 space-y-4">
          {sorted.map((ticket) => {
            const isOpen = expanded === ticket.id
            return (
              <motion.div key={ticket.id} variants={staggerItem}>
                <Card>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : ticket.id)}
                      className="min-w-0 text-left sm:flex-1"
                    >
                      <p className="text-sm font-semibold text-text-primary">
                        {ticket.userName}
                        <span className="font-normal text-text-muted"> · {roleLabel[ticket.userRole]}</span>
                      </p>
                      <p className="text-xs text-text-muted">{ticket.userEmail}</p>
                      <p className="mt-1 text-xs text-text-muted">
                        {ticket.companyName}
                        {ticket.companyNumber != null && ` (#${ticket.companyNumber})`}
                      </p>
                      <p className="mt-2 text-sm text-text-secondary">{ticket.title}</p>
                    </button>
                    <div className="flex flex-wrap items-center gap-1.5 sm:shrink-0">
                      <Badge variant={statusVariant[ticket.status]}>{statusLabel[ticket.status]}</Badge>
                      {ticket.status === 'aberto' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(ticket.id, 'resolvido')}
                          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-text-muted transition-colors hover:bg-surface-hover hover:text-success"
                        >
                          <Check size={14} />
                          Resolver
                        </button>
                      )}
                      {ticket.status === 'resolvido' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(ticket.id, 'aberto')}
                          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-text-muted transition-colors hover:bg-surface-hover hover:text-primary"
                        >
                          <RotateCcw size={14} />
                          Reabrir
                        </button>
                      )}
                      {ticket.status === 'encerrado' && (
                        <button
                          type="button"
                          onClick={() => setDeleting(ticket)}
                          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-text-muted transition-colors hover:bg-surface-hover hover:text-error"
                        >
                          <Trash2 size={14} />
                          Excluir
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : ticket.id)}
                        aria-label={isOpen ? 'Recolher chamado' : 'Expandir chamado'}
                        className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-hover"
                      >
                        <ChevronDown size={16} className={cn('transition-transform', isOpen && 'rotate-180')} />
                      </button>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 rounded-md bg-surface p-3">
                          <TicketThread
                            ticketId={ticket.id}
                            messages={ticket.messages}
                            viewerIsOwner
                            canReply={ticket.status !== 'encerrado'}
                            onSend={(text) => handleSendMessage(ticket.id, text)}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Excluir chamado"
        description="Tem certeza que deseja excluir este chamado? Essa ação não pode ser desfeita."
        confirmLabel="Excluir"
      />
    </div>
  )
}
