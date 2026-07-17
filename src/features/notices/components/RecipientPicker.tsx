import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Building2, Check, ChevronDown, User, X } from 'lucide-react'
import { cn } from '../../../lib/cn'
import { staggerContainer, staggerItem } from '../../../lib/motionVariants'
import type { TeamMember } from '../../../mocks/teamMembers'

export interface Recipient {
  type: 'user' | 'department'
  id: string
  label: string
  /** department, shown alongside the name in the picker's chip — not persisted with the notice */
  sublabel?: string
}

interface RecipientPickerProps {
  members: TeamMember[]
  departments: string[]
  value: Recipient[]
  onChange: (value: Recipient[]) => void
}

interface Position {
  left: number
  width: number
  openUpward: boolean
  top: number
  maxHeight: number
}

const LIST_MAX_HEIGHT = 260
const MIN_LIST_HEIGHT = 160
const GAP = 6
const VIEWPORT_MARGIN = 12

export function RecipientPicker({ members, departments, value, onChange }: RecipientPickerProps) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<Position | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  function computePosition() {
    const trigger = triggerRef.current
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    const openUpward = spaceBelow < LIST_MAX_HEIGHT && spaceAbove > spaceBelow
    const available = (openUpward ? spaceAbove : spaceBelow) - GAP - VIEWPORT_MARGIN
    setPosition({
      left: rect.left,
      width: rect.width,
      openUpward,
      top: openUpward ? rect.top - GAP : rect.bottom + GAP,
      maxHeight: Math.max(MIN_LIST_HEIGHT, Math.min(LIST_MAX_HEIGHT, available)),
    })
  }

  function toggleOpen() {
    setOpen((v) => {
      const next = !v
      if (next) computePosition()
      return next
    })
  }

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node
      if (rootRef.current?.contains(target) || listRef.current?.contains(target)) return
      setOpen(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    function onScroll(e: Event) {
      const target = e.target as Node
      if (listRef.current?.contains(target)) return
      setOpen(false)
    }
    function onResize() {
      setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  function isSelected(type: Recipient['type'], id: string) {
    return value.some((r) => r.type === type && r.id === id)
  }

  function toggle(r: Recipient) {
    if (isSelected(r.type, r.id)) onChange(value.filter((v) => !(v.type === r.type && v.id === r.id)))
    else onChange([...value, r])
  }

  function remove(r: Recipient) {
    onChange(value.filter((v) => !(v.type === r.type && v.id === r.id)))
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        ref={triggerRef}
        onClick={toggleOpen}
        className="flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-border bg-surface-card px-3 py-2 text-left text-sm transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
      >
        {value.length === 0 && <span className="text-text-muted">Selecionar destinatários</span>}
        {value.map((r) => (
          <span
            key={`${r.type}-${r.id}`}
            onClick={(e) => {
              e.stopPropagation()
              remove(r)
            }}
            className="inline-flex items-center gap-1 rounded-sm bg-primary/10 py-0.5 pl-2 pr-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
          >
            {r.type === 'user' ? <User size={11} /> : <Building2 size={11} />}
            {r.label}
            {r.sublabel && <span className="text-primary/70">· {r.sublabel}</span>}
            <X size={11} className="ml-0.5" />
          </span>
        ))}
        <ChevronDown size={15} className={cn('ml-auto shrink-0 text-text-muted transition-transform', open && 'rotate-180')} />
      </button>

      {createPortal(
        <AnimatePresence>
          {open && position && (
            <motion.div
              ref={listRef}
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, scale: 0.95, y: -6, transition: { duration: 0.12 } }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              style={{
                position: 'fixed',
                left: position.left,
                width: position.width,
                maxHeight: position.maxHeight,
                ...(position.openUpward ? { bottom: window.innerHeight - position.top } : { top: position.top }),
              }}
              className="z-50 overflow-y-auto rounded-md border border-border bg-surface-card p-1 shadow-[var(--shadow-level-2)]"
            >
              <div className="pb-1">
                <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Pessoas</p>
                {members.map((m) => {
                  const selected = isSelected('user', m.id)
                  return (
                    <motion.button
                      key={m.id}
                      type="button"
                      variants={staggerItem}
                      onClick={() => toggle({ type: 'user', id: m.id, label: m.name, sublabel: m.department })}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-left text-sm transition-colors',
                        selected ? 'text-primary' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
                      )}
                    >
                      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                        {selected && <Check size={13} strokeWidth={3} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate">{m.name}</p>
                        <p className="truncate text-xs text-text-muted">{m.department}</p>
                      </div>
                    </motion.button>
                  )
                })}
                {members.length === 0 && <p className="px-2.5 py-2 text-xs text-text-muted">Nenhum colaborador.</p>}
              </div>

              {departments.length > 0 && (
                <div>
                  <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Setores</p>
                  {departments.map((dept) => {
                    const selected = isSelected('department', dept)
                    return (
                      <motion.button
                        key={dept}
                        type="button"
                        variants={staggerItem}
                        onClick={() => toggle({ type: 'department', id: dept, label: dept })}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-left text-sm transition-colors',
                          selected ? 'text-primary' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
                        )}
                      >
                        <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                          {selected && <Check size={13} strokeWidth={3} />}
                        </span>
                        <Building2 size={13} className="shrink-0 text-text-muted" />
                        <span className="truncate">{dept}</span>
                      </motion.button>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  )
}
