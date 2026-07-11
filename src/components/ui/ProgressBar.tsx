import { cn } from '../../lib/cn'

export interface ProgressBarProps {
  value: number
  className?: string
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-surface', className)}
    >
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
