import { useEffect, useState, type FormEvent } from 'react'
import { Button, Modal } from '../../../components/ui'

interface FolderFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (name: string) => Promise<void> | void
  locationLabel: string
}

export function FolderFormModal({ open, onClose, onSubmit, locationLabel }: FolderFormModalProps) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setName('')
  }, [open])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    await onSubmit(name.trim())
    setSaving(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Nova pasta" description={`Será criada em: ${locationLabel}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary">Nome da pasta</label>
          <input
            autoFocus
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10 rounded-md border border-border-strong bg-surface-card px-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
            placeholder="Ex: Contratos"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Criando...' : 'Criar pasta'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
