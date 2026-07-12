import { motion } from 'framer-motion'
import { FileText, FileSpreadsheet, FileImage, Video, Star, History, Trash2, Pencil } from 'lucide-react'
import { Card } from '../../../components/ui'
import { cn } from '../../../lib/cn'
import type { DocType, LibraryDocument } from '../../../mocks/library'

const typeConfig: Record<DocType, { icon: typeof FileText; color: string }> = {
  pdf: { icon: FileText, color: 'text-error' },
  doc: { icon: FileText, color: 'text-primary' },
  sheet: { icon: FileSpreadsheet, color: 'text-success' },
  video: { icon: Video, color: 'text-[#a855f7]' },
  image: { icon: FileImage, color: 'text-warning' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

interface DocumentCardProps {
  document: LibraryDocument
  onOpen: () => void
  onToggleFavorite: () => void
  onEdit: () => void
  onDelete: () => void
}

export function DocumentCard({ document, onOpen, onToggleFavorite, onEdit, onDelete }: DocumentCardProps) {
  const { icon: Icon, color } = typeConfig[document.type]
  const latestVersion = document.history[0]?.version ?? 'v1'

  return (
    <Card className="group flex flex-col">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-md bg-surface transition-transform duration-300 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-hover:-rotate-6',
            color,
          )}
        >
          <Icon size={20} />
        </div>
        <div className="flex items-center gap-0.5">
          <motion.button
            type="button"
            onClick={onToggleFavorite}
            whileTap={{ scale: 0.8 }}
            aria-label={document.favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            className="rounded-md p-1.5 text-text-muted hover:bg-surface-hover hover:text-warning"
          >
            <motion.span
              key={document.favorite ? 'fav-on' : 'fav-off'}
              initial={{ scale: 0.5, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              className="block"
            >
              <Star size={16} className={cn(document.favorite && 'fill-warning text-warning')} />
            </motion.span>
          </motion.button>
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Editar ${document.title}`}
            className="rounded-md p-1.5 text-text-muted opacity-50 transition-all hover:bg-surface-hover hover:text-primary hover:opacity-100 group-hover:opacity-100"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Excluir ${document.title}`}
            className="rounded-md p-1.5 text-text-muted opacity-50 transition-all hover:bg-error-bg hover:text-error hover:opacity-100 group-hover:opacity-100"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <button type="button" onClick={onOpen} className="mt-3 text-left">
        <p className="line-clamp-2 text-sm font-semibold text-text-primary transition-colors group-hover:text-primary">
          {document.title}
        </p>
      </button>

      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span className="truncate">{document.author}</span>
          <span className="shrink-0">{formatDate(document.updatedAt)}</span>
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="mt-2 flex items-center gap-1 text-xs font-medium text-text-muted transition-colors hover:text-primary"
        >
          <History size={12} />
          {latestVersion} · ver histórico
        </button>
      </div>
    </Card>
  )
}
