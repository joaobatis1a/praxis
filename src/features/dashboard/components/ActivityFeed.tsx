import { FileText, ListChecks, UserPlus, type LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '../../../components/ui'
import { staggerContainer, staggerItem } from '../../../lib/motionVariants'

type ActivityType = 'document' | 'user' | 'procedure'

interface Activity {
  id: string
  type: ActivityType
  description: string
  time: string
}

const iconByType: Record<ActivityType, LucideIcon> = {
  document: FileText,
  user: UserPlus,
  procedure: ListChecks,
}

export function ActivityFeed({ activity }: { activity: Activity[] }) {
  return (
    <Card>
      <h3 className="text-base font-semibold text-text-primary">Últimas atividades</h3>
      <motion.ul variants={staggerContainer} initial="hidden" animate="show" className="mt-4 space-y-1">
        {activity.map((item) => {
          const Icon = iconByType[item.type]
          return (
            <motion.li
              key={item.id}
              variants={staggerItem}
              whileHover={{ x: 4 }}
              className="flex items-start gap-3 rounded-md p-1.5 transition-colors hover:bg-surface-hover"
            >
              <motion.div
                whileHover={{ rotate: -8, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-text-secondary"
              >
                <Icon size={15} />
              </motion.div>
              <div className="min-w-0">
                <p className="text-sm text-text-secondary">{item.description}</p>
                <p className="mt-0.5 text-xs text-text-muted">{item.time}</p>
              </div>
            </motion.li>
          )
        })}
      </motion.ul>
    </Card>
  )
}
