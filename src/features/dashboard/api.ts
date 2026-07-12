import { adminStats, colaboradorProgress, favoriteDocuments, progressHistory, recentActivity, recentProcedures } from '../../mocks/dashboard'
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

export async function getAdminDashboard() {
  const completions = await listCompletions()
  const completionActivity = completions.map((c) => ({
    id: c.id,
    type: 'procedure' as const,
    description: `${c.userName} concluiu o procedimento "${c.procedureTitle}"`,
    time: formatRelativeTime(c.completedAt),
  }))
  const stats = {
    ...adminStats,
    procedimentosConcluidos: { value: completions.length, change: 8 },
  }
  return delay({ stats, progressHistory, activity: [...completionActivity, ...recentActivity] })
}

export async function getColaboradorDashboard(userId: string) {
  const completions = await listCompletions()
  const myCompletions = completions.filter((c) => c.userId === userId)
  return delay({
    overallProgress: colaboradorProgress,
    procedures: recentProcedures,
    completions: myCompletions,
    favorites: favoriteDocuments,
  })
}
