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

/** Supabase mode only — persists the theme choice on the user's profile so it follows them
 * across devices; mock mode keeps theme in localStorage only (see lib/theme-provider.tsx). */
export async function setThemePreference(userId: string, theme: 'light' | 'dark') {
  const { error } = await supabase!.from('profiles').update({ theme }).eq('id', userId)
  if (error) throw new Error('Não foi possível salvar sua preferência de tema.')
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

const AVATAR_BUCKET = 'avatars'

/** Supabase mode only — uploads to a fixed per-user path (upsert, so a re-upload just replaces
 * the file at the same path) and saves the public URL, cache-busted with a version query param
 * since the path itself never changes across uploads. */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/avatar.${ext}`
  const { error: uploadError } = await supabase!.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type })
  if (uploadError) throw new Error('Não foi possível enviar a foto.')

  const { data } = supabase!.storage.from(AVATAR_BUCKET).getPublicUrl(path)
  const avatarUrl = `${data.publicUrl}?v=${Date.now()}`
  const { error: updateError } = await supabase!.from('profiles').update({ avatar_url: avatarUrl }).eq('id', userId)
  if (updateError) throw new Error('Não foi possível salvar a foto de perfil.')
  return avatarUrl
}

/** Supabase mode only — clears the profile's avatar_url. Leaves the file itself in storage
 * (a harmless orphan under that user's own path, overwritten on their next upload anyway)
 * rather than tracking the exact extension just to delete it. */
export async function removeAvatar(userId: string): Promise<void> {
  const { error } = await supabase!.from('profiles').update({ avatar_url: null }).eq('id', userId)
  if (error) throw new Error('Não foi possível remover a foto de perfil.')
}

/** Supabase mode only — deletes the company and every member's real Auth account, not just their profile. */
export async function deleteCompany(companyId: string) {
  const { error } = await supabase!.rpc('delete_company_and_users', { target_company_id: companyId })
  if (error) throw new Error('Não foi possível excluir a empresa.')
}

/** Supabase mode only — removes the caller's own profile but keeps their Auth login, unlike deleteUser(). */
export async function leaveCompany() {
  const { error } = await supabase!.rpc('leave_company')
  if (error) throw new Error('Não foi possível sair da empresa.')
}
