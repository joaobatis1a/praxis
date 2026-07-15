export type NoticeRecipientType = 'user' | 'department'

export interface Notice {
  id: string
  procedureId: string
  procedureTitle: string
  description: string
  authorId: string | null
  authorName: string
  recipientType: NoticeRecipientType
  recipientId: string
  recipientLabel: string
  createdAt: string
  read: boolean
}

export const notices: Notice[] = [
  {
    id: 'notice-1',
    procedureId: 'proc-1',
    procedureTitle: 'Abertura de chamado',
    description: 'Parei no passo 3, faltando registrar a solicitação do cliente Contoso. Segue o restante pra você.',
    authorId: 'usr-4',
    authorName: 'Diego Santos',
    recipientType: 'user',
    recipientId: 'usr-3',
    recipientLabel: 'Beatriz Lima',
    createdAt: '2026-07-12T07:40:00',
    read: false,
  },
  {
    id: 'notice-2',
    procedureId: 'proc-5',
    procedureTitle: 'Manutenção preventiva de equipamentos',
    description: 'Equipe, ainda faltam trocar as peças de desgaste da linha 2. Priorizem amanhã cedo.',
    authorId: 'usr-2',
    authorName: 'Carlos Nunes',
    recipientType: 'department',
    recipientId: 'Operações',
    recipientLabel: 'Operações',
    createdAt: '2026-07-11T17:15:00',
    read: false,
  },
  {
    id: 'notice-3',
    procedureId: 'proc-3',
    procedureTitle: 'Onboarding de novo colaborador',
    description: 'Comecei o onboarding do Diego, faltam configurar o e-mail corporativo e agendar o treinamento inicial.',
    authorId: 'usr-9',
    authorName: 'Juliana Rocha',
    recipientType: 'user',
    recipientId: 'usr-2',
    recipientLabel: 'Carlos Nunes',
    createdAt: '2026-07-11T16:05:00',
    read: false,
  },
  {
    id: 'notice-4',
    procedureId: 'proc-8',
    procedureTitle: 'Fechamento mensal financeiro',
    description: 'Fiquem atentos ao prazo do fechamento — precisa estar consolidado até sexta.',
    authorId: 'usr-1',
    authorName: 'Ana Ferreira',
    recipientType: 'department',
    recipientId: 'Financeiro',
    recipientLabel: 'Financeiro',
    createdAt: '2026-07-10T09:20:00',
    read: true,
  },
  {
    id: 'notice-5',
    procedureId: 'proc-6',
    procedureTitle: 'Aprovação de contrato',
    description: 'O contrato do fornecedor XPTO está pronto para sua assinatura, revisei as cláusulas com o jurídico.',
    authorId: 'usr-7',
    authorName: 'Helena Costa',
    recipientType: 'user',
    recipientId: 'usr-1',
    recipientLabel: 'Ana Ferreira',
    createdAt: '2026-07-12T08:10:00',
    read: false,
  },
  {
    id: 'notice-6',
    procedureId: 'proc-1',
    procedureTitle: 'Abertura de chamado',
    description: 'Terminei os 2 primeiros passos do chamado #482, segue pra você finalizar.',
    authorId: 'usr-3',
    authorName: 'Beatriz Lima',
    recipientType: 'user',
    recipientId: 'usr-4',
    recipientLabel: 'Diego Santos',
    createdAt: '2026-07-09T11:30:00',
    read: true,
  },
]
