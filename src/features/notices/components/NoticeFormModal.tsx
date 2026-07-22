import { useEffect, useState, type FormEvent } from 'react'
import { Button, Modal, Select } from '../../../components/ui'
import type { NoticeRecipientType } from '../../../mocks/notices'
import type { TeamMember } from '../../../mocks/teamMembers'
import { listDepartments } from '../../departments/api'
import { listProcedures } from '../../procedures/api'
import { listUsers } from '../../users/api'
import { RecipientPicker, type Recipient } from './RecipientPicker'

export interface NoticeFormRecipient {
  recipientType: NoticeRecipientType
  recipientId: string
  recipientLabel: string
}

export interface NoticeFormValues {
  procedureId: string
  procedureTitle: string
  description: string
  recipients: NoticeFormRecipient[]
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
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [saving, setSaving] = useState(false)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [departments, setDepartments] = useState<string[]>([])

  const memberOptions = members.filter((m) => m.id !== currentUserId && m.status === 'ativo')

  useEffect(() => {
    if (!open) return
    listProcedures().then((data) => {
      const options = data.map((p) => ({ value: p.id, label: p.title }))
      setProcedureOptions(options)
      setProcedureId(options[0]?.value ?? '')
    })
    listUsers().then(setMembers)
    listDepartments().then(setDepartments)
    setDescription('')
    setRecipients([])
  }, [open])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!procedureId || !description.trim() || recipients.length === 0) return
    const procedureTitle = procedureOptions.find((p) => p.value === procedureId)?.label ?? ''
    setSaving(true)
    try {
      await onSubmit({
        procedureId,
        procedureTitle,
        description: description.trim(),
        recipients: recipients.map((r) => ({ recipientType: r.type, recipientId: r.id, recipientLabel: r.label })),
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
          <p className="text-xs text-text-muted">Escolha uma ou mais pessoas e/ou setores. Todos recebem o mesmo aviso.</p>
          <RecipientPicker members={memberOptions} departments={departments} value={recipients} onChange={setRecipients} />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving || recipients.length === 0}>
            {saving ? 'Enviando...' : 'Enviar aviso'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
