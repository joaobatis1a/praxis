import {
  adminStats,
  colaboradorProgress,
  coursesInProgress,
  favoriteDocuments,
  progressHistory,
  recentActivity,
  recentProcedures,
  upcomingTrainings,
} from '../../mocks/dashboard'

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export function getAdminDashboard() {
  return delay({ stats: adminStats, progressHistory, activity: recentActivity })
}

export function getColaboradorDashboard() {
  return delay({
    overallProgress: colaboradorProgress,
    courses: coursesInProgress,
    procedures: recentProcedures,
    upcomingTrainings,
    favorites: favoriteDocuments,
  })
}
