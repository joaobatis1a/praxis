import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, FileText, FileSpreadsheet, FileImage, Video, Star, Pencil, Trash2 } from 'lucide-react'
import type { DocType, LibraryDocument } from '../../../mocks/library'
import { cn } from '../../../lib/cn'

const typeConfig: Record<DocType, { icon: typeof FileText; color: string; bg: string; ring: string }> = {
  pdf: { icon: FileText, color: 'text-error', bg: 'bg-error', ring: 'hover:shadow-error/20' },
  doc: { icon: FileText, color: 'text-primary', bg: 'bg-primary', ring: 'hover:shadow-primary/20' },
  sheet: { icon: FileSpreadsheet, color: 'text-success', bg: 'bg-success', ring: 'hover:shadow-success/20' },
  video: { icon: Video, color: 'text-[#a855f7]', bg: 'bg-[#a855f7]', ring: 'hover:shadow-[#a855f7]/20' },
  image: { icon: FileImage, color: 'text-warning', bg: 'bg-warning', ring: 'hover:shadow-warning/20' },
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, scale: 0.85, y: 16 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, stiffness: 320, damping: 22 } },
}

export function HorizontalDocRow({
  title,
  documents,
  onOpen,
  onToggleFavorite,
  onEdit,
  onDelete,
}: {
  title: string
  documents: LibraryDocument[]
  onOpen: (doc: LibraryDocument) => void
  onToggleFavorite: (id: string) => void
  onEdit: (doc: LibraryDocument) => void
  onDelete: (doc: LibraryDocument) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [hovering, setHovering] = useState(false)

  if (documents.length === 0) return null

  function scrollByAmount(amount: number) {
    scrollRef.current?.scrollBy({ left: amount, behavior: 'smooth' })
  }

  return (
    <section
      className="group/row relative"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <h2 className="text-sm font-semibold text-text-primary">{title}</h2>

      <div className="relative mt-3">
        <motion.div
          ref={scrollRef}
          variants={container}
          initial="hidden"
          animate="show"
          className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth px-1 pb-3 pt-1 [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)]"
        >
          {documents.map((doc) => {
            const { icon: Icon, color, bg } = typeConfig[doc.type]
            return (
              <motion.div
                key={doc.id}
                variants={item}
                whileHover={{ y: -6, scale: 1.04, rotate: -0.75 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                className="group/card relative w-60 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-card p-4 text-left shadow-[var(--shadow-level-1)] hover:shadow-[var(--shadow-level-2)]"
              >
                <span className={cn('absolute inset-x-0 top-0 h-1', bg)} />
                <div className="flex items-start justify-between">
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg bg-surface', color)}>
                    <Icon size={20} />
                  </div>
                  <div className="flex items-center gap-0.5">
                    <motion.button
                      type="button"
                      onClick={() => onToggleFavorite(doc.id)}
                      whileTap={{ scale: 0.8 }}
                      aria-label={doc.favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                      className="rounded-md p-1 text-text-muted hover:bg-surface-hover hover:text-warning"
                    >
                      <motion.span
                        key={doc.favorite ? 'fav-on' : 'fav-off'}
                        initial={{ scale: 0.5, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                        className="block"
                      >
                        <Star size={14} className={cn(doc.favorite && 'fill-warning text-warning')} />
                      </motion.span>
                    </motion.button>
                    <button
                      type="button"
                      onClick={() => onEdit(doc)}
                      aria-label={`Editar ${doc.title}`}
                      className="rounded-md p-1 text-text-muted opacity-50 transition-all hover:bg-surface-hover hover:text-primary hover:opacity-100 group-hover/card:opacity-100"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(doc)}
                      aria-label={`Excluir ${doc.title}`}
                      className="rounded-md p-1 text-text-muted opacity-50 transition-all hover:bg-error-bg hover:text-error hover:opacity-100 group-hover/card:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <button type="button" onClick={() => onOpen(doc)} className="mt-3 block w-full text-left">
                  <p className="line-clamp-2 text-sm font-semibold text-text-primary">{doc.title}</p>
                  <p className="mt-1 truncate text-xs text-text-muted">{doc.author}</p>
                </button>
              </motion.div>
            )
          })}
        </motion.div>

        {documents.length > 3 && (
          <>
            <motion.button
              type="button"
              onClick={() => scrollByAmount(-320)}
              initial={{ opacity: 0 }}
              animate={{ opacity: hovering ? 1 : 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.15 }}
              aria-label="Rolar para a esquerda"
              className="absolute -left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface-card text-text-secondary shadow-[var(--shadow-level-2)] hover:text-primary"
            >
              <ChevronLeft size={18} />
            </motion.button>
            <motion.button
              type="button"
              onClick={() => scrollByAmount(320)}
              initial={{ opacity: 0 }}
              animate={{ opacity: hovering ? 1 : 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.15 }}
              aria-label="Rolar para a direita"
              className="absolute -right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface-card text-text-secondary shadow-[var(--shadow-level-2)] hover:text-primary"
            >
              <ChevronRight size={18} />
            </motion.button>
          </>
        )}
      </div>
    </section>
  )
}
