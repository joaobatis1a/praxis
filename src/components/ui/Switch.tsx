import { forwardRef, useId, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(({ className, label, id, ...props }, ref) => {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <label htmlFor={inputId} className="inline-flex items-center gap-2.5 text-sm text-text-secondary">
      <span className="relative inline-flex h-5 w-9 shrink-0 items-center">
        <input ref={ref} id={inputId} type="checkbox" className="peer sr-only" {...props} />
        <span
          className={cn(
            'h-5 w-9 rounded-full bg-surface-hover ring-1 ring-inset ring-border transition-colors',
            'peer-checked:bg-primary peer-checked:ring-primary',
            'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary/50',
            'peer-disabled:opacity-50',
            className,
          )}
        />
        <span className="pointer-events-none absolute left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-300 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] peer-checked:translate-x-4" />
      </span>
      {label}
    </label>
  )
})

Switch.displayName = 'Switch'
