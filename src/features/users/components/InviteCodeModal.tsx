import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button, Modal } from '../../../components/ui'

interface InviteCodeModalProps {
  code: string | null
  onClose: () => void
  title?: string
  description?: string
}

export function InviteCodeModal({
  code,
  onClose,
  title = 'Convite gerado',
  description = 'Compartilhe esse código com a pessoa — ela usa em Criar conta > Tenho um código.',
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
      <div className="mt-4 flex justify-end">
        <Button type="button" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </Modal>
  )
}
