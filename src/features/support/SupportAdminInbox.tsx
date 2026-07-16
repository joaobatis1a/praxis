import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Trash2 } from 'lucide-react'
import { Badge, Button, Card, ConfirmDialog, Skeleton, useToast } from '../../components/ui'
import { cn } from '../../lib/cn'
import { staggerContainer, staggerItem } from '../../lib/motionVariants'
import { useAuth } from '../auth/AuthContext'
import { deleteTicket, listAllTickets, sendMessage, setTicketStatus } from './api'
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

export function SupportAdminInbox() {
  const { user } = useAuth()
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

  async function handleSendMessage(ticketId: string, text: string) {
    if (!user) return
    try {
      const msg = await sendMessage(ticketId, { id: user.id, name: user.name }, text, true)
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, messages: [...t.messages, msg] } : t)))
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
    await deleteTicket(deleting.id)
    setTickets((prev) => prev.filter((t) => t.id !== deleting.id))
    setDeleting(null)
    toast('Chamado excluído.', 'error')
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
            const lastMessage = ticket.messages[ticket.messages.length - 1]
            return (
              <motion.div key={ticket.id} variants={staggerItem}>
                <Card>
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : ticket.id)}
                    className="flex w-full items-start justify-between gap-2 text-left"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary">{ticket.userName}</p>
                      <p className="text-xs text-text-muted">{ticket.userEmail}</p>
                      <p className="mt-2 truncate text-sm text-text-secondary">{lastMessage?.message}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant={statusVariant[ticket.status]}>{statusLabel[ticket.status]}</Badge>
                      <ChevronDown size={16} className={cn('text-text-muted transition-transform', isOpen && 'rotate-180')} />
                    </div>
                  </button>

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
                            messages={ticket.messages}
                            viewerIsOwner
                            canReply={ticket.status !== 'encerrado'}
                            onSend={(text) => handleSendMessage(ticket.id, text)}
                            actions={
                              <div className="flex flex-wrap gap-2">
                                {ticket.status === 'aberto' && (
                                  <Button variant="secondary" onClick={() => handleStatusChange(ticket.id, 'resolvido')}>
                                    Marcar como resolvido
                                  </Button>
                                )}
                                {ticket.status === 'resolvido' && (
                                  <Button variant="secondary" onClick={() => handleStatusChange(ticket.id, 'aberto')}>
                                    Reabrir
                                  </Button>
                                )}
                                <Button variant="ghost" onClick={() => setDeleting(ticket)}>
                                  <Trash2 size={16} />
                                  Excluir chamado
                                </Button>
                              </div>
                            }
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
