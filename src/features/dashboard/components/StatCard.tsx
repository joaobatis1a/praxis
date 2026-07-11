import type { LucideIcon } from 'lucide-react'
import { TrendingUp } from 'lucide-react'
import { Card } from '../../../components/ui'

export interface StatCardProps {
  label: string
  value: string
  change?: number
  icon: LucideIcon
}

export function StatCard({ label, value, change, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon size={20} />
        </div>
        {typeof change === 'number' && (
          <span className="flex items-center gap-1 rounded-full bg-success-bg px-2 py-0.5 text-xs font-semibold text-success-foreground">
            <TrendingUp size={12} />+{change}%
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-bold text-text-primary">{value}</p>
      <p className="mt-1 text-sm text-text-muted">{label}</p>
    </Card>
  )
}
