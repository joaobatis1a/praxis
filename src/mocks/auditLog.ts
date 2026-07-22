export interface MockAuditLogEntry {
  id: string
  actorName: string
  action: string
  entityType: string
  entityLabel: string
  metadata?: { from?: string; to?: string } | null
  createdAt: string
}

const now = Date.now()
const hoursAgo = (h: number) => new Date(now - h * 3600_000).toISOString()

export const auditLog: MockAuditLogEntry[] = [
  { id: 'audit-1', actorName: 'Ana Ferreira', action: 'published', entityType: 'procedure', entityLabel: 'Abertura de chamado', createdAt: hoursAgo(2) },
  { id: 'audit-2', actorName: 'Ana Ferreira', action: 'created', entityType: 'document', entityLabel: 'Política de Segurança da Informação', createdAt: hoursAgo(5) },
  {
    id: 'audit-3',
    actorName: 'Ana Ferreira',
    action: 'role_changed',
    entityType: 'user',
    entityLabel: 'Gustavo Ramos',
    metadata: { from: 'colaborador', to: 'gestor' },
    createdAt: hoursAgo(26),
  },
  { id: 'audit-4', actorName: 'Beatriz Lima', action: 'created', entityType: 'notice', entityLabel: 'Turno da tarde: cliente aguardando retorno sobre o pedido 4821', createdAt: hoursAgo(30) },
  { id: 'audit-5', actorName: 'Ana Ferreira', action: 'deactivated', entityType: 'user', entityLabel: 'Carlos Souza', createdAt: hoursAgo(72) },
  { id: 'audit-6', actorName: 'Gustavo Ramos', action: 'updated', entityType: 'procedure', entityLabel: 'Checklist de fechamento de caixa', createdAt: hoursAgo(96) },
  { id: 'audit-7', actorName: 'Ana Ferreira', action: 'deleted', entityType: 'document', entityLabel: 'Rascunho antigo de contrato', createdAt: hoursAgo(140) },
]
