import { Check, Folder, Library } from 'lucide-react'
import { Modal } from '../../../components/ui'
import { cn } from '../../../lib/cn'
import type { FolderNode, LibraryDocument } from '../../../mocks/library'

function FolderOption({
  node,
  depth,
  currentFolderId,
  onMove,
}: {
  node: FolderNode
  depth: number
  currentFolderId?: string
  onMove: (folderId: string) => void
}) {
  const isCurrent = currentFolderId === node.id
  return (
    <>
      <button
        type="button"
        disabled={isCurrent}
        onClick={() => onMove(node.id)}
        style={{ paddingLeft: `${depth * 20 + 12}px` }}
        className={cn(
          'flex w-full items-center gap-2 rounded-md py-2 pr-3 text-left text-sm transition-colors',
          isCurrent ? 'text-primary' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
        )}
      >
        <Folder size={15} className="shrink-0" />
        <span className="min-w-0 flex-1 truncate">{node.name}</span>
        {isCurrent && <Check size={15} className="shrink-0" />}
      </button>
      {node.children?.map((child) => (
        <FolderOption key={child.id} node={child} depth={depth + 1} currentFolderId={currentFolderId} onMove={onMove} />
      ))}
    </>
  )
}

interface MoveDocumentModalProps {
  document: LibraryDocument | null
  tree: FolderNode[]
  onClose: () => void
  onMove: (folderId: string | null) => void
}

export function MoveDocumentModal({ document, tree, onClose, onMove }: MoveDocumentModalProps) {
  return (
    <Modal
      open={!!document}
      onClose={onClose}
      title="Mover documento"
      description={document ? `Escolha para onde mover "${document.title}".` : undefined}
    >
      <div className="-mx-1 max-h-80 space-y-0.5 overflow-y-auto px-1">
        <button
          type="button"
          disabled={!document?.folderId}
          onClick={() => onMove(null)}
          className={cn(
            'flex w-full items-center gap-2 rounded-md py-2 pr-3 pl-3 text-left text-sm transition-colors',
            !document?.folderId ? 'text-primary' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
          )}
        >
          <Library size={15} className="shrink-0" />
          <span className="min-w-0 flex-1 truncate">Biblioteca (raiz)</span>
          {!document?.folderId && <Check size={15} className="shrink-0" />}
        </button>
        {tree.map((node) => (
          <FolderOption key={node.id} node={node} depth={0} currentFolderId={document?.folderId} onMove={onMove} />
        ))}
      </div>
    </Modal>
  )
}
