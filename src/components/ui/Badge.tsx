import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-semibold',
  {
    variants: {
      variant: {
        neutral: 'bg-surface text-text-secondary border border-border',
        primary: 'bg-primary/10 text-primary',
        success: 'bg-success-bg text-success-foreground',
        warning: 'bg-warning-bg text-warning-foreground',
        error: 'bg-error-bg text-error-foreground',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
)

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
