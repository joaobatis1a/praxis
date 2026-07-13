import { Megaphone } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card } from '../../../components/ui'
import { staggerContainer, staggerItem } from '../../../lib/motionVariants'

export interface RecentNotice {
  id: string
  description: string
  authorName: string
  recipientLabel: string
  time: string
}

export function RecentNoticesCard({ notices }: { notices: RecentNotice[] }) {
  const navigate = useNavigate()

  return (
    <Card className="min-w-0">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-text-primary">Avisos recentes</h3>
        <button type="button" onClick={() => navigate('/avisos')} className="text-xs font-medium text-primary hover:underline">
          Ver todos
        </button>
      </div>
      {notices.length === 0 ? (
        <p className="mt-4 text-sm text-text-muted">Nenhum aviso registrado ainda.</p>
      ) : (
        <motion.ul variants={staggerContainer} initial="hidden" animate="show" className="mt-4 space-y-1">
          {notices.map((n) => (
            <motion.li
              key={n.id}
              variants={staggerItem}
              whileHover={{ x: 4 }}
              className="flex items-start gap-3 rounded-md p-1.5 transition-colors hover:bg-surface-hover"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-text-secondary">
                <Megaphone size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-text-secondary">{n.description}</p>
                <p className="mt-0.5 truncate text-xs text-text-muted">
                  {n.authorName} → {n.recipientLabel} · {n.time}
                </p>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </Card>
  )
}
