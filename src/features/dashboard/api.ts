import { isSupabase } from '../../lib/dataSource'
import { supabase } from '../../lib/supabaseClient'
import { adminStats, colaboradorProgress, favoriteDocuments, progressHistory, recentActivity, recentProcedures } from '../../mocks/dashboard'
import { listDocuments } from '../library/api'
import { listCompletions } from '../procedures/api'

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diffMs / 60000)
  if (minutes < 60) return minutes <= 1 ? 'agora mesmo' : `há ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `há ${hours} hora${hours > 1 ? 's' : ''}`
  const days = Math.round(hours / 24)
  return `há ${days} dia${days > 1 ? 's' : ''}`
}

type ActivityType = 'document' | 'user' | 'procedure'

interface ActivityItem {
  id: string
  type: ActivityType
  description: string
  time: string
}

interface RawActivityItem extends ActivityItem {
  at: string
}

interface StatValue {
  value: number
  change?: number
}

interface DashboardStats {
  colaboradores: StatValue
  procedimentosConcluidos: StatValue
  documentosPublicados: StatValue
  progressoMedio: StatValue
}

function lastNMonths(n: number): { start: Date; end: Date; label: string }[] {
  const now = new Date()
  const months = []
  for (let i = n - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    const label = start.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
    months.push({ start, end, label: label.charAt(0).toUpperCase() + label.slice(1) })
  }
  return months
}

export async function getAdminDashboard() {
  if (isSupabase) {
    const [{ count: colaboradoresCount }, { count: documentosCount }, completions, { data: procRows }, { data: profileRows }, { data: docRows }] =
      await Promise.all([
        supabase!.from('profiles').select('*', { count: 'exact', head: true }),
        supabase!.from('library_documents').select('*', { count: 'exact', head: true }),
        listCompletions(),
        supabase!.from('procedures').select('id, title, status, completed, created_at').order('created_at', { ascending: false }),
        supabase!.from('profiles').select('id, name, department, created_at').order('created_at', { ascending: false }).limit(5),
        supabase!.from('library_documents').select('id, title, author, created_at').order('created_at', { ascending: false }).limit(5),
      ])

    const procedures = procRows ?? []
    const published = procedures.filter((p) => p.status === 'publicado')
    const progressoMedio = published.length ? Math.round((published.filter((p) => p.completed).length / published.length) * 100) : 0

    const months = lastNMonths(6)
    const progressHistoryReal = months.map(({ start, end, label }) => ({
      month: label,
      progresso: completions.filter((c) => {
        const t = new Date(c.completedAt).getTime()
        return t >= start.getTime() && t < end.getTime()
      }).length,
    }))

    const documentActivity: RawActivityItem[] = (docRows ?? []).map((d) => ({
      id: `doc-${d.id}`,
      type: 'document',
      description: `${d.author} publicou "${d.title}"`,
      at: d.created_at,
      time: formatRelativeTime(d.created_at),
    }))
    const userActivity: RawActivityItem[] = (profileRows ?? []).map((p) => ({
      id: `user-${p.id}`,
      type: 'user',
      description: `${p.name} foi adicionado à equipe${p.department ? ` de ${p.department}` : ''}`,
      at: p.created_at,
      time: formatRelativeTime(p.created_at),
    }))
    const procedureActivity: RawActivityItem[] = procedures.slice(0, 5).map((p) => ({
      id: `proc-${p.id}`,
      type: 'procedure',
      description: `Procedimento "${p.title}" foi atualizado`,
      at: p.created_at,
      time: formatRelativeTime(p.created_at),
    }))
    const completionActivity: RawActivityItem[] = completions.slice(0, 5).map((c) => ({
      id: c.id,
      type: 'procedure',
      description: `${c.userName} concluiu o procedimento "${c.procedureTitle}"`,
      at: c.completedAt,
      time: formatRelativeTime(c.completedAt),
    }))

    const activity: ActivityItem[] = [...documentActivity, ...userActivity, ...procedureActivity, ...completionActivity]
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 8)
      .map(({ id, type, description, time }) => ({ id, type, description, time }))

    const stats: DashboardStats = {
      colaboradores: { value: colaboradoresCount ?? 0 },
      procedimentosConcluidos: { value: completions.length },
      documentosPublicados: { value: documentosCount ?? 0 },
      progressoMedio: { value: progressoMedio },
    }

    return { stats, progressHistory: progressHistoryReal, activity }
  }

  const completions = await listCompletions()
  const completionActivity = completions.map((c) => ({
    id: c.id,
    type: 'procedure' as const,
    description: `${c.userName} concluiu o procedimento "${c.procedureTitle}"`,
    time: formatRelativeTime(c.completedAt),
  }))
  const stats: DashboardStats = {
    ...adminStats,
    procedimentosConcluidos: { value: completions.length, change: 8 },
  }
  return delay({ stats, progressHistory, activity: [...completionActivity, ...recentActivity] })
}

export async function getColaboradorDashboard(userId: string) {
  if (isSupabase) {
    const [completions, { count: publishedCount }, { data: procRows }, docs] = await Promise.all([
      listCompletions(),
      supabase!.from('procedures').select('*', { count: 'exact', head: true }).eq('status', 'publicado'),
      supabase!
        .from('procedures')
        .select('id, title, status, created_at')
        .eq('status', 'publicado')
        .order('created_at', { ascending: false })
        .limit(5),
      listDocuments(),
    ])

    const myCompletions = completions.filter((c) => c.userId === userId)
    const myCompletedProcedureIds = new Set(myCompletions.map((c) => c.procedureId))
    const overallProgress = publishedCount
      ? Math.round((myCompletedProcedureIds.size / publishedCount) * 100)
      : 0

    return {
      overallProgress,
      procedures: (procRows ?? []).map((p) => ({ id: p.id, title: p.title, updated: formatRelativeTime(p.created_at) })),
      completions: myCompletions,
      favorites: docs.filter((d) => d.favorite).map((d) => ({ id: d.id, title: d.title })),
    }
  }

  const completions = await listCompletions()
  const myCompletions = completions.filter((c) => c.userId === userId)
  return delay({
    overallProgress: colaboradorProgress,
    procedures: recentProcedures,
    completions: myCompletions,
    favorites: favoriteDocuments,
  })
}
