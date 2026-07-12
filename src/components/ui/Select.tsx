import { useEffect, useRef, useState } from 'react'
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

export function Select({ value, onChange, options, className, triggerClassName, ...rest }: SelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
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

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, scale: 0.95, y: -6, transition: { duration: 0.12 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className="absolute left-0 top-[calc(100%+6px)] z-20 min-w-full overflow-hidden rounded-md border border-border bg-surface-card p-1 shadow-[var(--shadow-level-2)]"
          >
            {options.map((option) => {
              const isSelected = option.value === value
              return (
                <motion.li
                  key={option.value}
                  variants={staggerItem}
                  role="option"
                  aria-selected={isSelected}
                >
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
      </AnimatePresence>
    </div>
  )
}
