import { useEffect, useState, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Mail, MessageCircle, Send, Trash2 } from 'lucide-react'
import { Badge, Button, buttonVariants, Card, ConfirmDialog, Modal, Skeleton, useToast } from '../../components/ui'
import { cn } from '../../lib/cn'
import { staggerContainer, staggerItem } from '../../lib/motionVariants'
import { isPraxisOwner } from '../../lib/praxisOwner'
import { useAuth } from '../auth/AuthContext'
import { closeOwnTicket, createTicket, deleteTicket, listMyTickets, sendMessage } from './api'
import { SupportAdminInbox } from './SupportAdminInbox'
import { TicketThread } from './components/TicketThread'
import type { SupportTicket, SupportTicketStatus } from './types'

const SUPPORT_WHATSAPP = '5581982594090'

const statusLabel: Record<SupportTicketStatus, string> = {
  aberto: 'Aguardando resposta',
  resolvido: 'Resolvido',
  encerrado: 'Encerrado',
}

const statusVariant: Record<SupportTicketStatus, 'warning' | 'success' | 'neutral'> = {
  aberto: 'warning',
  resolvido: 'success',
  encerrado: 'neutral',
}

export function SupportPage() {
  const { user, ownerNoCompany } = useAuth()
  if (ownerNoCompany || (user && isPraxisOwner(user.email))) return <SupportAdminInbox />
  return <SupportContact />
}

function SupportContact() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loadingTickets, setLoadingTickets] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<SupportTicket | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!user) return
    listMyTickets(user.id).then((data) => {
      setTickets(data)
      setLoadingTickets(false)
    })
  }, [user])

  async function handleSend(e: FormEvent) {
    e.preventDefault()
    if (!user || !message.trim()) return
    setSending(true)
    try {
      const ticket = await createTicket(user, message.trim())
      setTickets((prev) => [ticket, ...prev])
      setMessage('')
      setModalOpen(false)
      toast('Mensagem enviada ao suporte.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível enviar sua mensagem.', 'error')
    } finally {
      setSending(false)
    }
  }

  async function handleSendMessage(ticketId: string, text: string) {
    if (!user) return
    try {
      const msg = await sendMessage(ticketId, { id: user.id, name: user.name }, text, false)
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, messages: [...t.messages, msg] } : t)))
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível enviar a mensagem.', 'error')
    }
  }

  async function handleCloseTicket(ticketId: string) {
    try {
      await closeOwnTicket(ticketId)
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status: 'encerrado' } : t)))
      toast('Chamado encerrado.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível encerrar o chamado.', 'error')
    }
  }

  async function handleDelete() {
    if (!deleting) return
    await deleteTicket(deleting.id)
    setTickets((prev) => prev.filter((t) => t.id !== deleting.id))
    setDeleting(null)
    toast('Chamado excluído.', 'error')
  }

  return (
    <div className="mx-auto max-w-[720px] p-6 lg:p-8">
      <motion.h1 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-text-primary">
        Suporte
      </motion.h1>
      <p className="mt-1 text-sm text-text-muted">Precisa de ajuda? Fale diretamente com a gente.</p>

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="mt-6 space-y-4">
        <motion.div variants={staggerItem}>
          <Card className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MessageCircle size={18} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text-primary">WhatsApp</h2>
                <p className="text-sm text-text-muted">Fale com o suporte pelo WhatsApp.</p>
              </div>
            </div>
            <a
              href={`https://wa.me/${SUPPORT_WHATSAPP}`}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: 'primary' }), 'shrink-0')}
            >
              Chamar no WhatsApp
            </a>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail size={18} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text-primary">Mensagem</h2>
                <p className="text-sm text-text-muted">Envie sua dúvida e a gente responde por aqui.</p>
              </div>
            </div>
            <Button variant="secondary" className="shrink-0" onClick={() => setModalOpen(true)}>
              Enviar mensagem
            </Button>
          </Card>
        </motion.div>

        {!loadingTickets && tickets.length > 0 && (
          <motion.div variants={staggerItem}>
            <Card>
              <h2 className="text-base font-semibold text-text-primary">Meus chamados</h2>
              <div className="mt-4 divide-y divide-border">
                {tickets.map((ticket) => {
                  const isOpen = expanded === ticket.id
                  const lastMessage = ticket.messages[ticket.messages.length - 1]
                  return (
                    <div key={ticket.id} className="py-3 first:pt-0">
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : ticket.id)}
                        className="flex w-full items-center justify-between gap-2 text-left"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm text-text-primary">{lastMessage?.message}</p>
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
                                viewerIsOwner={false}
                                canReply={ticket.status !== 'encerrado'}
                                onSend={(text) => handleSendMessage(ticket.id, text)}
                                actions={
                                  <div className="flex flex-wrap gap-2">
                                    {ticket.status === 'resolvido' && (
                                      <Button variant="secondary" onClick={() => handleCloseTicket(ticket.id)}>
                                        Confirmar e encerrar chamado
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
                    </div>
                  )
                })}
              </div>
            </Card>
          </motion.div>
        )}

        {loadingTickets && (
          <motion.div variants={staggerItem}>
            <Skeleton className="h-20" />
          </motion.div>
        )}
      </motion.div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Enviar mensagem ao suporte">
        <form onSubmit={handleSend} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="support-message" className="text-sm font-medium text-text-primary">
              Sua mensagem
            </label>
            <textarea
              id="support-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Conte o que está acontecendo..."
              className="w-full resize-none rounded-md border border-border-strong bg-surface-card p-3 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={sending || !message.trim()}>
              <Send size={16} />
              {sending ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </form>
      </Modal>

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
