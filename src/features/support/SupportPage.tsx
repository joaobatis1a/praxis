import { useEffect, useRef, useState, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown, Mail, MessageCircle, Send, Trash2 } from 'lucide-react'
import { Badge, Button, buttonVariants, Card, ConfirmDialog, Input, Modal, Skeleton, useToast } from '../../components/ui'
import { isSupabase } from '../../lib/dataSource'
import { supabase } from '../../lib/supabaseClient'
import { cn } from '../../lib/cn'
import { staggerContainer, staggerItem } from '../../lib/motionVariants'
import { SALES_WHATSAPP_URL } from '../../lib/salesContact'
import { useAuth } from '../auth/AuthContext'
import { createTicket, deleteTicket, listMyTickets, rowToMessage, sendMessage, setTicketStatus, type MessageRow, type TicketRow } from './api'
import { SupportAdminInbox } from './SupportAdminInbox'
import { TicketThread } from './components/TicketThread'
import type { SupportTicket, SupportTicketStatus } from './types'

const statusLabel: Record<SupportTicketStatus, string> = {
  aberto: 'Aberto',
  encerrado: 'Encerrado',
}

const statusVariant: Record<SupportTicketStatus, 'warning' | 'neutral'> = {
  aberto: 'warning',
  encerrado: 'neutral',
}

export function SupportPage() {
  const { isMaintenanceAccount } = useAuth()
  if (isMaintenanceAccount) return <SupportAdminInbox />
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
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const submitBtnRef = useRef<HTMLButtonElement>(null)

  // iOS Safari overlays the on-screen keyboard on top of this fixed-position modal instead of
  // shrinking the viewport for it, so the submit button can end up hidden behind the keyboard
  // with no visible cue to scroll — force it into view shortly after the keyboard finishes animating in.
  function scrollSubmitIntoView() {
    setTimeout(() => submitBtnRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300)
  }

  useEffect(() => {
    if (!user) return
    listMyTickets(user.id).then((data) => {
      setTickets(data)
      setLoadingTickets(false)
    })
  }, [user])

  function addMessage(ticketId: string, msg: SupportTicket['messages'][number]) {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId && !t.messages.some((m) => m.id === msg.id) ? { ...t, messages: [...t.messages, msg] } : t)),
    )
  }

  useEffect(() => {
    if (!isSupabase || !user) return
    const channel = supabase!
      .channel(`support-user-${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages' }, (payload) => {
        const msg = rowToMessage(payload.new as MessageRow)
        addMessage(msg.ticketId, msg)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'support_tickets' }, (payload) => {
        const row = payload.new as TicketRow
        if (row.hidden_by_user) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  async function handleSend(e: FormEvent) {
    e.preventDefault()
    if (!user || !title.trim() || !message.trim()) return
    setSending(true)
    try {
      const ticket = await createTicket(user, title.trim(), message.trim())
      setTickets((prev) => [ticket, ...prev])
      setTitle('')
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
      const msg = await sendMessage(ticketId, { id: user.id, name: user.name, avatarUrl: user.avatarUrl }, text, false)
      addMessage(ticketId, msg)
      // replying to a closed ticket reopens it server-side (trigger) — reflect that immediately
      // instead of waiting for the realtime UPDATE event to arrive
      setTickets((prev) => prev.map((t) => (t.id === ticketId && t.status === 'encerrado' ? { ...t, status: 'aberto' } : t)))
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível enviar a mensagem.', 'error')
    }
  }

  async function handleCloseTicket(ticketId: string) {
    try {
      await setTicketStatus(ticketId, 'encerrado')
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status: 'encerrado' } : t)))
      toast('Chamado encerrado.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível encerrar o chamado.', 'error')
    }
  }

  async function handleDelete() {
    if (!deleting) return
    try {
      await deleteTicket(deleting.id, false)
      setTickets((prev) => prev.filter((t) => t.id !== deleting.id))
      setDeleting(null)
      toast('Chamado excluído.', 'error')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível excluir o chamado.', 'error')
    }
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
              href={SALES_WHATSAPP_URL}
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
                  return (
                    <div key={ticket.id} className="py-3 first:pt-0">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                        <button
                          type="button"
                          onClick={() => setExpanded(isOpen ? null : ticket.id)}
                          className="min-w-0 text-left sm:flex-1"
                        >
                          <p className="text-sm font-medium text-text-primary">{ticket.title}</p>
                        </button>
                        <div className="flex flex-wrap items-center gap-1.5 sm:shrink-0">
                          <Badge variant={statusVariant[ticket.status]}>{statusLabel[ticket.status]}</Badge>
                          {ticket.status === 'aberto' && (
                            <button
                              type="button"
                              onClick={() => handleCloseTicket(ticket.id)}
                              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-text-muted transition-colors hover:bg-surface-hover hover:text-success"
                            >
                              <Check size={14} />
                              Encerrar
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
                                viewerIsOwner={false}
                                onSend={(text) => handleSendMessage(ticket.id, text)}
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

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setTitle('')
          setMessage('')
        }}
        title="Enviar mensagem ao suporte"
      >
        <form onSubmit={handleSend} className="flex flex-col gap-4">
          <Input
            label="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={scrollSubmitIntoView}
            placeholder="Ex: Erro ao enviar aviso"
            className="text-base sm:text-sm"
            required
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="support-message" className="text-sm font-medium text-text-primary">
              Sua mensagem
            </label>
            <textarea
              id="support-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onFocus={scrollSubmitIntoView}
              rows={5}
              placeholder="Conte o que está acontecendo..."
              className="w-full resize-none rounded-md border border-border-strong bg-surface-card p-3 text-base text-text-primary placeholder:text-text-muted transition-colors focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 sm:text-sm"
            />
          </div>
          <div className="flex justify-end">
            <Button ref={submitBtnRef} type="submit" disabled={sending || !title.trim() || !message.trim()}>
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
