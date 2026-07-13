import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/cn'
import { staggerContainer, staggerItem } from '../../lib/motionVariants'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  className?: string
  triggerClassName?: string
  'aria-label'?: string
}

interface Position {
  left: number
  width: number
  openUpward: boolean
  top: number
}

const LIST_MAX_HEIGHT = 240
const GAP = 6

export function Select({ value, onChange, options, className, triggerClassName, ...rest }: SelectProps) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<Position | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const selected = options.find((o) => o.value === value)

  function computePosition() {
    const trigger = triggerRef.current
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    const openUpward = spaceBelow < LIST_MAX_HEIGHT && spaceAbove > spaceBelow
    setPosition({
      left: rect.left,
      width: rect.width,
      openUpward,
      top: openUpward ? rect.top - GAP : rect.bottom + GAP,
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
    function onViewportChange() {
      setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('scroll', onViewportChange, true)
    window.addEventListener('resize', onViewportChange)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', onViewportChange, true)
      window.removeEventListener('resize', onViewportChange)
    }
  }, [open])

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <motion.button
        ref={triggerRef}
        type="button"
        onClick={toggleOpen}
        whileTap={{ scale: 0.97 }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={rest['aria-label']}
        className={cn(
          'flex h-10 items-center gap-2 rounded-md border border-border bg-surface-card px-3 text-sm text-text-primary transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20',
          open && 'border-primary ring-3 ring-primary/20',
          triggerClassName,
        )}
      >
        <span className="truncate">{selected?.label ?? 'Selecionar'}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 24 }}
          className="ml-auto shrink-0 text-text-muted"
        >
          <ChevronDown size={15} />
        </motion.span>
      </motion.button>

      {createPortal(
        <AnimatePresence>
          {open && position && (
            <motion.ul
              ref={listRef}
              role="listbox"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, scale: 0.95, y: -6, transition: { duration: 0.12 } }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              style={{
                position: 'fixed',
                left: position.left,
                width: position.width,
                maxHeight: LIST_MAX_HEIGHT,
                ...(position.openUpward ? { bottom: window.innerHeight - position.top } : { top: position.top }),
              }}
              className="z-50 overflow-y-auto rounded-md border border-border bg-surface-card p-1 shadow-[var(--shadow-level-2)]"
            >
              {options.map((option) => {
                const isSelected = option.value === value
                return (
                  <motion.li key={option.value} variants={staggerItem} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(option.value)
                        setOpen(false)
                      }}
                      className={cn(
                        'flex w-full items-center gap-2 whitespace-nowrap rounded-sm px-2.5 py-2 text-left text-sm transition-colors',
                        isSelected ? 'text-primary' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
                      )}
                    >
                      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                        {isSelected && (
                          <motion.span
                            initial={{ scale: 0, rotate: -30 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                          >
                            <Check size={13} strokeWidth={3} />
                          </motion.span>
                        )}
                      </span>
                      <span className="truncate">{option.label}</span>
                    </button>
                  </motion.li>
                )
              })}
            </motion.ul>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  )
}
