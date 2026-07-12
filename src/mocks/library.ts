export type DocType = 'pdf' | 'doc' | 'sheet' | 'video' | 'image'

export interface FolderNode {
  id: string
  name: string
  children?: FolderNode[]
}

export interface DocVersion {
  version: string
  date: string
  author: string
  note: string
}

export interface LibraryDocument {
  id: string
  title: string
  type: DocType
  author: string
  updatedAt: string
  /** absent = document is unfiled (not inside any folder), shown only in "Todos os documentos" */
  folderId?: string
  favorite: boolean
  history: DocVersion[]
  /** only set for type 'video'/'image'/'pdf' when a real file was uploaded (Supabase mode) */
  fileUrl?: string
  fileName?: string
  /** optional link (Drive, YouTube, etc.) shown alongside — or instead of — an uploaded file */
  externalUrl?: string
}

export const folderTree: FolderNode[] = [
  {
    id: 'rh',
    name: 'Recursos Humanos',
    children: [
      { id: 'rh-onboarding', name: 'Onboarding' },
      { id: 'rh-politicas', name: 'Políticas Internas' },
      { id: 'rh-beneficios', name: 'Benefícios' },
    ],
  },
  {
    id: 'operacoes',
    name: 'Operações',
    children: [
      { id: 'op-atendimento', name: 'Atendimento ao Cliente' },
      { id: 'op-checklists', name: 'Checklists' },
    ],
  },
  {
    id: 'comercial',
    name: 'Comercial',
    children: [
      { id: 'com-materiais', name: 'Materiais de Venda' },
      { id: 'com-contratos', name: 'Contratos' },
    ],
  },
  {
    id: 'seguranca',
    name: 'Segurança da Informação',
    children: [
      { id: 'seg-politicas', name: 'Políticas de Segurança' },
      { id: 'seg-compliance', name: 'Compliance' },
    ],
  },
]

export const documents: LibraryDocument[] = [
  {
    id: 'doc-1',
    title: 'Manual do Colaborador',
    type: 'pdf',
    author: 'Ana Ferreira',
    updatedAt: '2026-07-09',
    folderId: 'rh-onboarding',
    favorite: true,
    history: [
      { version: 'v12', date: '2026-07-09', author: 'Ana Ferreira', note: 'Atualização da seção de benefícios.' },
      { version: 'v11', date: '2026-05-02', author: 'Ana Ferreira', note: 'Revisão geral de texto.' },
      { version: 'v10', date: '2026-02-14', author: 'Juliana Rocha', note: 'Inclusão da política de home office.' },
    ],
  },
  {
    id: 'doc-2',
    title: 'Checklist de Primeiro Dia',
    type: 'sheet',
    author: 'Juliana Rocha',
    updatedAt: '2026-07-05',
    folderId: 'rh-onboarding',
    favorite: false,
    history: [{ version: 'v3', date: '2026-07-05', author: 'Juliana Rocha', note: 'Novos itens de TI.' }],
  },
  {
    id: 'doc-3',
    title: 'Política de Segurança da Informação',
    type: 'pdf',
    author: 'Ana Ferreira',
    updatedAt: '2026-07-09',
    folderId: 'seg-politicas',
    favorite: true,
    history: [
      { version: 'v4', date: '2026-07-09', author: 'Ana Ferreira', note: 'Novas regras de senha e MFA.' },
      { version: 'v3', date: '2026-03-11', author: 'Ana Ferreira', note: 'Revisão anual.' },
    ],
  },
  {
    id: 'doc-4',
    title: 'Política de Home Office',
    type: 'doc',
    author: 'Juliana Rocha',
    updatedAt: '2026-06-20',
    folderId: 'rh-politicas',
    favorite: true,
    history: [{ version: 'v2', date: '2026-06-20', author: 'Juliana Rocha', note: 'Ajuste no reembolso de internet.' }],
  },
  {
    id: 'doc-5',
    title: 'Guia de Atendimento ao Cliente',
    type: 'pdf',
    author: 'Carlos Nunes',
    updatedAt: '2026-06-28',
    folderId: 'op-atendimento',
    favorite: true,
    history: [
      { version: 'v3', date: '2026-06-28', author: 'Carlos Nunes', note: 'Novo fluxo de escalonamento.' },
      { version: 'v2', date: '2026-04-02', author: 'Carlos Nunes', note: 'Inclusão de exemplos de resposta.' },
    ],
  },
  {
    id: 'doc-6',
    title: 'Checklist de Fechamento de Caixa',
    type: 'sheet',
    author: 'Igor Martins',
    updatedAt: '2026-07-02',
    folderId: 'op-checklists',
    favorite: false,
    history: [{ version: 'v5', date: '2026-07-02', author: 'Igor Martins', note: 'Ajuste nos itens de conferência.' }],
  },
  {
    id: 'doc-7',
    title: 'Treinamento de Compliance 2026',
    type: 'video',
    author: 'Ana Ferreira',
    updatedAt: '2026-06-15',
    folderId: 'seg-compliance',
    favorite: false,
    history: [{ version: 'v1', date: '2026-06-15', author: 'Ana Ferreira', note: 'Publicação inicial.' }],
  },
  {
    id: 'doc-8',
    title: 'Apresentação Institucional',
    type: 'image',
    author: 'Fernanda Alves',
    updatedAt: '2026-05-30',
    folderId: 'com-materiais',
    favorite: false,
    history: [{ version: 'v2', date: '2026-05-30', author: 'Fernanda Alves', note: 'Nova identidade visual.' }],
  },
  {
    id: 'doc-9',
    title: 'Modelo de Contrato de Prestação de Serviço',
    type: 'doc',
    author: 'Fernanda Alves',
    updatedAt: '2026-04-18',
    folderId: 'com-contratos',
    favorite: false,
    history: [{ version: 'v6', date: '2026-04-18', author: 'Fernanda Alves', note: 'Ajuste de cláusula de rescisão.' }],
  },
  {
    id: 'doc-10',
    title: 'Guia de Benefícios 2026',
    type: 'pdf',
    author: 'Juliana Rocha',
    updatedAt: '2026-07-08',
    folderId: 'rh-beneficios',
    favorite: false,
    history: [{ version: 'v2', date: '2026-07-08', author: 'Juliana Rocha', note: 'Novo plano odontológico.' }],
  },
]
