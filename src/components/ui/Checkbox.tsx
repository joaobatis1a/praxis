import { forwardRef, useId, type InputHTMLAttributes } from 'react'
import { Check } from 'lucide-react'
import { cn } from '../../lib/cn'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id ?? generatedId

    return (
      <label htmlFor={inputId} className="inline-flex items-center gap-2 text-sm text-text-secondary">
        <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className={cn(
              'peer h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-sm border border-border-strong bg-surface-card transition-colors',
              'checked:border-primary checked:bg-primary',
              'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/30',
              className,
            )}
            {...props}
          />
          <Check
            size={12}
            strokeWidth={3}
            className="pointer-events-none absolute text-primary-foreground opacity-0 peer-checked:opacity-100"
          />
        </span>
        {label}
      </label>
    )
  },
)

Checkbox.displayName = 'Checkbox'
