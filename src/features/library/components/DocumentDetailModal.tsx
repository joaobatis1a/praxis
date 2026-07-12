import { Clock, FileText, FileSpreadsheet, FileImage, Video, Star, Trash2, Pencil } from 'lucide-react'
import { Badge, Button, Modal } from '../../../components/ui'
import { cn } from '../../../lib/cn'
import type { DocType, LibraryDocument } from '../../../mocks/library'

const typeConfig: Record<DocType, { icon: typeof FileText; color: string; label: string }> = {
  pdf: { icon: FileText, color: 'text-error', label: 'PDF' },
  doc: { icon: FileText, color: 'text-primary', label: 'Documento' },
  sheet: { icon: FileSpreadsheet, color: 'text-success', label: 'Planilha' },
  video: { icon: Video, color: 'text-[#a855f7]', label: 'Vídeo' },
  image: { icon: FileImage, color: 'text-warning', label: 'Imagem' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function DocumentDetailModal({
  document,
  onClose,
  onToggleFavorite,
  onEdit,
  onDelete,
}: {
  document: LibraryDocument | null
  onClose: () => void
  onToggleFavorite: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}) {
  if (!document) return null
  const { icon: Icon, color, label } = typeConfig[document.type]

  return (
    <Modal
      open={!!document}
      onClose={onClose}
      className="max-w-xl"
      headerAction={
        <button
          type="button"
          onClick={() => onToggleFavorite(document.id)}
          aria-label={document.favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          className="rounded-md p-1 text-text-muted hover:bg-surface-hover hover:text-warning"
        >
          <Star size={18} className={cn(document.favorite && 'fill-warning text-warning')} />
        </button>
      }
    >
      <div className="flex items-start gap-4 pr-16">
        <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-surface', color)}>
          <Icon size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-text-primary">{document.title}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-text-muted">
            <Badge variant="neutral">{label}</Badge>
            <span>Autor: {document.author}</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-text-primary">
          <Clock size={14} />
          Histórico de versões
        </h3>
        <ol className="mt-3 space-y-4 border-l border-border pl-4">
          {document.history.map((entry, i) => (
            <li key={entry.version} className="relative">
              <span
                className={cn(
                  'absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-surface-card',
                  i === 0 ? 'bg-primary' : 'bg-border-strong',
                )}
              />
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-text-primary">{entry.version}</span>
                {i === 0 && <Badge variant="success">Atual</Badge>}
                <span className="text-xs text-text-muted">{formatDate(entry.date)}</span>
              </div>
              <p className="mt-0.5 text-sm text-text-secondary">{entry.note}</p>
              <p className="text-xs text-text-muted">por {entry.author}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
        <Button variant="secondary" onClick={() => onEdit(document.id)}>
          <Pencil size={16} />
          Editar
        </Button>
        <Button variant="destructive" onClick={() => onDelete(document.id)}>
          <Trash2 size={16} />
          Excluir documento
        </Button>
      </div>
    </Modal>
  )
}
