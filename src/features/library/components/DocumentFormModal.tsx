import { useEffect, useRef, useState, type FormEvent } from 'react'
import { FileUp, X } from 'lucide-react'
import { Button, Modal } from '../../../components/ui'
import type { DocType } from '../../../mocks/library'

function inferTypeFromFilename(filename: string): DocType {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'pdf') return 'pdf'
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'sheet'
  if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) return 'video'
  if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext)) return 'image'
  return 'doc'
}

function stripExtension(filename: string) {
  return filename.replace(/\.[^./]+$/, '')
}

export interface DocumentFormValues {
  title: string
  type: DocType
}

interface DocumentFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: DocumentFormValues) => Promise<void> | void
  folderLabel: string
  disabled?: boolean
  initialData?: DocumentFormValues
}

export function DocumentFormModal({ open, onClose, onSubmit, folderLabel, disabled, initialData }: DocumentFormModalProps) {
  const isEditing = !!initialData
  const [title, setTitle] = useState('')
  const [type, setType] = useState<DocType>('doc')
  const [fileName, setFileName] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTitle(initialData?.title ?? '')
      setType(initialData?.type ?? 'doc')
      setFileName(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData])

  function handleFileChange(file: File | undefined) {
    if (!file) return
    setFileName(file.name)
    setType(inferTypeFromFilename(file.name))
    setTitle((current) => (isEditing ? current : current || stripExtension(file.name)))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (disabled) return
    setSaving(true)
    await onSubmit({ title, type })
    setSaving(false)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Editar documento' : 'Novo documento'}
      description={isEditing ? undefined : `Será criado em: ${folderLabel}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary">
            Arquivo {isEditing && <span className="font-normal text-text-muted">(opcional, para substituir)</span>}
          </label>
          <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0])} />
          {fileName ? (
            <div className="flex items-center justify-between rounded-md border border-border-strong bg-surface-card px-3 py-2.5">
              <span className="truncate text-sm text-text-primary">{fileName}</span>
              <button
                type="button"
                onClick={() => {
                  setFileName(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                aria-label="Remover arquivo"
                className="shrink-0 rounded-md p-1 text-text-muted hover:bg-surface-hover hover:text-text-primary"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border-strong bg-surface py-6 text-text-muted transition-colors hover:border-primary hover:text-primary"
            >
              <FileUp size={20} />
              <span className="text-sm">Clique para escolher um arquivo</span>
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary">Título</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-10 rounded-md border border-border-strong bg-surface-card px-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
            placeholder="Ex: Manual de Integração"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving || disabled}>
            {saving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar documento'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
