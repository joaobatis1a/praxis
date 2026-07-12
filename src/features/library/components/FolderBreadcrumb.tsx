import { ChevronRight, Home } from 'lucide-react'
import type { FolderNode } from '../../../mocks/library'

export function FolderBreadcrumb({
  path,
  onNavigate,
}: {
  path: FolderNode[]
  onNavigate: (id: string | null) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-1 text-sm">
      <button
        type="button"
        onClick={() => onNavigate(null)}
        className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-text-muted hover:bg-surface-hover hover:text-text-primary"
      >
        <Home size={14} />
      </button>
      {path.map((node, i) => {
        const isLast = i === path.length - 1
        return (
          <span key={node.id} className="flex items-center gap-1">
            <ChevronRight size={14} className="text-text-muted" />
            <button
              type="button"
              onClick={() => onNavigate(node.id)}
              disabled={isLast}
              className={
                isLast
                  ? 'rounded-md px-1.5 py-0.5 font-semibold text-text-primary'
                  : 'rounded-md px-1.5 py-0.5 text-text-muted hover:bg-surface-hover hover:text-text-primary'
              }
            >
              {node.name}
            </button>
          </span>
        )
      })}
    </div>
  )
}
