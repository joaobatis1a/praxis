import { isSupabase } from '../../lib/dataSource'
import { supabase } from '../../lib/supabaseClient'
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

type PermissionsMatrix = Record<Role, Record<string, boolean>>

interface CompanyPermissionsRow {
  id: string
  permissions: PermissionsMatrix
}

async function fetchOwnCompany(): Promise<CompanyPermissionsRow> {
  const { data, error } = await supabase!.from('companies').select('id, permissions').single()
  if (error || !data) throw new Error('Não foi possível carregar a empresa.')
  return data as CompanyPermissionsRow
}

export function getModules() {
  return modules
}

export async function getPermissions(): Promise<PermissionsMatrix> {
  if (isSupabase) {
    const company = await fetchOwnCompany()
    return company.permissions
  }
  return delay(structuredClone(permissions))
}

export async function setPermission(role: Role, moduleKey: string, enabled: boolean): Promise<PermissionsMatrix> {
  const mod = modules.find((m) => m.key === moduleKey)
  if (isSupabase) {
    const company = await fetchOwnCompany()
    const updated = { ...company.permissions, [role]: { ...company.permissions[role], [moduleKey]: enabled } }
    const { data, error } = await supabase!
      .from('companies')
      .update({ permissions: updated })
      .eq('id', company.id)
      .select('permissions')
      .single()
    if (error || !data) throw new Error('Não foi possível atualizar as permissões.')
    notify({
      type: 'permissao-alterada',
      title: 'Permissões atualizadas',
      description: `O módulo "${mod?.label ?? moduleKey}" foi ${enabled ? 'liberado' : 'bloqueado'} para ${roleLabels[role]}`,
      targetRoles: ['admin'],
      linkTo: '/cargos',
    })
    return (data as CompanyPermissionsRow).permissions
  }
  permissions = { ...permissions, [role]: { ...permissions[role], [moduleKey]: enabled } }
  notify({
    type: 'permissao-alterada',
    title: 'Permissões atualizadas',
    description: `O módulo "${mod?.label ?? moduleKey}" foi ${enabled ? 'liberado' : 'bloqueado'} para ${roleLabels[role]}`,
    targetRoles: ['admin'],
    linkTo: '/cargos',
  })
  return delay(structuredClone(permissions))
}

export async function countByRole(role: Role): Promise<number> {
  if (isSupabase) {
    const { count, error } = await supabase!
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', role)
    if (error) throw new Error('Não foi possível contar colaboradores.')
    return count ?? 0
  }
  return delay(teamMembers.filter((m) => m.role === role).length)
}
