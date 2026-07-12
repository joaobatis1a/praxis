import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, FileText, FileSpreadsheet, FileImage, Video } from 'lucide-react'
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
}: {
  title: string
  documents: LibraryDocument[]
  onOpen: (doc: LibraryDocument) => void
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
              <motion.button
                key={doc.id}
                variants={item}
                whileHover={{ y: -6, scale: 1.04, rotate: -0.75 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                onClick={() => onOpen(doc)}
                className="relative w-60 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-card p-4 text-left shadow-[var(--shadow-level-1)] hover:shadow-[var(--shadow-level-2)]"
              >
                <span className={cn('absolute inset-x-0 top-0 h-1', bg)} />
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg bg-surface', color)}>
                  <Icon size={20} />
                </div>
                <p className="mt-3 line-clamp-2 text-sm font-semibold text-text-primary">{doc.title}</p>
                <p className="mt-1 truncate text-xs text-text-muted">{doc.author}</p>
              </motion.button>
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
