import { useState, type FormEvent, type ReactNode } from 'react'
import { Send } from 'lucide-react'
import { Button } from '../../../components/ui'
import { cn } from '../../../lib/cn'
import type { SupportMessage } from '../types'

interface TicketThreadProps {
  messages: SupportMessage[]
  viewerIsOwner: boolean
  canReply: boolean
  onSend: (message: string) => Promise<void>
  actions?: ReactNode
}

export function TicketThread({ messages, viewerIsOwner, canReply, onSend, actions }: TicketThreadProps) {
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)

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
        {messages.map((m) => {
          const own = m.isOwner === viewerIsOwner
          return (
            <div key={m.id} className={cn('flex', own ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                  own ? 'bg-primary text-primary-foreground' : 'bg-surface-hover text-text-primary',
                )}
              >
                {!own && <p className="mb-0.5 text-xs font-semibold opacity-70">{m.senderName}</p>}
                <p className="whitespace-pre-wrap">{m.message}</p>
              </div>
            </div>
          )
        })}
      </div>

      {actions}

      {canReply && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
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
