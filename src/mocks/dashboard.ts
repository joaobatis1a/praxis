export const adminStats = {
  colaboradores: { value: 248, change: 12 },
  documentosPublicados: { value: 312, change: 8 },
  progressoMedio: { value: 73, change: 5 },
}

export const progressHistory = [
  { month: 'Fev', progresso: 6 },
  { month: 'Mar', progresso: 9 },
  { month: 'Abr', progresso: 11 },
  { month: 'Mai', progresso: 14 },
  { month: 'Jun', progresso: 17 },
  { month: 'Jul', progresso: 21 },
]

export const recentActivity = [
  {
    id: 'act-1',
    type: 'document' as const,
    description: 'Ana Ferreira publicou "Política de Segurança da Informação"',
    time: 'há 2 horas',
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
]

export const colaboradorProgress = 62

export const recentProcedures = [
  { id: 'proc-1', title: 'Abertura de chamado', updated: 'há 3 dias' },
  { id: 'proc-2', title: 'Checklist de fechamento de caixa', updated: 'há 1 semana' },
]

export const favoriteDocuments = [
  { id: 'fav-1', title: 'Manual do Colaborador' },
  { id: 'fav-2', title: 'Guia de Atendimento ao Cliente' },
  { id: 'fav-3', title: 'Política de Home Office' },
]
