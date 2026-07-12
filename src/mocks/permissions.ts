import type { Role } from '../features/auth/types'

export interface ModulePermission {
  key: string
  label: string
  description: string
}

export const modules: ModulePermission[] = [
  { key: 'biblioteca', label: 'Biblioteca de Conhecimento', description: 'Consultar e editar documentos' },
  { key: 'procedimentos', label: 'Procedimentos Operacionais', description: 'Consultar e editar SOPs' },
  { key: 'avisos', label: 'Avisos', description: 'Enviar e consultar avisos de equipe' },
  { key: 'usuarios', label: 'Gestão de Usuários', description: 'Ver e gerenciar colaboradores' },
  { key: 'cargos', label: 'Cargos e Permissões', description: 'Ver e editar permissões do sistema' },
  { key: 'configuracoes', label: 'Configurações', description: 'Ajustes da empresa e da conta' },
]

// role -> module key -> enabled
export const defaultPermissions: Record<Role, Record<string, boolean>> = {
  admin: {
    biblioteca: true,
    procedimentos: true,
    avisos: true,
    usuarios: true,
    cargos: true,
    configuracoes: true,
  },
  gestor: {
    biblioteca: true,
    procedimentos: true,
    avisos: true,
    usuarios: true,
    cargos: false,
    configuracoes: false,
  },
  colaborador: {
    biblioteca: true,
    procedimentos: true,
    avisos: true,
    usuarios: false,
    cargos: false,
    configuracoes: false,
  },
}
