import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '../../../lib/motionVariants'
import type { LibraryDocument } from '../../../mocks/library'
import { DocumentCard } from './DocumentCard'

export function DocumentGridSection({
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
  if (documents.length === 0) return null

  return (
    <section>
      <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {documents.map((doc) => (
          <motion.div key={doc.id} variants={staggerItem}>
            <DocumentCard
              document={doc}
              onOpen={() => onOpen(doc)}
              onToggleFavorite={() => onToggleFavorite(doc.id)}
              onEdit={() => onEdit(doc)}
              onDelete={() => onDelete(doc)}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
