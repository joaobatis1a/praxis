export const adminStats = {
  colaboradores: { value: 248, change: 12 },
  treinamentosAtivos: { value: 16, change: 4 },
  documentosPublicados: { value: 312, change: 8 },
  progressoMedio: { value: 73, change: 5 },
}

export const progressHistory = [
  { month: 'Fev', progresso: 48 },
  { month: 'Mar', progresso: 52 },
  { month: 'Abr', progresso: 58 },
  { month: 'Mai', progresso: 61 },
  { month: 'Jun', progresso: 68 },
  { month: 'Jul', progresso: 73 },
]

export const recentActivity = [
  {
    id: 'act-1',
    type: 'document' as const,
    description: 'Ana Ferreira publicou "Política de Segurança da Informação"',
    time: 'há 2 horas',
  },
  {
    id: 'act-2',
    type: 'training' as const,
    description: 'Carlos Nunes concluiu o treinamento "Compliance 2026"',
    time: 'há 5 horas',
  },
  {
    id: 'act-3',
    type: 'user' as const,
    description: 'Beatriz Lima foi adicionada à equipe de Suporte',
    time: 'há 1 dia',
  },
  {
    id: 'act-4',
    type: 'procedure' as const,
    description: 'Procedimento "Abertura de chamado" foi atualizado para v3',
    time: 'há 1 dia',
  },
  {
    id: 'act-5',
    type: 'training' as const,
    description: 'Nova trilha "Onboarding Comercial" foi publicada',
    time: 'há 2 dias',
  },
]

export const colaboradorProgress = 62

export const coursesInProgress = [
  { id: 'crs-1', title: 'Atendimento ao Cliente', progress: 80 },
  { id: 'crs-2', title: 'Segurança da Informação', progress: 45 },
  { id: 'crs-3', title: 'Compliance 2026', progress: 20 },
]

export const recentProcedures = [
  { id: 'proc-1', title: 'Abertura de chamado', updated: 'há 3 dias' },
  { id: 'proc-2', title: 'Checklist de fechamento de caixa', updated: 'há 1 semana' },
]

export const upcomingTrainings = [
  { id: 'up-1', title: 'Onboarding Comercial', date: '18 de julho' },
  { id: 'up-2', title: 'Novas Políticas de Compliance', date: '25 de julho' },
]

export const favoriteDocuments = [
  { id: 'fav-1', title: 'Manual do Colaborador' },
  { id: 'fav-2', title: 'Guia de Atendimento ao Cliente' },
  { id: 'fav-3', title: 'Política de Home Office' },
]
