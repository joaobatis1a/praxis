import { useEffect, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Building2, User } from 'lucide-react'
import { Button, Modal, Select } from '../../../components/ui'
import { cn } from '../../../lib/cn'
import { departments } from '../../../mocks/procedures'
import type { NoticeRecipientType } from '../../../mocks/notices'
import type { TeamMember } from '../../../mocks/teamMembers'
import { listProcedures } from '../../procedures/api'
import { listUsers } from '../../users/api'

const departmentOptions = departments.map((d) => ({ value: d, label: d }))

export interface NoticeFormValues {
  procedureId: string
  procedureTitle: string
  description: string
  recipientType: NoticeRecipientType
  recipientId: string
  recipientLabel: string
}

interface NoticeFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: NoticeFormValues) => Promise<void> | void
  currentUserId: string
}

export function NoticeFormModal({ open, onClose, onSubmit, currentUserId }: NoticeFormModalProps) {
  const [procedureOptions, setProcedureOptions] = useState<{ value: string; label: string }[]>([])
  const [procedureId, setProcedureId] = useState('')
  const [description, setDescription] = useState('')
  const [recipientType, setRecipientType] = useState<NoticeRecipientType>('user')
  const [recipientId, setRecipientId] = useState('')
  const [saving, setSaving] = useState(false)
  const [members, setMembers] = useState<TeamMember[]>([])

  const memberOptions = members
    .filter((m) => m.id !== currentUserId && m.status === 'ativo')
    .map((m) => ({ value: m.id, label: `${m.name} · ${m.department}` }))

  useEffect(() => {
    if (!open) return
    listProcedures().then((data) => {
      const options = data.map((p) => ({ value: p.id, label: p.title }))
      setProcedureOptions(options)
      setProcedureId(options[0]?.value ?? '')
    })
    listUsers().then(setMembers)
    setDescription('')
    setRecipientType('user')
    setRecipientId('')
  }, [open])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!procedureId || !description.trim() || !recipientId) return
    const procedureTitle = procedureOptions.find((p) => p.value === procedureId)?.label ?? ''
    const recipientLabel =
      recipientType === 'department' ? recipientId : (memberOptions.find((m) => m.value === recipientId)?.label.split(' · ')[0] ?? '')
    setSaving(true)
    try {
      await onSubmit({
        procedureId,
        procedureTitle,
        description: description.trim(),
        recipientType,
        recipientId,
        recipientLabel,
      })
      onClose()
    } catch {
      // the parent already surfaced the error via toast — keep the modal open so the user can retry
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Novo aviso" description="Deixe um recado sobre uma função em andamento." className="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary">Função / procedimento</label>
          <Select
            value={procedureId}
            onChange={setProcedureId}
            options={procedureOptions}
            className="w-full"
            triggerClassName="w-full"
            aria-label="Função ou procedimento"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary">Onde você parou</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Confirmei os dados no sistema, falta registrar a solicitação e enviar a confirmação por e-mail."
            rows={3}
            className="w-full resize-none rounded-md border border-border-strong bg-surface-card px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary">Enviar para</label>
          <div className="relative grid grid-cols-2 rounded-md border border-border-strong bg-surface p-1">
            {(['user', 'department'] as const).map((type) => {
              const isSelected = recipientType === type
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setRecipientType(type)
                    setRecipientId('')
                  }}
                  className={cn(
                    'relative z-10 flex items-center justify-center gap-1.5 rounded-sm py-1.5 text-sm font-medium transition-colors',
                    isSelected ? 'text-primary-foreground' : 'text-text-secondary hover:text-text-primary',
                  )}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="notice-recipient-highlight"
                      transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                      className="absolute inset-0 -z-10 rounded-sm bg-primary"
                    />
                  )}
                  {type === 'user' ? <User size={14} /> : <Building2 size={14} />}
                  {type === 'user' ? 'Uma pessoa' : 'Um setor'}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary">
            {recipientType === 'user' ? 'Destinatário' : 'Setor'}
          </label>
          <Select
            value={recipientId}
            onChange={setRecipientId}
            options={recipientType === 'user' ? memberOptions : departmentOptions}
            className="w-full"
            triggerClassName="w-full"
            aria-label={recipientType === 'user' ? 'Destinatário' : 'Setor'}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving || !recipientId}>
            {saving ? 'Enviando...' : 'Enviar aviso'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
