export type ProcedureStatus = 'publicado' | 'rascunho'

export interface ProcedureStep {
  id: string
  text: string
}

export interface Procedure {
  id: string
  title: string
  department: string
  responsible: string
  status: ProcedureStatus
  estimatedMinutes: number
  updatedAt: string
  author: string
  steps: ProcedureStep[]
  completedStepIds: string[]
  videoUrl?: string
  videoName?: string
}

export const departments = ['Diretoria', 'Operações', 'Suporte', 'Comercial', 'Financeiro', 'Recursos Humanos']

export const procedures: Procedure[] = [
  {
    id: 'proc-1',
    title: 'Abertura de chamado',
    department: 'Suporte',
    responsible: 'Time de Suporte',
    status: 'publicado',
    estimatedMinutes: 15,
    updatedAt: '2026-07-09',
    author: 'Beatriz Lima',
    steps: [
      { id: 'proc-1-s1', text: 'Confirmar identidade do cliente' },
      { id: 'proc-1-s2', text: 'Validar dados no sistema' },
      { id: 'proc-1-s3', text: 'Registrar solicitação' },
      { id: 'proc-1-s4', text: 'Enviar confirmação por e-mail' },
    ],
    completedStepIds: ['proc-1-s1', 'proc-1-s2'],
  },
  {
    id: 'proc-2',
    title: 'Checklist de fechamento de caixa',
    department: 'Financeiro',
    responsible: 'Time Financeiro',
    status: 'publicado',
    estimatedMinutes: 20,
    updatedAt: '2026-07-05',
    author: 'Helena Costa',
    steps: [
      { id: 'proc-2-s1', text: 'Conferir valores em caixa' },
      { id: 'proc-2-s2', text: 'Emitir relatório de vendas' },
      { id: 'proc-2-s3', text: 'Guardar malote no cofre' },
      { id: 'proc-2-s4', text: 'Registrar assinatura de fechamento' },
    ],
    completedStepIds: [],
  },
  {
    id: 'proc-3',
    title: 'Onboarding de novo colaborador',
    department: 'Recursos Humanos',
    responsible: 'Time de RH',
    status: 'publicado',
    estimatedMinutes: 45,
    updatedAt: '2026-07-08',
    author: 'Juliana Rocha',
    steps: [
      { id: 'proc-3-s1', text: 'Criar acesso ao sistema' },
      { id: 'proc-3-s2', text: 'Entregar kit de boas-vindas' },
      { id: 'proc-3-s3', text: 'Apresentar equipe' },
      { id: 'proc-3-s4', text: 'Agendar treinamento inicial' },
      { id: 'proc-3-s5', text: 'Configurar e-mail corporativo' },
    ],
    completedStepIds: ['proc-3-s1', 'proc-3-s2', 'proc-3-s3'],
  },
  {
    id: 'proc-4',
    title: 'Processo de reembolso',
    department: 'Financeiro',
    responsible: 'Time Financeiro',
    status: 'rascunho',
    estimatedMinutes: 10,
    updatedAt: '2026-06-28',
    author: 'Mariana Duarte',
    steps: [
      { id: 'proc-4-s1', text: 'Validar nota fiscal' },
      { id: 'proc-4-s2', text: 'Confirmar centro de custo' },
      { id: 'proc-4-s3', text: 'Aprovar valor' },
      { id: 'proc-4-s4', text: 'Processar pagamento' },
    ],
    completedStepIds: [],
  },
  {
    id: 'proc-5',
    title: 'Manutenção preventiva de equipamentos',
    department: 'Operações',
    responsible: 'Time de Operações',
    status: 'publicado',
    estimatedMinutes: 30,
    updatedAt: '2026-07-01',
    author: 'Igor Martins',
    steps: [
      { id: 'proc-5-s1', text: 'Inspecionar equipamento' },
      { id: 'proc-5-s2', text: 'Registrar avarias' },
      { id: 'proc-5-s3', text: 'Trocar peças de desgaste' },
      { id: 'proc-5-s4', text: 'Testar funcionamento' },
      { id: 'proc-5-s5', text: 'Atualizar ficha técnica' },
    ],
    completedStepIds: ['proc-5-s1'],
  },
  {
    id: 'proc-6',
    title: 'Aprovação de contrato',
    department: 'Diretoria',
    responsible: 'Diretoria',
    status: 'publicado',
    estimatedMinutes: 25,
    updatedAt: '2026-06-30',
    author: 'Ana Ferreira',
    steps: [
      { id: 'proc-6-s1', text: 'Revisar cláusulas' },
      { id: 'proc-6-s2', text: 'Validar com jurídico' },
      { id: 'proc-6-s3', text: 'Coletar assinaturas' },
      { id: 'proc-6-s4', text: 'Arquivar via digital' },
    ],
    completedStepIds: [],
  },
  {
    id: 'proc-7',
    title: 'Primeiro contato com cliente',
    department: 'Comercial',
    responsible: 'Time Comercial',
    status: 'publicado',
    estimatedMinutes: 12,
    updatedAt: '2026-07-10',
    author: 'Fernanda Alves',
    steps: [
      { id: 'proc-7-s1', text: 'Identificar necessidade' },
      { id: 'proc-7-s2', text: 'Apresentar proposta' },
      { id: 'proc-7-s3', text: 'Registrar follow-up' },
    ],
    completedStepIds: ['proc-7-s1', 'proc-7-s2', 'proc-7-s3'],
  },
  {
    id: 'proc-8',
    title: 'Fechamento mensal financeiro',
    department: 'Financeiro',
    responsible: 'Time Financeiro',
    status: 'rascunho',
    estimatedMinutes: 40,
    updatedAt: '2026-06-25',
    author: 'Helena Costa',
    steps: [
      { id: 'proc-8-s1', text: 'Conciliar extratos bancários' },
      { id: 'proc-8-s2', text: 'Consolidar despesas' },
      { id: 'proc-8-s3', text: 'Gerar relatório gerencial' },
      { id: 'proc-8-s4', text: 'Enviar para diretoria' },
    ],
    completedStepIds: [],
  },
]
