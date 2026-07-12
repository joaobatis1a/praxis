export interface ProcedureCompletion {
  id: string
  procedureId: string
  procedureTitle: string
  userId: string
  userName: string
  completedAt: string
}

export const procedureCompletions: ProcedureCompletion[] = [
  {
    id: 'comp-1',
    procedureId: 'proc-7',
    procedureTitle: 'Primeiro contato com cliente',
    userId: 'usr-6',
    userName: 'Gustavo Ramos',
    completedAt: '2026-07-11T15:20:00',
  },
]
