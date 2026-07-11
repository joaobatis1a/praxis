import { forwardRef, useId, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id ?? generatedId

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          className={cn(
            'h-10 rounded-md border border-border-strong bg-surface-card px-3 text-sm text-text-primary placeholder:text-text-muted transition-colors',
            'focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-error focus:border-error focus:ring-error/20',
            className,
          )}
          {...props}
        />
        {error ? (
          <span className="text-xs text-error">{error}</span>
        ) : hint ? (
          <span className="text-xs text-text-muted">{hint}</span>
        ) : null}
      </div>
    )
  },
)

Input.displayName = 'Input'
