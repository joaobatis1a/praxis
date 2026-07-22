import { supabase } from '../../lib/supabaseClient'

export interface MaintenanceCompany {
  id: string
  name: string
  status: 'ativo' | 'inativo'
  createdAt: string
  memberCount: number
  adminName: string | null
  adminEmail: string | null
}

interface CompanyRow {
  id: string
  name: string
  status: 'ativo' | 'inativo'
  created_at: string
  member_count: number
  admin_name: string | null
  admin_email: string | null
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
    adminName: row.admin_name,
    adminEmail: row.admin_email,
  }))
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
