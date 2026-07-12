import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GripVertical, Plus, Video, X } from 'lucide-react'
import { Button, Input, Modal, Select } from '../../../components/ui'
import { departments, type ProcedureStatus } from '../../../mocks/procedures'

const statusOptions = [
  { value: 'publicado', label: 'Publicado' },
  { value: 'rascunho', label: 'Rascunho' },
]

const departmentOptions = departments.map((d) => ({ value: d, label: d }))

export interface ProcedureFormValues {
  title: string
  department: string
  responsible: string
  status: ProcedureStatus
  estimatedMinutes: number
  steps: string[]
  videoUrl?: string
  videoName?: string
  /** only set when the user picks a new file in this session — absent means "keep existing video" on edit */
  videoFile?: File
  externalUrl?: string
}

interface ProcedureFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: ProcedureFormValues) => Promise<void> | void
  initialData?: ProcedureFormValues
}

const emptyForm: ProcedureFormValues = {
  title: '',
  department: departments[0],
  responsible: '',
  status: 'rascunho',
  estimatedMinutes: 10,
  steps: [''],
  videoUrl: undefined,
  videoName: undefined,
  externalUrl: undefined,
}

export function ProcedureFormModal({ open, onClose, onSubmit, initialData }: ProcedureFormModalProps) {
  const isEditing = !!initialData
  const [form, setForm] = useState<ProcedureFormValues>(emptyForm)
  const [saving, setSaving] = useState(false)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const createdObjectUrl = useRef<string | null>(null)

  useEffect(() => {
    if (open) setForm(initialData ?? emptyForm)
  }, [open, initialData])

  useEffect(() => {
    return () => {
      if (createdObjectUrl.current) URL.revokeObjectURL(createdObjectUrl.current)
    }
  }, [])

  function handleVideoChange(file: File | undefined) {
    if (!file) return
    if (createdObjectUrl.current) URL.revokeObjectURL(createdObjectUrl.current)
    const url = URL.createObjectURL(file)
    createdObjectUrl.current = url
    setForm((prev) => ({ ...prev, videoUrl: url, videoName: file.name, videoFile: file }))
  }

  function removeVideo() {
    if (createdObjectUrl.current) URL.revokeObjectURL(createdObjectUrl.current)
    createdObjectUrl.current = null
    setForm((prev) => ({ ...prev, videoUrl: undefined, videoName: undefined, videoFile: undefined }))
    if (videoInputRef.current) videoInputRef.current.value = ''
  }

  function updateStep(index: number, text: string) {
    setForm((prev) => ({ ...prev, steps: prev.steps.map((s, i) => (i === index ? text : s)) }))
  }

  function addStep() {
    setForm((prev) => ({ ...prev, steps: [...prev.steps, ''] }))
  }

  function removeStep(index: number) {
    setForm((prev) => ({ ...prev, steps: prev.steps.filter((_, i) => i !== index) }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const steps = form.steps.map((s) => s.trim()).filter(Boolean)
    if (!form.title.trim() || steps.length === 0) return
    setSaving(true)
    try {
      await onSubmit({ ...form, title: form.title.trim(), responsible: form.responsible.trim(), steps })
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
      title={isEditing ? 'Editar procedimento' : 'Novo procedimento'}
      description="Preencha as informações do procedimento operacional."
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          required
          label="Título"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Ex: Abertura de chamado"
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">Departamento</label>
            <Select
              value={form.department}
              onChange={(v) => setForm({ ...form, department: v })}
              options={departmentOptions}
              className="w-full"
              triggerClassName="w-full"
              aria-label="Departamento"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">Status</label>
            <Select
              value={form.status}
              onChange={(v) => setForm({ ...form, status: v as ProcedureStatus })}
              options={statusOptions}
              className="w-full"
              triggerClassName="w-full"
              aria-label="Status"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Responsável"
            value={form.responsible}
            onChange={(e) => setForm({ ...form, responsible: e.target.value })}
            placeholder="Ex: Time de Suporte"
          />
          <Input
            type="number"
            min={1}
            label="Duração estimada (min)"
            value={form.estimatedMinutes}
            onChange={(e) => setForm({ ...form, estimatedMinutes: Number(e.target.value) })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary">Etapas</label>
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {form.steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  className="flex items-center gap-2"
                >
                  <GripVertical size={14} className="shrink-0 text-text-muted" />
                  <input
                    required
                    value={step}
                    onChange={(e) => updateStep(i, e.target.value)}
                    placeholder={`Etapa ${i + 1}`}
                    className="h-9 flex-1 rounded-md border border-border-strong bg-surface-card px-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => removeStep(i)}
                    disabled={form.steps.length === 1}
                    aria-label="Remover etapa"
                    className="shrink-0 rounded-md p-1.5 text-text-muted transition-colors hover:bg-error-bg hover:text-error disabled:pointer-events-none disabled:opacity-30"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <button
            type="button"
            onClick={addStep}
            className="mt-1 flex items-center gap-1.5 self-start rounded-md px-2 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
          >
            <Plus size={14} />
            Adicionar etapa
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary">
            Arquivo de apoio <span className="font-normal text-text-muted">(opcional)</span>
          </label>
          <input ref={videoInputRef} type="file" className="hidden" onChange={(e) => handleVideoChange(e.target.files?.[0])} />
          {form.videoName ? (
            <div className="flex items-center justify-between rounded-md border border-border-strong bg-surface-card px-3 py-2.5">
              <span className="flex min-w-0 items-center gap-2 truncate text-sm text-text-primary">
                <Video size={16} className="shrink-0 text-primary" />
                <span className="truncate">{form.videoName}</span>
              </span>
              <button
                type="button"
                onClick={removeVideo}
                aria-label="Remover arquivo"
                className="shrink-0 rounded-md p-1 text-text-muted hover:bg-surface-hover hover:text-text-primary"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border-strong bg-surface py-6 text-text-muted transition-colors hover:border-primary hover:text-primary"
            >
              <Video size={20} />
              <span className="text-sm">Clique para fazer upload de um arquivo</span>
            </button>
          )}
          <p className="text-xs text-text-muted">
            Vídeo, imagem e PDF ficam disponíveis para visualizar direto na página do procedimento. Outros tipos ficam salvos para download.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary">
            Link externo <span className="font-normal text-text-muted">(opcional)</span>
          </label>
          <input
            type="url"
            value={form.externalUrl ?? ''}
            onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
            className="h-10 rounded-md border border-border-strong bg-surface-card px-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
            placeholder="https://drive.google.com/... ou https://youtube.com/..."
          />
          <p className="text-xs text-text-muted">Útil para vídeos grandes demais para o upload direto.</p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar procedimento'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
