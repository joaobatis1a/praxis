import { randomCode } from '../../lib/randomCode'
import { supabase } from '../../lib/supabaseClient'

export interface MaintenanceCompany {
  id: string
  name: string
  status: 'ativo' | 'inativo'
  createdAt: string
  memberCount: number
  adminNames: string[]
  adminEmails: string[]
}

interface CompanyRow {
  id: string
  name: string
  status: 'ativo' | 'inativo'
  created_at: string
  member_count: number
  admin_names: string[] | null
  admin_emails: string[] | null
}

export interface MaintenanceAccount {
  id: string
  email: string
  addedBy: string | null
  createdAt: string
}

interface MaintenanceAccountRow {
  id: string
  email: string
  added_by: string | null
  created_at: string
}

export async function listCompanies(): Promise<MaintenanceCompany[]> {
  const { data, error } = await supabase!.rpc('list_all_companies')
  if (error || !data) throw new Error('Não foi possível carregar as empresas.')
  return (data as CompanyRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    status: row.status,
    createdAt: row.created_at,
    memberCount: row.member_count,
    adminNames: row.admin_names ?? [],
    adminEmails: row.admin_emails ?? [],
  }))
}

export async function setCompanyStatus(companyId: string, status: 'ativo' | 'inativo'): Promise<void> {
  const { error } = await supabase!.rpc('set_company_status', { target_company_id: companyId, new_status: status })
  if (error) throw new Error('Não foi possível atualizar o status da empresa.')
}

export async function deleteCompanyAsMaintenance(companyId: string): Promise<void> {
  const { error } = await supabase!.rpc('delete_company_as_maintenance', { target_company_id: companyId })
  if (error) throw new Error('Não foi possível excluir a empresa.')
}

export async function listMaintenanceAccounts(): Promise<MaintenanceAccount[]> {
  const { data, error } = await supabase!.from('maintenance_accounts').select('*').order('created_at')
  if (error || !data) throw new Error('Não foi possível carregar as contas de manutenção.')
  return (data as MaintenanceAccountRow[]).map((row) => ({
    id: row.id,
    email: row.email,
    addedBy: row.added_by,
    createdAt: row.created_at,
  }))
}

/** Creates a brand new, empty company and returns an admin invite code for it — the client's
 * first user redeems the code themselves via "Tenho um código", same as any other invite. */
export async function createCompanyForClient(name: string): Promise<string> {
  const code = randomCode()
  const { error } = await supabase!.rpc('create_company_for_client', { company_name: name, invite_code: code })
  if (error) throw new Error('Não foi possível criar a empresa.')
  return code
}

export async function addMaintenanceAccount(email: string): Promise<void> {
  const { error } = await supabase!.rpc('add_maintenance_account', { target_email: email })
  if (error) throw new Error('Não foi possível adicionar essa conta.')
}

export async function removeMaintenanceAccount(email: string): Promise<void> {
  const { error } = await supabase!.rpc('remove_maintenance_account', { target_email: email })
  if (error) {
    throw new Error(
      error.message.includes('last maintenance account')
        ? 'Não é possível remover a última conta de manutenção.'
        : 'Não foi possível remover essa conta.',
    )
  }
}
