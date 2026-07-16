import type { Role } from '../features/auth/types'

export type NotificationType =
  | 'aviso'
  | 'aviso-respondido'
  | 'documento'
  | 'procedimento-publicado'
  | 'procedimento-concluido'
  | 'novo-usuario'
  | 'permissao-alterada'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  description: string
  createdAt: string
  /** ids of users who have read/dismissed this notification */
  readBy: string[]
  /** exact recipient — takes precedence over department/role targeting */
  targetUserId?: string
  /** scopes to members of this department */
  targetDepartment?: string
  /** scopes to these roles; combined with targetDepartment as OR (e.g. "dept members OR admin") */
  targetRoles?: Role[]
  linkTo?: string
}

export const notifications: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'documento',
    title: 'Documento favorito atualizado',
    description: '"Manual do Colaborador" (favoritado por você) recebeu uma nova versão.',
    createdAt: '2026-07-10T10:00:00',
    readBy: [],
    targetUserId: 'usr-3',
    linkTo: '/biblioteca',
  },
  {
    id: 'notif-2',
    type: 'novo-usuario',
    title: 'Novo colaborador',
    description: 'Diego Santos entrou para a equipe de Suporte.',
    createdAt: '2026-07-09T14:30:00',
    readBy: ['usr-1'],
    targetRoles: ['admin', 'gestor'],
    linkTo: '/usuarios',
  },
]
