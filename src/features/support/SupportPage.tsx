import { useEffect, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Mail, MessageCircle, Send } from 'lucide-react'
import { Badge, Button, buttonVariants, Card, Modal, Skeleton, useToast } from '../../components/ui'
import { cn } from '../../lib/cn'
import { staggerContainer, staggerItem } from '../../lib/motionVariants'
import { isPraxisOwner } from '../../lib/praxisOwner'
import { useAuth } from '../auth/AuthContext'
import { createTicket, listMyTickets } from './api'
import { SupportAdminInbox } from './SupportAdminInbox'
import type { SupportTicket } from './types'

const SUPPORT_WHATSAPP = '5581982594090'

export function SupportPage() {
  const { user } = useAuth()
  if (user && isPraxisOwner(user.email)) return <SupportAdminInbox />
  return <SupportContact />
}

function SupportContact() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loadingTickets, setLoadingTickets] = useState(true)

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
              <h2 className="text-base font-semibold text-text-primary">Minhas mensagens</h2>
              <div className="mt-4 space-y-4 divide-y divide-border">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="pt-4 first:pt-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-text-primary">{ticket.message}</p>
                      <Badge variant={ticket.status === 'respondido' ? 'success' : 'neutral'} className="shrink-0">
                        {ticket.status === 'respondido' ? 'Respondido' : 'Aguardando resposta'}
                      </Badge>
                    </div>
                    {ticket.reply && (
                      <div className="mt-2 rounded-md border border-primary/20 bg-primary/5 p-3">
                        <p className="text-xs font-semibold text-primary">Resposta do suporte</p>
                        <p className="mt-1 text-sm text-text-secondary">{ticket.reply}</p>
                      </div>
                    )}
                  </div>
                ))}
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
    </div>
  )
}
