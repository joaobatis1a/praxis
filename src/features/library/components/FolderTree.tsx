import { useState, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, Folder, FolderOpen, Pencil, Plus, Trash2, X } from 'lucide-react'
import { cn } from '../../../lib/cn'
import type { FolderNode } from '../../../mocks/library'

interface TreeActions {
  onAddFolder: (parentId: string, name: string) => void
  onRenameFolder: (id: string, name: string) => void
  onRequestDelete: (id: string, name: string) => void
}

const actionButtonClass =
  'shrink-0 rounded p-1 text-text-muted opacity-0 transition-colors hover:text-primary group-hover:opacity-100'

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
    <motion.form
      initial={{ opacity: 0, height: 0, scale: 0.96 }}
      animate={{ opacity: 1, height: 'auto', scale: 1 }}
      exit={{ opacity: 0, height: 0, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
      onSubmit={handleSubmit}
      style={{ paddingLeft: `${depth * 16 + 12}px` }}
      className="flex items-center gap-1 overflow-hidden py-1 pr-2"
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
    </motion.form>
  )
}

function AnimatedChildren({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      className="overflow-hidden"
    >
      {children}
    </motion.div>
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
        <AnimatePresence initial={false}>
          {hasChildren && expanded && (
            <AnimatedChildren>
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
            </AnimatedChildren>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div>
      <div
        className={cn(
          'group relative flex items-center rounded-md pr-1',
          isSelected ? 'text-primary' : 'hover:bg-surface-hover',
        )}
      >
        {isSelected && (
          <motion.div
            layoutId="folder-highlight"
            transition={{ type: 'spring', stiffness: 500, damping: 38 }}
            className="absolute inset-0 rounded-md bg-primary/10"
          />
        )}
        <button
          type="button"
          onClick={() => {
            onSelect(node.id)
            if (hasChildren) setExpanded((v) => !v)
          }}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
          className={cn(
            'relative flex min-w-0 flex-1 items-center gap-1.5 py-2 text-left text-sm',
            isSelected ? 'font-medium text-primary' : 'text-text-secondary group-hover:text-text-primary',
          )}
        >
          {hasChildren ? (
            <motion.span
              animate={{ rotate: expanded ? 90 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="shrink-0"
            >
              <ChevronRight size={14} />
            </motion.span>
          ) : (
            <span className="w-[14px] shrink-0" />
          )}
          <motion.span
            key={isSelected ? 'open' : 'closed'}
            initial={{ scale: 0.6, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 480, damping: 20 }}
            className="shrink-0"
          >
            {isSelected ? <FolderOpen size={15} /> : <Folder size={15} />}
          </motion.span>
          <span>{node.name}</span>
        </button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          onClick={() => {
            setExpanded(true)
            setAdding(true)
          }}
          aria-label={`Nova subpasta em ${node.name}`}
          className={cn('relative', actionButtonClass)}
        >
          <Plus size={13} />
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          onClick={() => setRenaming(true)}
          aria-label={`Renomear ${node.name}`}
          className={cn('relative', actionButtonClass)}
        >
          <Pencil size={13} />
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          onClick={() => onRequestDelete(node.id, node.name)}
          aria-label={`Excluir ${node.name}`}
          className={cn('relative hover:text-error', actionButtonClass)}
        >
          <Trash2 size={13} />
        </motion.button>
      </div>

      <AnimatePresence initial={false}>{adding && (
        <InlineTextForm
          depth={depth + 1}
          onCancel={() => setAdding(false)}
          onSubmit={(name) => {
            onAddFolder(node.id, name)
            setAdding(false)
          }}
        />
      )}</AnimatePresence>

      <AnimatePresence initial={false}>
        {hasChildren && expanded && (
          <AnimatedChildren>
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
          </AnimatedChildren>
        )}
      </AnimatePresence>
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
            'group relative flex items-center rounded-md pr-1',
            selectedId === null ? 'text-primary' : 'hover:bg-surface-hover',
          )}
        >
          {selectedId === null && (
            <motion.div
              layoutId="folder-highlight"
              transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              className="absolute inset-0 rounded-md bg-primary/10"
            />
          )}
          <button
            type="button"
            onClick={() => onSelect(null)}
            className={cn(
              'relative flex min-w-0 flex-1 items-center rounded-md px-3 py-2 text-left text-sm font-medium',
              selectedId === null ? 'text-primary' : 'text-text-secondary group-hover:text-text-primary',
            )}
          >
            Todos os documentos
          </button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            onClick={() => setAddingCategory(true)}
            aria-label="Nova categoria"
            className={cn('relative', actionButtonClass)}
          >
            <Plus size={13} />
          </motion.button>
        </div>

        <AnimatePresence initial={false}>
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
        </AnimatePresence>

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
