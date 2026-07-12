import type { Role } from '../features/auth/types'

export type UserStatus = 'ativo' | 'inativo'

export interface TeamMember {
  id: string
  name: string
  email: string
  role: Role
  department: string
  status: UserStatus
}

export const teamMembers: TeamMember[] = [
  { id: 'usr-1', name: 'Ana Ferreira', email: 'admin@praxis.com', role: 'admin', department: 'Diretoria', status: 'ativo' },
  { id: 'usr-2', name: 'Carlos Nunes', email: 'gestor@praxis.com', role: 'gestor', department: 'Operações', status: 'ativo' },
  { id: 'usr-3', name: 'Beatriz Lima', email: 'colaborador@praxis.com', role: 'colaborador', department: 'Suporte', status: 'ativo' },
  { id: 'usr-4', name: 'Diego Santos', email: 'diego.santos@praxis.com', role: 'colaborador', department: 'Suporte', status: 'ativo' },
  { id: 'usr-5', name: 'Fernanda Alves', email: 'fernanda.alves@praxis.com', role: 'gestor', department: 'Comercial', status: 'ativo' },
  { id: 'usr-6', name: 'Gustavo Ramos', email: 'gustavo.ramos@praxis.com', role: 'colaborador', department: 'Comercial', status: 'ativo' },
  { id: 'usr-7', name: 'Helena Costa', email: 'helena.costa@praxis.com', role: 'colaborador', department: 'Financeiro', status: 'inativo' },
  { id: 'usr-8', name: 'Igor Martins', email: 'igor.martins@praxis.com', role: 'colaborador', department: 'Operações', status: 'ativo' },
  { id: 'usr-9', name: 'Juliana Rocha', email: 'juliana.rocha@praxis.com', role: 'gestor', department: 'Recursos Humanos', status: 'ativo' },
  { id: 'usr-10', name: 'Lucas Pereira', email: 'lucas.pereira@praxis.com', role: 'colaborador', department: 'Recursos Humanos', status: 'inativo' },
  { id: 'usr-11', name: 'Mariana Duarte', email: 'mariana.duarte@praxis.com', role: 'colaborador', department: 'Financeiro', status: 'ativo' },
  { id: 'usr-12', name: 'Rafael Oliveira', email: 'rafael.oliveira@praxis.com', role: 'colaborador', department: 'Suporte', status: 'ativo' },
]
