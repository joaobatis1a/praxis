import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import { Badge, Button, Card, Skeleton, useToast } from '../../components/ui'
import { staggerContainer, staggerItem } from '../../lib/motionVariants'
import { listAllTickets, replyToTicket } from './api'
import type { SupportTicket } from './types'

export function SupportAdminInbox() {
  const { toast } = useToast()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [replying, setReplying] = useState<string | null>(null)

  useEffect(() => {
    listAllTickets().then((data) => {
      setTickets(data)
      setLoading(false)
    })
  }, [])

  async function handleReply(ticketId: string) {
    const reply = (drafts[ticketId] ?? '').trim()
    if (!reply) return
    setReplying(ticketId)
    try {
      const updated = await replyToTicket(ticketId, reply)
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)))
      setDrafts((prev) => ({ ...prev, [ticketId]: '' }))
      toast('Resposta enviada.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível enviar a resposta.', 'error')
    } finally {
      setReplying(null)
    }
  }

  const open = tickets.filter((t) => t.status === 'aberto')
  const answered = tickets.filter((t) => t.status === 'respondido')

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
          {[...open, ...answered].map((ticket) => (
            <motion.div key={ticket.id} variants={staggerItem}>
              <Card>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{ticket.userName}</p>
                    <p className="text-xs text-text-muted">{ticket.userEmail}</p>
                  </div>
                  <Badge variant={ticket.status === 'respondido' ? 'success' : 'warning'} className="shrink-0">
                    {ticket.status === 'respondido' ? 'Respondido' : 'Aberto'}
                  </Badge>
                </div>
                <p className="mt-3 text-sm text-text-secondary">{ticket.message}</p>

                {ticket.reply && (
                  <div className="mt-3 rounded-md border border-primary/20 bg-primary/5 p-3">
                    <p className="text-xs font-semibold text-primary">Sua resposta</p>
                    <p className="mt-1 text-sm text-text-secondary">{ticket.reply}</p>
                  </div>
                )}

                {ticket.status === 'aberto' && (
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <textarea
                      value={drafts[ticket.id] ?? ''}
                      onChange={(e) => setDrafts((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                      rows={2}
                      placeholder="Escreva sua resposta..."
                      className="w-full resize-none rounded-md border border-border-strong bg-surface-card p-3 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
                    />
                    <Button
                      onClick={() => handleReply(ticket.id)}
                      disabled={replying === ticket.id || !(drafts[ticket.id] ?? '').trim()}
                      className="shrink-0 self-end"
                    >
                      <Send size={16} />
                      {replying === ticket.id ? 'Enviando...' : 'Responder'}
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
