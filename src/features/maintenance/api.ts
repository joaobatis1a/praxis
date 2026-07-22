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
  contactName: string | null
  contactPhone: string | null
  notes: string | null
}

interface CompanyRow {
  id: string
  name: string
  status: 'ativo' | 'inativo'
  created_at: string
  member_count: number
  admin_names: string[] | null
  admin_emails: string[] | null
  contact_name: string | null
  contact_phone: string | null
  notes: string | null
}

export interface CreateCompanyInput {
  name: string
  contactName?: string
  contactPhone?: string
  notes?: string
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
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    notes: row.notes,
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
export async function createCompanyForClient(input: CreateCompanyInput): Promise<string> {
  const code = randomCode()
  const { error } = await supabase!.rpc('create_company_for_client', {
    company_name: input.name,
    invite_code: code,
    contact_name: input.contactName?.trim() || null,
    contact_phone: input.contactPhone?.trim() || null,
    notes: input.notes?.trim() || null,
  })
  if (error) throw new Error('Não foi possível criar a empresa.')
  return code
}

/** Generates a single-use maintenance invite code — the invitee redeems it themselves, either via
 * "Tenho um código de manutenção" in Configurações (if they already have an account) or via the
 * public signup page (if they don't). */
export async function generateMaintenanceInviteCode(): Promise<string> {
  const code = randomCode()
  const { error } = await supabase!.from('maintenance_invite_codes').insert({ code })
  if (error) throw new Error('Não foi possível gerar o código.')
  return code
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

/** Redeems a single-use maintenance invite code for the CURRENTLY authenticated session (the
 * server matches by JWT email, never a client-supplied one). Returns false for an invalid/
 * already-used code instead of throwing, since "código inválido" is an expected outcome, not
 * a real failure. */
export async function redeemMaintenanceInviteCode(code: string): Promise<boolean> {
  const { data, error } = await supabase!.rpc('redeem_maintenance_invite_code', { invite_code: code.trim() })
  if (error) throw new Error('Não foi possível resgatar o código.')
  return !!data
}
