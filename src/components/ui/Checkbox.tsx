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
              'peer h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-sm border border-border-strong bg-surface-card transition-all duration-150 active:scale-90',
              'checked:border-primary checked:bg-primary',
              'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/30',
              className,
            )}
            {...props}
          />
          <Check
            size={12}
            strokeWidth={3}
            className="pointer-events-none absolute scale-0 text-primary-foreground opacity-0 transition-none peer-checked:scale-100 peer-checked:opacity-100 peer-checked:[animation:check-pop_0.35s_cubic-bezier(0.34,1.56,0.64,1)]"
          />
        </span>
        {label}
      </label>
    )
  },
)

Checkbox.displayName = 'Checkbox'
