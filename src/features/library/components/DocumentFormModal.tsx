import { useEffect, useRef, useState, type FormEvent } from 'react'
import { FileUp, X } from 'lucide-react'
import { Button, Modal } from '../../../components/ui'
import type { DocType } from '../../../mocks/library'

const UPLOADABLE_TYPES: DocType[] = ['video', 'image', 'pdf']

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
  fileName?: string
  file?: File
  externalUrl?: string
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
  const [file, setFile] = useState<File | undefined>(undefined)
  const [externalUrl, setExternalUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTitle(initialData?.title ?? '')
      setType(initialData?.type ?? 'doc')
      setFileName(initialData?.fileName ?? null)
      setFile(undefined)
      setExternalUrl(initialData?.externalUrl ?? '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData])

  function handleFileChange(picked: File | undefined) {
    if (!picked) return
    setFileName(picked.name)
    setFile(picked)
    setType(inferTypeFromFilename(picked.name))
    setTitle((current) => (isEditing ? current : current || stripExtension(picked.name)))
  }

  function removeFile() {
    setFileName(null)
    setFile(undefined)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (disabled) return
    setSaving(true)
    try {
      await onSubmit({ title, type, fileName: fileName ?? undefined, file, externalUrl: externalUrl.trim() || undefined })
      onClose()
    } catch {
      // the parent already surfaced the error via toast — keep the modal open so the user can retry
    } finally {
      setSaving(false)
    }
  }

  const canPreviewInApp = UPLOADABLE_TYPES.includes(type)

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
                onClick={removeFile}
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
          <p className="text-xs text-text-muted">
            {canPreviewInApp
              ? 'Vídeo, imagem e PDF ficam disponíveis para visualizar direto na página do documento.'
              : 'Este tipo de arquivo ainda não pode ser visualizado dentro do site — só o nome fica salvo, como referência. Use o link externo abaixo se quiser que dê para abrir o conteúdo.'}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary">
            Link externo <span className="font-normal text-text-muted">(opcional)</span>
          </label>
          <input
            type="url"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            className="h-10 rounded-md border border-border-strong bg-surface-card px-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
            placeholder="https://drive.google.com/... ou https://youtube.com/..."
          />
          <p className="text-xs text-text-muted">
            Útil para vídeos grandes demais para o upload direto, ou para manter o arquivo hospedado fora do Praxis.
          </p>
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
