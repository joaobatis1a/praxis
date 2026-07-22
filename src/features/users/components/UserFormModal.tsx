import { useEffect, useState, type FormEvent } from 'react'
import { Button, Input, Modal, Select } from '../../../components/ui'
import { isSupabase } from '../../../lib/dataSource'
import { listDepartments } from '../../departments/api'
import type { Role } from '../../auth/types'
import type { CreateUserInput } from '../api'

const roleOptions: { value: Role; label: string }[] = [
  { value: 'admin', label: 'Proprietário' },
  { value: 'gestor', label: 'Gestor' },
  { value: 'colaborador', label: 'Colaborador' },
]

interface UserFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (input: CreateUserInput) => Promise<void> | void
  initialData?: CreateUserInput
}

const emptyForm: CreateUserInput = { name: '', email: '', role: 'colaborador', department: '' }

export function UserFormModal({ open, onClose, onSubmit, initialData }: UserFormModalProps) {
  const [form, setForm] = useState<CreateUserInput>(initialData ?? emptyForm)
  const [saving, setSaving] = useState(false)
  const [departments, setDepartments] = useState<string[]>([])
  const isEditing = !!initialData
  // Supabase mode can't create an account directly (no password to set for someone else) —
  // creating instead generates an invite code, so name/email aren't collected here.
  const isInviteMode = isSupabase && !isEditing

  useEffect(() => {
    if (open) setForm(initialData ?? emptyForm)
  }, [open, initialData])

  useEffect(() => {
    if (!open) return
    listDepartments().then((data) => {
      setDepartments(data)
      setForm((prev) => (prev.department ? prev : { ...prev, department: data[0] ?? '' }))
    })
  }, [open])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit(form)
      onClose()
    } catch {
      // the parent already surfaced the error via toast — keep the modal open so the user can retry
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Editar usuário' : isInviteMode ? 'Gerar convite' : 'Criar usuário'}
      description={
        isEditing
          ? 'Atualize as informações do colaborador.'
          : isInviteMode
            ? 'Escolha o cargo e departamento. A pessoa preenche o próprio nome e e-mail ao entrar com o código.'
            : 'Preencha os dados do novo colaborador.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isInviteMode && (
          <>
            <Input
              label="Nome completo"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label="E-mail"
              type="email"
              required
              disabled={isEditing && isSupabase}
              hint={isEditing && isSupabase ? 'O e-mail não pode ser alterado.' : undefined}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">Cargo</label>
            <Select
              value={form.role}
              onChange={(v) => setForm({ ...form, role: v as Role })}
              options={roleOptions}
              className="w-full"
              triggerClassName="w-full"
              aria-label="Cargo"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">Departamento</label>
            <Select
              value={form.department}
              onChange={(v) => setForm({ ...form, department: v })}
              options={departments.map((dept) => ({ value: dept, label: dept }))}
              className="w-full"
              triggerClassName="w-full"
              aria-label="Departamento"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Salvando...' : isEditing ? 'Salvar alterações' : isInviteMode ? 'Gerar código' : 'Criar usuário'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
