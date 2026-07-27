import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/cn'

// A lighter, dropdown-scoped entrance than the shared grid staggerContainer/staggerItem
// (src/lib/motionVariants.ts) — that pair moves each item in from y:24/scale:0.94 with a
// bouncy spring, which is right for a page of cards but reads as a misaligned/glitchy
// dropdown when applied to a small 2-3 item option list: each row visibly slides up and
// overshoots into place right after opening. Options just fade in, in place, instead.
const optionListVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.025 } },
}
const optionItemVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.1 } },
}

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
  maxHeight: number
}

const LIST_MAX_HEIGHT = 240
const MIN_LIST_HEIGHT = 160
const GAP = 6
const VIEWPORT_MARGIN = 12

export function Select({ value, onChange, options, className, triggerClassName, ...rest }: SelectProps) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<Position | null>(null)
  const [minTriggerWidth, setMinTriggerWidth] = useState<number>()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value)

  // The trigger button otherwise sizes itself to whichever option's label is currently selected —
  // pick a short one ("Gestor") and it shrinks, then the dropdown (which copies the trigger's
  // width) is too narrow for longer labels the next time it opens, clipping them. Measure every
  // option's rendered width once and lock the trigger to the widest, so it stays one fixed size
  // no matter what's selected.
  useLayoutEffect(() => {
    const container = measureRef.current
    if (!container) return
    let max = 0
    for (const child of Array.from(container.children)) {
      max = Math.max(max, (child as HTMLElement).offsetWidth)
    }
    setMinTriggerWidth(max > 0 ? max + 56 : undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.map((o) => o.label).join('|')])

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
      // scrolling the open option list itself shouldn't close it — only scrolling
      // something behind/outside it (which would leave the list floating in the wrong spot)
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

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <div ref={measureRef} aria-hidden className="pointer-events-none absolute -z-10 opacity-0" style={{ whiteSpace: 'nowrap', top: -9999, left: -9999 }}>
        {options.map((option) => (
          <div key={option.value} className="text-sm">
            {option.label}
          </div>
        ))}
      </div>
      <motion.button
        ref={triggerRef}
        type="button"
        onClick={toggleOpen}
        whileTap={{ scale: 0.97 }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={rest['aria-label']}
        style={minTriggerWidth ? { minWidth: minTriggerWidth } : undefined}
        className={cn(
          'flex h-10 items-center gap-2 rounded-md border border-border bg-surface-card px-3 text-sm text-text-primary transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20',
          open && 'border-primary ring-3 ring-primary/20',
          triggerClassName,
        )}
      >
        <span>{selected?.label ?? 'Selecionar'}</span>
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
              variants={optionListVariants}
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
              {options.map((option) => {
                const isSelected = option.value === value
                return (
                  <motion.li key={option.value} variants={optionItemVariants} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(option.value)
                        setOpen(false)
                      }}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-left text-sm transition-colors',
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
                      <span>{option.label}</span>
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
