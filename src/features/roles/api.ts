import { defaultPermissions, modules } from '../../mocks/permissions'
import { teamMembers } from '../../mocks/teamMembers'
import type { Role } from '../auth/types'
import { notify } from '../notifications/api'

const roleLabels: Record<Role, string> = {
  admin: 'Administrador',
  gestor: 'Gestor',
  colaborador: 'Colaborador',
}

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

let permissions = structuredClone(defaultPermissions)

export function getModules() {
  return modules
}

export function getPermissions() {
  return delay(structuredClone(permissions))
}

export function setPermission(role: Role, moduleKey: string, enabled: boolean) {
  permissions = { ...permissions, [role]: { ...permissions[role], [moduleKey]: enabled } }
  const mod = modules.find((m) => m.key === moduleKey)
  notify({
    type: 'permissao-alterada',
    title: 'Permissões atualizadas',
    description: `O módulo "${mod?.label ?? moduleKey}" foi ${enabled ? 'liberado' : 'bloqueado'} para ${roleLabels[role]}`,
    targetRoles: ['admin'],
    linkTo: '/cargos',
  })
  return delay(structuredClone(permissions))
}

export function countByRole(role: Role) {
  return teamMembers.filter((m) => m.role === role).length
}
