import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Send } from 'lucide-react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { Avatar, Button } from '../../../components/ui'
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
  /** Show the peer's avatar next to each of their messages — worth it when the peer can be a
   * different person from message to message (e.g. any of several support staff replying to a
   * company user). When the peer is always the same one person (the ticket owner, as seen from
   * the maintenance inbox), showing it once in the ticket header is enough — pass false here. */
  showPeerAvatar?: boolean
  onSend: (message: string) => Promise<void>
}

export function TicketThread({ ticketId, messages, viewerIsOwner, showPeerAvatar = true, onSend }: TicketThreadProps) {
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [peerTyping, setPeerTyping] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const channelReadyRef = useRef(false)
  const lastTypingSentRef = useRef(0)
  const hideTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const submitBtnRef = useRef<HTMLButtonElement>(null)

  // Same iOS Safari keyboard-overlay safety net as the "Enviar mensagem" modal — force the send
  // button into view shortly after the keyboard finishes animating in, in case it ends up hidden.
  function scrollSubmitIntoView() {
    setTimeout(() => submitBtnRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length, peerTyping])

  useEffect(() => {
    if (!isSupabase) return
    channelReadyRef.current = false
    const channel = supabase!
      .channel(`support-typing-${ticketId}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.isOwner === viewerIsOwner) return
        setPeerTyping(true)
        clearTimeout(hideTypingTimeoutRef.current)
        hideTypingTimeoutRef.current = setTimeout(() => setPeerTyping(false), TYPING_HIDE_DELAY)
      })
      .subscribe((status) => {
        channelReadyRef.current = status === 'SUBSCRIBED'
      })
    channelRef.current = channel
    return () => {
      clearTimeout(hideTypingTimeoutRef.current)
      channelReadyRef.current = false
      supabase!.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId])

  function handleDraftChange(value: string) {
    setDraft(value)
    if (!isSupabase || !channelReadyRef.current) return
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

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      if (!draft.trim() || sending) return
      setSending(true)
      onSend(draft.trim())
        .then(() => setDraft(''))
        .finally(() => setSending(false))
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div ref={scrollRef} className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
        <AnimatePresence>
          {messages.map((m) => {
            const own = m.isOwner === viewerIsOwner
            return (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                className={cn('flex items-end gap-2', own ? 'justify-end' : 'justify-start')}
              >
                {!own && showPeerAvatar && <Avatar name={m.senderName} avatarUrl={m.senderAvatarUrl} size={24} className="mb-0.5" />}
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <textarea
          value={draft}
          onChange={(e) => handleDraftChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={scrollSubmitIntoView}
          rows={2}
          enterKeyHint="send"
          placeholder="Escreva uma mensagem..."
          className="w-full resize-none rounded-md border border-border-strong bg-surface-card p-2.5 text-base text-text-primary placeholder:text-text-muted transition-colors focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 sm:text-sm"
        />
        <Button
          ref={submitBtnRef}
          type="submit"
          disabled={sending || !draft.trim()}
          className="shrink-0 self-end"
        >
          <Send size={16} />
          <span className="sm:hidden">Enviar</span>
        </Button>
      </form>
    </div>
  )
}
