import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { AnimatedNumber, Card } from '../../../components/ui'

export interface StatCardProps {
  label: string
  value: number
  suffix?: string
  change?: number
  icon: LucideIcon
}

export function StatCard({ label, value, suffix, change, icon: Icon }: StatCardProps) {
  return (
    <Card className="group overflow-hidden">
      <div className="flex items-start justify-between">
        <motion.div
          initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 380, damping: 18 }}
          className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary transition-transform duration-300 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-hover:rotate-6"
        >
          <Icon size={20} />
        </motion.div>
        {typeof change === 'number' && (
          <motion.span
            initial={{ opacity: 0, x: 10, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.25, type: 'spring', stiffness: 400, damping: 20 }}
            className="flex items-center gap-1 rounded-full bg-success-bg px-2 py-0.5 text-xs font-semibold text-success-foreground"
          >
            <TrendingUp size={12} />+{change}%
          </motion.span>
        )}
      </div>
      <p className="mt-4 text-3xl font-bold text-text-primary">
        <AnimatedNumber value={value} suffix={suffix} />
      </p>
      <p className="mt-1 text-sm text-text-muted">{label}</p>
    </Card>
  )
}
