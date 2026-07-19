import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, Plus, X } from 'lucide-react'

export interface ExternalLinkValue {
  label: string
  url: string
}

interface ExternalLinksFieldProps {
  value: ExternalLinkValue[]
  onChange: (next: ExternalLinkValue[]) => void
}

export function ExternalLinksField({ value, onChange }: ExternalLinksFieldProps) {
  function updateLink(index: number, patch: Partial<ExternalLinkValue>) {
    onChange(value.map((link, i) => (i === index ? { ...link, ...patch } : link)))
  }

  function addLink() {
    onChange([...value, { label: '', url: '' }])
  }

  function removeLink(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text-primary">
        Links externos <span className="font-normal text-text-muted">(opcional)</span>
      </label>
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {value.map((link, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="flex items-center gap-2"
            >
              <ExternalLink size={14} className="shrink-0 text-text-muted" />
              <input
                value={link.label}
                onChange={(e) => updateLink(i, { label: e.target.value })}
                placeholder="Nome (ex: Vídeo de treinamento)"
                className="h-9 w-2/5 rounded-md border border-border-strong bg-surface-card px-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
              />
              <input
                type="url"
                value={link.url}
                onChange={(e) => updateLink(i, { url: e.target.value })}
                placeholder="https://drive.google.com/... ou https://youtube.com/..."
                className="h-9 flex-1 rounded-md border border-border-strong bg-surface-card px-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => removeLink(i)}
                aria-label="Remover link"
                className="shrink-0 rounded-md p-1.5 text-text-muted transition-colors hover:bg-error-bg hover:text-error"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <button
        type="button"
        onClick={addLink}
        className="mt-1 flex items-center gap-1.5 self-start rounded-md px-2 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
      >
        <Plus size={14} />
        Adicionar link
      </button>
      <p className="text-xs text-text-muted">Útil para vídeos grandes demais para o upload direto, ou arquivos hospedados fora do Praxis.</p>
    </div>
  )
}
