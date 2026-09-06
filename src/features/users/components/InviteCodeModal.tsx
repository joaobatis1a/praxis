import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button, Modal } from '../../../components/ui'

/** Shows how long until the code expires, and calls onExpire once when it hits zero — the
 * caller generates a fresh code and the modal keeps showing it, no need to reopen anything. */
function CodeCountdown({ expiresAt, onExpire }: { expiresAt: string; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(0)
  const firedRef = useRef(false)

  useEffect(() => {
    firedRef.current = false
    const target = new Date(expiresAt).getTime()

    function tick() {
      const remainingMs = target - Date.now()
      setRemaining(Math.max(0, Math.round(remainingMs / 1000)))
      if (remainingMs <= 0 && !firedRef.current) {
        firedRef.current = true
        onExpire()
      }
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [expiresAt, onExpire])

  const min = Math.floor(remaining / 60)
  const sec = remaining % 60

  return (
    <p className="mt-2 text-center text-xs text-text-muted">
      {remaining > 0 ? `Expira em ${min}:${String(sec).padStart(2, '0')}` : 'Gerando um novo código...'}
    </p>
  )
}

interface InviteCodeModalProps {
  code: string | null
  /** When set, shows a live countdown and calls onExpire once it reaches zero — pass a handler
   * that generates a fresh code (see UsersPage/MaintenanceTeamPage) to keep the modal usable. */
  expiresAt?: string | null
  onExpire?: () => void
  onClose: () => void
  title?: string
  description?: string
}

export function InviteCodeModal({
  code,
  expiresAt,
  onExpire,
  onClose,
  title = 'Convite gerado',
  description = 'Compartilhe esse código com a pessoa. Ela usa em Criar conta > Tenho um código.',
}: InviteCodeModalProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    if (!code) return
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Modal open={!!code} onClose={onClose} title={title} description={description} className="max-w-sm">
      <div className="flex items-center justify-between gap-3 rounded-md border border-border-strong bg-surface px-4 py-3">
        <span className="font-mono text-lg font-semibold tracking-wider text-text-primary">{code}</span>
        <Button type="button" variant="secondary" size="sm" onClick={handleCopy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copiado' : 'Copiar'}
        </Button>
      </div>
      {expiresAt && onExpire && <CodeCountdown expiresAt={expiresAt} onExpire={onExpire} />}
      <div className="mt-4 flex justify-end">
        <Button type="button" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </Modal>
  )
}
