import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  endAdornment?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, id, endAdornment, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id ?? generatedId

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            className={cn(
              'h-10 w-full rounded-md border border-border-strong bg-surface-card px-3 text-sm text-text-primary placeholder:text-text-muted transition-colors',
              'focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20',
              'disabled:cursor-not-allowed disabled:opacity-50',
              endAdornment && 'pr-10',
              error && 'border-error focus:border-error focus:ring-error/20',
              className,
            )}
            {...props}
          />
          {endAdornment && (
            <div className="absolute right-1 top-1/2 -translate-y-1/2">{endAdornment}</div>
          )}
        </div>
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
