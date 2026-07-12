import { isSupabase } from '../../lib/dataSource'
import { supabase } from '../../lib/supabaseClient'
import { teamMembers, type TeamMember, type UserStatus } from '../../mocks/teamMembers'
import type { Role } from '../auth/types'
import { notify } from '../notifications/api'

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

let members = [...teamMembers]

interface ProfileRow {
  id: string
  name: string
  email: string
  role: Role
  department: string | null
  status: UserStatus
}

function profileToTeamMember(profile: ProfileRow): TeamMember {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    department: profile.department ?? '',
    status: profile.status,
  }
}

export async function listUsers(): Promise<TeamMember[]> {
  if (isSupabase) {
    const { data, error } = await supabase!.from('profiles').select('*').order('name')
    if (error || !data) throw new Error('Não foi possível carregar os colaboradores.')
    return (data as ProfileRow[]).map(profileToTeamMember)
  }
  return delay([...members])
}

export interface CreateUserInput {
  name: string
  email: string
  role: Role
  department: string
}

// mock mode only — in Supabase mode, use generateInviteCode instead (see below)
export function createUser(input: CreateUserInput) {
  const newUser: TeamMember = {
    id: `usr-${Date.now()}`,
    status: 'ativo',
    ...input,
  }
  members = [newUser, ...members]
  notify({
    type: 'novo-usuario',
    title: 'Novo colaborador',
    description: `${newUser.name} entrou para a equipe de ${newUser.department}`,
    targetRoles: ['admin', 'gestor'],
    linkTo: '/usuarios',
  })
  return delay(newUser)
}

export interface GenerateInviteCodeInput {
  role: Role
  department: string
}

function randomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no ambiguous chars (0/O, 1/I)
  let code = ''
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return `${code.slice(0, 4)}-${code.slice(4)}`
}

/** Supabase mode: admin/gestor generates a code instead of creating the account directly — the invitee signs up themselves via "Tenho um código". */
export async function generateInviteCode(input: GenerateInviteCodeInput): Promise<string> {
  const code = randomCode()
  // company_id defaults to the caller's own company (public.current_company_id()) — see migration 005
  const { error } = await supabase!.from('invite_codes').insert({
    code,
    role: input.role,
    department: input.department,
  })
  if (error) throw new Error('Não foi possível gerar o código de convite.')
  return code
}

export async function setUserStatus(id: string, status: UserStatus) {
  if (isSupabase) {
    const { data, error } = await supabase!.from('profiles').update({ status }).eq('id', id).select().single()
    if (error || !data) throw new Error('Não foi possível atualizar o status.')
    return profileToTeamMember(data as ProfileRow)
  }
  members = members.map((m) => (m.id === id ? { ...m, status } : m))
  return delay(members.find((m) => m.id === id)!)
}

export async function updateUser(id: string, input: CreateUserInput) {
  if (isSupabase) {
    const { data, error } = await supabase!
      .from('profiles')
      .update({ name: input.name, role: input.role, department: input.department })
      .eq('id', id)
      .select()
      .single()
    if (error || !data) throw new Error('Não foi possível atualizar o colaborador.')
    return profileToTeamMember(data as ProfileRow)
  }
  members = members.map((m) => (m.id === id ? { ...m, ...input } : m))
  return delay(members.find((m) => m.id === id)!)
}

export async function deleteUser(id: string) {
  if (isSupabase) {
    const { error } = await supabase!.from('profiles').delete().eq('id', id)
    if (error) throw new Error('Não foi possível remover o colaborador.')
    return
  }
  members = members.filter((m) => m.id !== id)
  return delay(undefined)
}
