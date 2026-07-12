import { useEffect, useState, type FormEvent } from 'react'
import { Button, Input, Modal } from '../../../components/ui'
import type { Role } from '../../auth/types'
import type { CreateUserInput } from '../api'

const departments = ['Diretoria', 'Operações', 'Comercial', 'Financeiro', 'Suporte', 'Recursos Humanos']

const roleOptions: { value: Role; label: string }[] = [
  { value: 'admin', label: 'Administrador' },
  { value: 'gestor', label: 'Gestor' },
  { value: 'colaborador', label: 'Colaborador' },
]

interface UserFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (input: CreateUserInput) => Promise<void> | void
  initialData?: CreateUserInput
}

const emptyForm: CreateUserInput = { name: '', email: '', role: 'colaborador', department: departments[0] }

export function UserFormModal({ open, onClose, onSubmit, initialData }: UserFormModalProps) {
  const [form, setForm] = useState<CreateUserInput>(initialData ?? emptyForm)
  const [saving, setSaving] = useState(false)
  const isEditing = !!initialData

  useEffect(() => {
    if (open) setForm(initialData ?? emptyForm)
  }, [open, initialData])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSubmit(form)
    setSaving(false)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Editar usuário' : 'Criar usuário'}
      description={isEditing ? 'Atualize as informações do colaborador.' : 'Preencha os dados do novo colaborador.'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">Cargo</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
              className="h-10 rounded-md border border-border-strong bg-surface-card px-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
            >
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">Departamento</label>
            <select
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="h-10 rounded-md border border-border-strong bg-surface-card px-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar usuário'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
