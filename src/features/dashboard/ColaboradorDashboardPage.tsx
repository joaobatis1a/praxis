import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Bookmark, CheckCircle2, ClipboardList } from 'lucide-react'
import { formatRelativeTime, getColaboradorDashboard } from './api'
import { CircularProgress } from './components/CircularProgress'
import { Card, Skeleton } from '../../components/ui'
import { staggerContainer, staggerItem } from '../../lib/motionVariants'
import { useAuth } from '../auth/AuthContext'

type DashboardData = Awaited<ReturnType<typeof getColaboradorDashboard>>

export function ColaboradorDashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    if (user) getColaboradorDashboard(user.id).then(setData)
  }, [user])

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-text-primary"
      >
        Olá, {user?.name.split(' ')[0]} 👋
      </motion.h1>
      <p className="mt-1 text-sm text-text-muted">Continue de onde você parou.</p>

      {!data ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0 space-y-6">
            <Skeleton className="h-56" />
            <Skeleton className="h-48" />
          </div>
          <div className="min-w-0 space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-40" />
          </div>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]"
        >
          <div className="min-w-0 space-y-6">
            <motion.div variants={staggerItem}>
              <Card>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-primary" />
                  <h3 className="text-base font-semibold text-text-primary">Procedimentos concluídos</h3>
                </div>
                {data.completions.length === 0 ? (
                  <p className="mt-4 text-sm text-text-muted">Você ainda não concluiu nenhum procedimento.</p>
                ) : (
                  <ul className="mt-4 divide-y divide-border">
                    {data.completions.map((c) => (
                      <motion.li
                        key={c.id}
                        whileHover={{ x: 4 }}
                        className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                      >
                        <span className="text-sm text-text-secondary">{c.procedureTitle}</span>
                        <span className="text-xs text-text-muted">{formatRelativeTime(c.completedAt)}</span>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card>
                <div className="flex items-center gap-2">
                  <ClipboardList size={18} className="text-primary" />
                  <h3 className="text-base font-semibold text-text-primary">Procedimentos recentes</h3>
                </div>
                <ul className="mt-4 divide-y divide-border">
                  {data.procedures.map((proc) => (
                    <motion.li
                      key={proc.id}
                      whileHover={{ x: 4 }}
                      className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                    >
                      <span className="text-sm text-text-secondary">{proc.title}</span>
                      <span className="text-xs text-text-muted">{proc.updated}</span>
                    </motion.li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          </div>

          <div className="min-w-0 space-y-6">
            <motion.div variants={staggerItem}>
              <Card className="flex flex-col items-center text-center">
                <p className="text-sm font-medium text-text-secondary">Sua evolução geral</p>
                <div className="mt-4">
                  <CircularProgress value={data.overallProgress} />
                </div>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card>
                <div className="flex items-center gap-2">
                  <Bookmark size={18} className="text-primary" />
                  <h3 className="text-base font-semibold text-text-primary">Documentos favoritos</h3>
                </div>
                <ul className="mt-4 space-y-2.5">
                  {data.favorites.map((doc) => (
                    <motion.li
                      key={doc.id}
                      whileHover={{ x: 4 }}
                      className="text-sm text-text-secondary hover:text-primary"
                    >
                      {doc.title}
                    </motion.li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
