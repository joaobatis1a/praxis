import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Send } from 'lucide-react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { Button } from '../../../components/ui'
import { isSupabase } from '../../../lib/dataSource'
import { supabase } from '../../../lib/supabaseClient'
import { cn } from '../../../lib/cn'
import type { SupportMessage } from '../types'

const TYPING_BROADCAST_THROTTLE = 1500
const TYPING_HIDE_DELAY = 3000

interface TicketThreadProps {
  ticketId: string
  messages: SupportMessage[]
  viewerIsOwner: boolean
  canReply: boolean
  onSend: (message: string) => Promise<void>
}

export function TicketThread({ ticketId, messages, viewerIsOwner, canReply, onSend }: TicketThreadProps) {
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [peerTyping, setPeerTyping] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const lastTypingSentRef = useRef(0)
  const hideTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (!isSupabase) return
    const channel = supabase!
      .channel(`support-typing-${ticketId}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.isOwner === viewerIsOwner) return
        setPeerTyping(true)
        clearTimeout(hideTypingTimeoutRef.current)
        hideTypingTimeoutRef.current = setTimeout(() => setPeerTyping(false), TYPING_HIDE_DELAY)
      })
      .subscribe()
    channelRef.current = channel
    return () => {
      clearTimeout(hideTypingTimeoutRef.current)
      supabase!.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId])

  function handleDraftChange(value: string) {
    setDraft(value)
    if (!isSupabase) return
    const now = Date.now()
    if (now - lastTypingSentRef.current > TYPING_BROADCAST_THROTTLE) {
      lastTypingSentRef.current = now
      channelRef.current?.send({ type: 'broadcast', event: 'typing', payload: { isOwner: viewerIsOwner } })
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!draft.trim() || sending) return
    setSending(true)
    try {
      await onSend(draft.trim())
      setDraft('')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {messages.map((m) => {
            const own = m.isOwner === viewerIsOwner
            return (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                className={cn('flex', own ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                    own ? 'bg-primary text-primary-foreground' : 'bg-surface-hover text-text-primary',
                  )}
                >
                  {!own && <p className="mb-0.5 text-xs font-semibold opacity-70">{m.senderName}</p>}
                  <p className="whitespace-pre-wrap">{m.message}</p>
                </div>
              </motion.div>
            )
          })}
          {peerTyping && (
            <motion.div
              key="typing-indicator"
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex justify-start"
            >
              <div className="flex items-center gap-1 rounded-lg bg-surface-hover px-3 py-2.5">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {canReply && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            value={draft}
            onChange={(e) => handleDraftChange(e.target.value)}
            rows={2}
            placeholder="Escreva uma mensagem..."
            className="w-full resize-none rounded-md border border-border-strong bg-surface-card p-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
          />
          <Button type="submit" disabled={sending || !draft.trim()} className="shrink-0 self-end">
            <Send size={16} />
          </Button>
        </form>
      )}
    </div>
  )
}
