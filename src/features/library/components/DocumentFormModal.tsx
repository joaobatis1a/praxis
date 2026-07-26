import { useEffect, useRef, useState, type FormEvent } from 'react'
import { FileUp, X } from 'lucide-react'
import { Button, ExternalLinksField, Modal, type ExternalLinkValue } from '../../../components/ui'
import type { DocType } from '../../../mocks/library'

const UPLOADABLE_TYPES: DocType[] = ['video', 'image', 'pdf']

export function inferTypeFromFilename(filename: string): DocType {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'pdf') return 'pdf'
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'sheet'
  if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) return 'video'
  if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext)) return 'image'
  return 'doc'
}

export function stripExtension(filename: string) {
  return filename.replace(/\.[^./]+$/, '')
}

export interface DocumentFormValues {
  title: string
  type: DocType
  fileName?: string
  file?: File
  externalLinks?: ExternalLinkValue[]
}

interface DocumentFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: DocumentFormValues) => Promise<void> | void
  /** creating only: picking 2+ files at once creates one document per file instead of a single one */
  onSubmitBatch?: (files: File[]) => Promise<void> | void
  folderLabel: string
  disabled?: boolean
  initialData?: DocumentFormValues
}

export function DocumentFormModal({ open, onClose, onSubmit, onSubmitBatch, folderLabel, disabled, initialData }: DocumentFormModalProps) {
  const isEditing = !!initialData
  const [title, setTitle] = useState('')
  const [type, setType] = useState<DocType>('doc')
  const [fileName, setFileName] = useState<string | null>(null)
  const [file, setFile] = useState<File | undefined>(undefined)
  const [batchMode, setBatchMode] = useState(false)
  const [batchFiles, setBatchFiles] = useState<File[]>([])
  const [externalLinks, setExternalLinks] = useState<ExternalLinkValue[]>([])
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Driven by an explicit flag, not batchFiles.length > 1 — removing items down to just 1 left
  // must still show it as an (single-item) batch instead of silently falling back to the
  // single-file view, which had no file/fileName set and made that last item look deleted.
  const isBatch = !isEditing && batchMode

  useEffect(() => {
    if (open) {
      setTitle(initialData?.title ?? '')
      setType(initialData?.type ?? 'doc')
      setFileName(initialData?.fileName ?? null)
      setFile(undefined)
      setBatchMode(false)
      setBatchFiles([])
      setExternalLinks(initialData?.externalLinks ?? [])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData])

  function handleFilesChange(picked: FileList | null) {
    if (!picked || picked.length === 0) return
    const files = Array.from(picked)
    if (fileInputRef.current) fileInputRef.current.value = ''

    if (!isEditing && (batchMode || files.length > 1)) {
      setBatchMode(true)
      setBatchFiles((prev) => [...prev, ...files])
      setFileName(null)
      setFile(undefined)
      return
    }
    const first = files[0]
    setBatchMode(false)
    setBatchFiles([])
    setFileName(first.name)
    setFile(first)
    setType(inferTypeFromFilename(first.name))
    setTitle((current) => (isEditing ? current : current || stripExtension(first.name)))
  }

  function removeFile() {
    setFileName(null)
    setFile(undefined)
  }

  function removeBatchFile(index: number) {
    setBatchFiles((prev) => {
      const next = prev.filter((_, i) => i !== index)
      if (next.length === 0) setBatchMode(false)
      return next
    })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (disabled) return
    setSaving(true)
    try {
      if (isBatch) {
        await onSubmitBatch?.(batchFiles)
      } else {
        const cleanLinks = externalLinks
          .filter((link) => link.url.trim())
          .map((link) => ({ label: link.label.trim() || 'Link', url: link.url.trim() }))
        await onSubmit({ title, type, fileName: fileName ?? undefined, file, externalLinks: cleanLinks })
      }
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
            Arquivo{!isEditing && 's'} {isEditing && <span className="font-normal text-text-muted">(opcional, para substituir)</span>}
          </label>
          <input
            ref={fileInputRef}
            type="file"
            multiple={!isEditing}
            className="hidden"
            onChange={(e) => handleFilesChange(e.target.files)}
          />
          {isBatch ? (
            <div className="space-y-1.5">
              {batchFiles.map((f, i) => (
                <div key={`${f.name}-${i}`} className="flex items-center justify-between rounded-md border border-border-strong bg-surface-card px-3 py-2">
                  <span className="text-sm text-text-primary">{f.name}</span>
                  <button
                    type="button"
                    onClick={() => removeBatchFile(i)}
                    aria-label="Remover arquivo"
                    className="shrink-0 rounded-md p-1 text-text-muted hover:bg-surface-hover hover:text-text-primary"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border-strong bg-surface py-2 text-xs font-medium text-text-muted transition-colors hover:border-primary hover:text-primary"
              >
                <FileUp size={14} />
                Adicionar mais arquivos
              </button>
            </div>
          ) : fileName ? (
            <div className="flex items-center justify-between rounded-md border border-border-strong bg-surface-card px-3 py-2.5">
              <span className="text-sm text-text-primary">{fileName}</span>
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
              <span className="text-sm">{isEditing ? 'Clique para escolher um arquivo' : 'Clique para escolher um ou mais arquivos'}</span>
            </button>
          )}
          <p className="text-xs text-text-muted">
            {isBatch
              ? 'Cada arquivo vira um documento separado, com o nome do arquivo como título.'
              : canPreviewInApp
                ? 'Vídeo, imagem e PDF ficam disponíveis para visualizar direto na página do documento.'
                : 'Este tipo de arquivo ainda não pode ser visualizado dentro do site, só o nome fica salvo como referência. Use o link externo abaixo se quiser que dê para abrir o conteúdo.'}
          </p>
        </div>

        {!isBatch && (
          <>
            <ExternalLinksField value={externalLinks} onChange={setExternalLinks} />

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
          </>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving || disabled || (isBatch && batchFiles.length === 0)}>
            {saving
              ? 'Salvando...'
              : isBatch
                ? `Criar ${batchFiles.length} documento${batchFiles.length === 1 ? '' : 's'}`
                : isEditing
                  ? 'Salvar alterações'
                  : 'Criar documento'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
