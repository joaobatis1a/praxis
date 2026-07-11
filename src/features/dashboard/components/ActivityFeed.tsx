import { FileText, GraduationCap, ListChecks, UserPlus, type LucideIcon } from 'lucide-react'
import { Card } from '../../../components/ui'

type ActivityType = 'document' | 'training' | 'user' | 'procedure'

interface Activity {
  id: string
  type: ActivityType
  description: string
  time: string
}

const iconByType: Record<ActivityType, LucideIcon> = {
  document: FileText,
  training: GraduationCap,
  user: UserPlus,
  procedure: ListChecks,
}

export function ActivityFeed({ activity }: { activity: Activity[] }) {
  return (
    <Card>
      <h3 className="text-base font-semibold text-text-primary">Últimas atividades</h3>
      <ul className="mt-4 space-y-4">
        {activity.map((item) => {
          const Icon = iconByType[item.type]
          return (
            <li key={item.id} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-text-secondary">
                <Icon size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-text-secondary">{item.description}</p>
                <p className="mt-0.5 text-xs text-text-muted">{item.time}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
