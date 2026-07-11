import { useEffect, useState } from 'react'
import { BookOpen, GraduationCap, TrendingUp, Users } from 'lucide-react'
import { getAdminDashboard } from './api'
import { StatCard } from './components/StatCard'
import { ProgressChart } from './components/ProgressChart'
import { ActivityFeed } from './components/ActivityFeed'
import { useAuth } from '../auth/AuthContext'

type DashboardData = Awaited<ReturnType<typeof getAdminDashboard>>

export function AdminDashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    getAdminDashboard().then(setData)
  }, [])

  if (!data) return null

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-text-primary">Olá, {user?.name.split(' ')[0]}</h1>
      <p className="mt-1 text-sm text-text-muted">Aqui está um resumo da sua empresa hoje.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Colaboradores cadastrados"
          value={String(data.stats.colaboradores.value)}
          change={data.stats.colaboradores.change}
          icon={Users}
        />
        <StatCard
          label="Treinamentos ativos"
          value={String(data.stats.treinamentosAtivos.value)}
          change={data.stats.treinamentosAtivos.change}
          icon={GraduationCap}
        />
        <StatCard
          label="Documentos publicados"
          value={String(data.stats.documentosPublicados.value)}
          change={data.stats.documentosPublicados.change}
          icon={BookOpen}
        />
        <StatCard
          label="Progresso médio"
          value={`${data.stats.progressoMedio.value}%`}
          change={data.stats.progressoMedio.change}
          icon={TrendingUp}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <ProgressChart data={data.progressHistory} />
        <ActivityFeed activity={data.activity} />
      </div>
    </div>
  )
}
