import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, ClipboardCheck, TrendingUp, Users } from 'lucide-react'
import { getAdminDashboard } from './api'
import { StatCard } from './components/StatCard'
import { ProgressChart } from './components/ProgressChart'
import { ActivityFeed } from './components/ActivityFeed'
import { useAuth } from '../auth/AuthContext'
import { Skeleton } from '../../components/ui'
import { staggerContainer, staggerItem } from '../../lib/motionVariants'

type DashboardData = Awaited<ReturnType<typeof getAdminDashboard>>

export function AdminDashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    getAdminDashboard().then(setData)
  }, [])

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-text-primary"
      >
        Olá, {user?.name.split(' ')[0]}
      </motion.h1>
      <p className="mt-1 text-sm text-text-muted">Aqui está um resumo da sua empresa hoje.</p>

      {!data ? (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </>
      ) : (
        <>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <motion.div variants={staggerItem}>
              <StatCard
                label="Colaboradores cadastrados"
                value={data.stats.colaboradores.value}
                change={data.stats.colaboradores.change}
                icon={Users}
              />
            </motion.div>
            <motion.div variants={staggerItem}>
              <StatCard
                label="Procedimentos concluídos"
                value={data.stats.procedimentosConcluidos.value}
                change={data.stats.procedimentosConcluidos.change}
                icon={ClipboardCheck}
              />
            </motion.div>
            <motion.div variants={staggerItem}>
              <StatCard
                label="Documentos publicados"
                value={data.stats.documentosPublicados.value}
                change={data.stats.documentosPublicados.change}
                icon={BookOpen}
              />
            </motion.div>
            <motion.div variants={staggerItem}>
              <StatCard
                label="Progresso médio"
                value={data.stats.progressoMedio.value}
                suffix="%"
                change={data.stats.progressoMedio.change}
                icon={TrendingUp}
              />
            </motion.div>
          </motion.div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <ProgressChart data={data.progressHistory} />
            <ActivityFeed activity={data.activity} />
          </div>
        </>
      )}
    </div>
  )
}
