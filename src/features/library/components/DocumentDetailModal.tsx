import { useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Clock, ExternalLink, FileText, FileSpreadsheet, FileImage, Maximize2, Video, Star, Trash2, Pencil, X } from 'lucide-react'
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
  const [lightboxOpen, setLightboxOpen] = useState(false)

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

      {document.fileUrl && document.type === 'video' && (
        <video key={document.fileUrl} src={document.fileUrl} controls className="mt-5 aspect-video w-full rounded-md border border-border bg-black" />
      )}
      {document.fileUrl && document.type === 'image' && (
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="mt-5 block w-full cursor-zoom-in overflow-hidden rounded-md border border-border"
          aria-label="Ver imagem em tamanho maior"
        >
          <img key={document.fileUrl} src={document.fileUrl} alt={document.title} className="max-h-96 w-full object-contain" />
        </button>
      )}
      {document.fileUrl && document.type === 'pdf' && (
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="group relative mt-5 block w-full overflow-hidden rounded-md border border-border"
          aria-label="Ver PDF completo"
        >
          <iframe key={document.fileUrl} src={document.fileUrl} title={document.title} className="h-96 w-full" />
          <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
            <span className="flex items-center gap-1.5 rounded-md bg-black/70 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
              <Maximize2 size={12} />
              Ver completo
            </span>
          </span>
        </button>
      )}
      {document.externalLinks && document.externalLinks.length > 0 && (
        <div className="mt-5 space-y-2">
          {document.externalLinks.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-md border border-border-strong bg-surface px-3 py-2.5 text-sm font-medium text-primary hover:bg-surface-hover"
            >
              <ExternalLink size={16} className="shrink-0" />
              <span className="truncate">{link.label}</span>
            </a>
          ))}
        </div>
      )}

      {lightboxOpen &&
        document.fileUrl &&
        createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(0,0,0,0.85)] p-6"
              onClick={() => setLightboxOpen(false)}
            >
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                aria-label="Fechar"
                className="absolute right-4 top-4 rounded-md p-2 text-white/70 hover:bg-white/10 hover:text-white"
              >
                <X size={22} />
              </button>
              {document.type === 'image' ? (
                <motion.img
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  src={document.fileUrl}
                  alt={document.title}
                  className="max-h-full max-w-full rounded-md object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <motion.iframe
                  initial={{ scale: 0.97, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  src={document.fileUrl}
                  title={document.title}
                  className="h-full max-h-[85vh] w-full max-w-4xl rounded-md bg-white"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </motion.div>
          </AnimatePresence>,
          window.document.body,
        )}

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
