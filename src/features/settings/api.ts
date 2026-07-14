import { isSupabase } from '../../lib/dataSource'
import { supabase } from '../../lib/supabaseClient'
import { company as initialCompany, type Company } from '../../mocks/company'
import type { NotificationType } from '../../mocks/notifications'
import type { Role } from '../auth/types'
import { getDisabledTypes, setTypeEnabled } from '../notifications/api'
import { updateUser, type CreateUserInput } from '../users/api'

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

let companyState: Company = structuredClone(initialCompany)

interface CompanyRow {
  id: string
  name: string
}

export async function getCompany(): Promise<Company> {
  if (isSupabase) {
    const { data, error } = await supabase!.from('companies').select('name').single()
    if (error || !data) throw new Error('Não foi possível carregar os dados da empresa.')
    return { name: (data as CompanyRow).name }
  }
  return delay({ ...companyState })
}

export async function updateCompany(input: Company): Promise<Company> {
  if (isSupabase) {
    const { data: current, error: fetchError } = await supabase!.from('companies').select('id').single()
    if (fetchError || !current) throw new Error('Não foi possível carregar a empresa.')
    const { data, error } = await supabase!
      .from('companies')
      .update({ name: input.name })
      .eq('id', (current as { id: string }).id)
      .select('name')
      .single()
    if (error || !data) throw new Error('Não foi possível atualizar a empresa.')
    return { name: (data as CompanyRow).name }
  }
  companyState = { ...input }
  return delay({ ...companyState })
}

export function getNotificationPreferences(userId: string): Promise<NotificationType[]> {
  return getDisabledTypes(userId)
}

export function setNotificationPreference(userId: string, type: NotificationType, enabled: boolean): Promise<NotificationType[]> {
  return setTypeEnabled(userId, type, enabled)
}

export interface UpdateProfileInput {
  name: string
  email: string
  role: Role
  department: string
}

export function updateProfile(userId: string, input: UpdateProfileInput) {
  return updateUser(userId, input as CreateUserInput)
}

/** Supabase mode only — deletes the company and every member's real Auth account, not just their profile. */
export async function deleteCompany(companyId: string) {
  const { error } = await supabase!.rpc('delete_company_and_users', { target_company_id: companyId })
  if (error) throw new Error('Não foi possível excluir a empresa.')
}
