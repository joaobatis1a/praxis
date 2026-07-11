import { useEffect, useState } from 'react'
import { Bookmark, CalendarClock, ClipboardList, PlayCircle } from 'lucide-react'
import { getColaboradorDashboard } from './api'
import { CircularProgress } from './components/CircularProgress'
import { Badge, Card, ProgressBar } from '../../components/ui'
import { useAuth } from '../auth/AuthContext'

type DashboardData = Awaited<ReturnType<typeof getColaboradorDashboard>>

export function ColaboradorDashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    getColaboradorDashboard().then(setData)
  }, [])

  if (!data) return null

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-text-primary">Olá, {user?.name.split(' ')[0]} 👋</h1>
      <p className="mt-1 text-sm text-text-muted">Continue de onde você parou.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-2">
              <PlayCircle size={18} className="text-primary" />
              <h3 className="text-base font-semibold text-text-primary">Cursos em andamento</h3>
            </div>
            <div className="mt-4 space-y-4">
              {data.courses.map((course) => (
                <div key={course.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">{course.title}</span>
                    <span className="text-text-muted">{course.progress}%</span>
                  </div>
                  <ProgressBar value={course.progress} className="mt-2" />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2">
              <ClipboardList size={18} className="text-primary" />
              <h3 className="text-base font-semibold text-text-primary">Procedimentos recentes</h3>
            </div>
            <ul className="mt-4 divide-y divide-border">
              {data.procedures.map((proc) => (
                <li key={proc.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <span className="text-sm text-text-secondary">{proc.title}</span>
                  <span className="text-xs text-text-muted">{proc.updated}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="flex flex-col items-center text-center">
            <p className="text-sm font-medium text-text-secondary">Sua evolução geral</p>
            <div className="mt-4">
              <CircularProgress value={data.overallProgress} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2">
              <CalendarClock size={18} className="text-primary" />
              <h3 className="text-base font-semibold text-text-primary">Próximos treinamentos</h3>
            </div>
            <ul className="mt-4 space-y-3">
              {data.upcomingTrainings.map((t) => (
                <li key={t.id} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{t.title}</span>
                  <Badge variant="primary">{t.date}</Badge>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <div className="flex items-center gap-2">
              <Bookmark size={18} className="text-primary" />
              <h3 className="text-base font-semibold text-text-primary">Documentos favoritos</h3>
            </div>
            <ul className="mt-4 space-y-2.5">
              {data.favorites.map((doc) => (
                <li key={doc.id} className="text-sm text-text-secondary hover:text-primary">
                  {doc.title}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
