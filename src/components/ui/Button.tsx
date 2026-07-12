import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn'

export const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold transition-all duration-200 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.93] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0 disabled:active:scale-100',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-primary-hover hover:shadow-[0_10px_24px_-6px_var(--color-primary)]',
        secondary:
          'bg-transparent text-text-primary border border-border-strong hover:bg-surface-hover hover:border-text-muted hover:shadow-[0_8px_16px_-8px_rgba(0,0,0,0.25)]',
        ghost: 'bg-transparent text-text-secondary hover:bg-surface-hover',
        destructive:
          'bg-error text-on-error shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:opacity-90 hover:shadow-[0_10px_24px_-6px_var(--color-error)]',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
    )
  },
)

Button.displayName = 'Button'
