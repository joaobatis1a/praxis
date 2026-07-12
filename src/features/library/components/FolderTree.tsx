import { useState, type FormEvent } from 'react'
import { ChevronRight, Folder, FolderOpen, Pencil, Plus, Trash2, X } from 'lucide-react'
import { cn } from '../../../lib/cn'
import type { FolderNode } from '../../../mocks/library'

interface TreeActions {
  onAddFolder: (parentId: string, name: string) => void
  onRenameFolder: (id: string, name: string) => void
  onRequestDelete: (id: string, name: string) => void
}

function InlineTextForm({
  depth,
  initialValue = '',
  placeholder = 'Nome da pasta',
  onSubmit,
  onCancel,
}: {
  depth: number
  initialValue?: string
  placeholder?: string
  onSubmit: (name: string) => void
  onCancel: () => void
}) {
  const [value, setValue] = useState(initialValue)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (value.trim()) onSubmit(value.trim())
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ paddingLeft: `${depth * 16 + 12}px` }}
      className="flex items-center gap-1 py-1 pr-2"
    >
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={(e) => e.target.select()}
        onKeyDown={(e) => e.key === 'Escape' && onCancel()}
        placeholder={placeholder}
        className="h-7 w-full rounded-md border border-primary bg-surface-card px-2 text-xs text-text-primary focus:outline-none"
      />
      <button type="button" onClick={onCancel} aria-label="Cancelar" className="shrink-0 rounded p-1 text-text-muted hover:text-text-primary">
        <X size={13} />
      </button>
    </form>
  )
}

interface FolderTreeItemProps extends TreeActions {
  node: FolderNode
  depth: number
  selectedId: string | null
  onSelect: (id: string) => void
}

function FolderTreeItem({ node, depth, selectedId, onSelect, onAddFolder, onRenameFolder, onRequestDelete }: FolderTreeItemProps) {
  const [expanded, setExpanded] = useState(depth === 0)
  const [adding, setAdding] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const hasChildren = !!node.children?.length
  const isSelected = selectedId === node.id

  if (renaming) {
    return (
      <div>
        <InlineTextForm
          depth={depth}
          initialValue={node.name}
          onCancel={() => setRenaming(false)}
          onSubmit={(name) => {
            onRenameFolder(node.id, name)
            setRenaming(false)
          }}
        />
        {hasChildren && expanded && (
          <div>
            {node.children!.map((child) => (
              <FolderTreeItem
                key={child.id}
                node={child}
                depth={depth + 1}
                selectedId={selectedId}
                onSelect={onSelect}
                onAddFolder={onAddFolder}
                onRenameFolder={onRenameFolder}
                onRequestDelete={onRequestDelete}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div
        className={cn(
          'group flex items-center rounded-md pr-1 transition-colors',
          isSelected ? 'bg-primary/10' : 'hover:bg-surface-hover',
        )}
      >
        <button
          type="button"
          onClick={() => {
            onSelect(node.id)
            if (hasChildren) setExpanded((v) => !v)
          }}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
          className={cn(
            'flex min-w-0 flex-1 items-center gap-1.5 py-2 text-left text-sm',
            isSelected ? 'font-medium text-primary' : 'text-text-secondary group-hover:text-text-primary',
          )}
        >
          {hasChildren ? (
            <ChevronRight size={14} className={cn('shrink-0 transition-transform', expanded && 'rotate-90')} />
          ) : (
            <span className="w-[14px] shrink-0" />
          )}
          {isSelected ? <FolderOpen size={15} className="shrink-0" /> : <Folder size={15} className="shrink-0" />}
          <span className="truncate">{node.name}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setExpanded(true)
            setAdding(true)
          }}
          aria-label={`Nova subpasta em ${node.name}`}
          className="shrink-0 rounded p-1 text-text-muted opacity-0 hover:text-primary group-hover:opacity-100"
        >
          <Plus size={13} />
        </button>
        <button
          type="button"
          onClick={() => setRenaming(true)}
          aria-label={`Renomear ${node.name}`}
          className="shrink-0 rounded p-1 text-text-muted opacity-0 hover:text-primary group-hover:opacity-100"
        >
          <Pencil size={13} />
        </button>
        <button
          type="button"
          onClick={() => onRequestDelete(node.id, node.name)}
          aria-label={`Excluir ${node.name}`}
          className="shrink-0 rounded p-1 text-text-muted opacity-0 hover:text-error group-hover:opacity-100"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {adding && (
        <InlineTextForm
          depth={depth + 1}
          onCancel={() => setAdding(false)}
          onSubmit={(name) => {
            onAddFolder(node.id, name)
            setAdding(false)
          }}
        />
      )}

      {hasChildren && expanded && (
        <div>
          {node.children!.map((child) => (
            <FolderTreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onAddFolder={onAddFolder}
              onRenameFolder={onRenameFolder}
              onRequestDelete={onRequestDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface FolderTreeProps extends TreeActions {
  nodes: FolderNode[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onAddCategory: (name: string) => void
}

export function FolderTree({ nodes, selectedId, onSelect, onAddCategory, onAddFolder, onRenameFolder, onRequestDelete }: FolderTreeProps) {
  const [addingCategory, setAddingCategory] = useState(false)

  return (
    <div>
      <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Categorias</p>

      <nav className="space-y-0.5">
        <div
          className={cn(
            'group flex items-center rounded-md pr-1 transition-colors',
            selectedId === null ? 'bg-primary/10' : 'hover:bg-surface-hover',
          )}
        >
          <button
            type="button"
            onClick={() => onSelect(null)}
            className={cn(
              'flex min-w-0 flex-1 items-center rounded-md px-3 py-2 text-left text-sm font-medium',
              selectedId === null ? 'text-primary' : 'text-text-secondary group-hover:text-text-primary',
            )}
          >
            Todos os documentos
          </button>
          <button
            type="button"
            onClick={() => setAddingCategory(true)}
            aria-label="Nova categoria"
            className="shrink-0 rounded p-1 text-text-muted opacity-0 hover:text-primary group-hover:opacity-100"
          >
            <Plus size={13} />
          </button>
        </div>

        {addingCategory && (
          <InlineTextForm
            depth={0}
            placeholder="Nome da categoria"
            onCancel={() => setAddingCategory(false)}
            onSubmit={(name) => {
              onAddCategory(name)
              setAddingCategory(false)
            }}
          />
        )}

        {nodes.map((node) => (
          <FolderTreeItem
            key={node.id}
            node={node}
            depth={0}
            selectedId={selectedId}
            onSelect={onSelect}
            onAddFolder={onAddFolder}
            onRenameFolder={onRenameFolder}
            onRequestDelete={onRequestDelete}
          />
        ))}
      </nav>
    </div>
  )
}
