import { FileText, FileSpreadsheet, FileImage, Video } from 'lucide-react'
import type { DocType, LibraryDocument } from '../../../mocks/library'
import { cn } from '../../../lib/cn'

const typeConfig: Record<DocType, { icon: typeof FileText; color: string }> = {
  pdf: { icon: FileText, color: 'text-error' },
  doc: { icon: FileText, color: 'text-primary' },
  sheet: { icon: FileSpreadsheet, color: 'text-success' },
  video: { icon: Video, color: 'text-[#a855f7]' },
  image: { icon: FileImage, color: 'text-warning' },
}

export function HorizontalDocRow({
  title,
  documents,
  onOpen,
}: {
  title: string
  documents: LibraryDocument[]
  onOpen: (doc: LibraryDocument) => void
}) {
  if (documents.length === 0) return null

  return (
    <section>
      <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
        {documents.map((doc) => {
          const { icon: Icon, color } = typeConfig[doc.type]
          return (
            <button
              key={doc.id}
              type="button"
              onClick={() => onOpen(doc)}
              className="flex w-56 shrink-0 items-center gap-3 rounded-lg border border-border bg-surface-card p-3 text-left transition-colors hover:border-border-strong hover:bg-surface-hover"
            >
              <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface', color)}>
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-primary">{doc.title}</p>
                <p className="truncate text-xs text-text-muted">{doc.author}</p>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
