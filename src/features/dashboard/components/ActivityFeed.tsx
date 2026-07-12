import { useState } from 'react'
import { FileText, ListChecks, UserPlus, type LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, Modal } from '../../../components/ui'
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

const VISIBLE_COUNT = 8

function ActivityList({ activity }: { activity: Activity[] }) {
  return (
    <motion.ul variants={staggerContainer} initial="hidden" animate="show" className="space-y-1">
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
  )
}

export function ActivityFeed({ activity }: { activity: Activity[] }) {
  const [showAll, setShowAll] = useState(false)
  const visible = activity.slice(0, VISIBLE_COUNT)

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-text-primary">Últimas atividades</h3>
        {activity.length > VISIBLE_COUNT && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="text-xs font-medium text-primary hover:underline"
          >
            Ver todas ({activity.length})
          </button>
        )}
      </div>
      <div className="mt-4">
        <ActivityList activity={visible} />
      </div>

      <Modal open={showAll} onClose={() => setShowAll(false)} title="Todas as atividades" className="max-w-lg">
        <ActivityList activity={activity} />
      </Modal>
    </Card>
  )
}
