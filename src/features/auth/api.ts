import { isSupabase } from '../../lib/dataSource'
import { supabase } from '../../lib/supabaseClient'
import { mockUsers } from '../../mocks/users'
import type { AuthUser, Role } from './types'

/** Thrown by fetchOwnProfile when the profile exists but its company was deactivated — distinct
 * from "no profile at all" so callers can surface this message instead of routing to the
 * join-a-company screen (the session is already signed out by the time this is thrown). */
export class CompanyInactiveError extends Error {}

/** Thrown by fetchOwnProfile when the profile exists but was set to 'inativo' by an admin —
 * handled the same way as CompanyInactiveError by every caller (surfaced as a message, session
 * already signed out), just with a different message. */
export class UserInactiveError extends Error {}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

interface ProfileRow {
  id: string
  company_id: string
  name: string
  email: string
  role: Role
  department: string | null
  status: 'ativo' | 'inativo'
  theme: 'light' | 'dark' | null
}

function profileToAuthUser(profile: ProfileRow): AuthUser {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    companyId: profile.company_id,
    department: profile.department ?? undefined,
    theme: profile.theme,
  }
}

async function isCompanyActive(companyId: string): Promise<boolean> {
  const { data, error } = await supabase!.from('companies').select('status').eq('id', companyId).single()
  if (error || !data) return false
  return (data as { status: string }).status !== 'inativo'
}

export async function fetchOwnProfile(userId: string): Promise<AuthUser> {
  const { data, error } = await supabase!.from('profiles').select('*').eq('id', userId).single()
  if (error || !data) throw new Error('Não foi possível carregar seu perfil.')
  const profile = data as ProfileRow
  if (profile.status === 'inativo') {
    await supabase!.auth.signOut()
    throw new UserInactiveError('Você está inativo nesta empresa.')
  }
  if (!(await isCompanyActive(profile.company_id))) {
    await supabase!.auth.signOut()
    throw new CompanyInactiveError('Sua empresa foi desativada. Entre em contato com o suporte.')
  }
  return profileToAuthUser(profile)
}

export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await supabase!.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/redefinir-senha`,
  })
  if (error) throw new Error('Não foi possível enviar o link de recuperação.')
}

export function loginWithGoogle() {
  return supabase!.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/login` },
  })
}

/** Redirects back to the signup page's code-redemption step (the only self-service path left —
 * see createCompanyForClient in features/maintenance/api.ts for how companies get created now). */
export function signupWithGoogle() {
  return supabase!.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/signup?oauthIntent=code` },
  })
}

export interface PendingGoogleUser {
  id: string
  email: string
  name: string
}

/** Same shape as PendingGoogleUser, reused for any authenticated-but-no-profile session
 * (e.g. after "Sair da empresa") — kept as a distinct name since it comes from a different
 * origin (plain login, not a fresh Google signup) even though the data and downstream
 * handling (finishGoogleCodeSignup) is identical. */
export type NoCompanySession = PendingGoogleUser

export function toPendingGoogleUser(user: { id: string; email?: string; user_metadata?: Record<string, unknown> }): PendingGoogleUser {
  return {
    id: user.id,
    email: user.email ?? '',
    name: (user.user_metadata?.full_name as string) || (user.user_metadata?.name as string) || user.email || 'Usuário',
  }
}

/** Redeems an invite code and attaches its company/role to an existing Supabase Auth user who
 * has no profile yet — used both by the post-Google signup mini-form and by the join-a-company
 * screen after "Sair da empresa". */
export async function finishGoogleCodeSignup(code: string, user: PendingGoogleUser): Promise<AuthUser> {
  const { data: redeemed, error: redeemError } = await supabase!.rpc('redeem_invite_code', { invite_code: code.trim() }).single()
  if (redeemError || !redeemed) throw new Error('Código inválido. Peça um novo código para o seu gestor.')

  const redeemedRow = redeemed as { company_id: string; role: Role; department: string | null; company_status: string }
  if (redeemedRow.company_status === 'inativo') throw new Error('Este convite pertence a uma empresa desativada.')

  const { data: profile, error: profileError } = await supabase!
    .from('profiles')
    .insert({
      id: user.id,
      company_id: redeemedRow.company_id,
      name: user.name,
      email: user.email,
      role: redeemedRow.role,
      department: redeemedRow.department,
    })
    .select()
    .single()
  if (profileError || !profile) throw new Error('Não foi possível criar seu perfil.')
  return profileToAuthUser(profile as ProfileRow)
}

/** Returns `null` when the login succeeded but there's no company profile — AuthContext then
 * routes to the Central de Suporte (owner) or the join-a-company screen (everyone else). A
 * CompanyInactiveError still propagates as a thrown error, since that's a distinct, actionable
 * message rather than a "pick a company" situation. */
export async function loginRequest(email: string, password: string): Promise<AuthUser | null> {
  if (isSupabase) {
    const { data, error } = await supabase!.auth.signInWithPassword({ email, password })
    if (error || !data.user) throw new Error('E-mail ou senha inválidos.')
    try {
      return await fetchOwnProfile(data.user.id)
    } catch (err) {
      if (err instanceof CompanyInactiveError || err instanceof UserInactiveError) throw err
      return null
    }
  }

  await delay(700)

  const match = mockUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
  )

  if (!match) {
    throw new Error('E-mail ou senha inválidos.')
  }

  const { password: _password, ...user } = match
  return user
}

export interface SignupCompanyInput {
  companyName: string
  name: string
  email: string
  password: string
}

/** Mock/demo mode only — the real deployment doesn't allow self-service company creation
 * anymore (see createCompanyForClient in features/maintenance/api.ts), so SignupPage never
 * calls this when isSupabase is true. */
export async function signupCompanyRequest(input: SignupCompanyInput): Promise<AuthUser> {
  await delay(700)

  if (mockUsers.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error('Já existe uma conta com esse e-mail.')
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    name: input.name,
    email: input.email,
    password: input.password,
    role: 'admin' as const,
  }
  mockUsers.push(newUser)

  const { password: _password, ...user } = newUser
  return user
}

// fixed demo code — invite codes will be generated for real once there's a backend (see project memory)
const DEMO_INVITE_CODE = 'PRAXIS2026'

export interface SignupWithCodeInput {
  name: string
  email: string
  password: string
  code: string
}

export async function signupWithCodeRequest(input: SignupWithCodeInput): Promise<AuthUser> {
  if (isSupabase) {
    const { data: redeemed, error: redeemError } = await supabase!
      .rpc('redeem_invite_code', { invite_code: input.code.trim() })
      .single()
    if (redeemError || !redeemed) throw new Error('Código inválido. Peça um novo código para o seu gestor.')

    const redeemedRow = redeemed as { company_id: string; role: Role; department: string | null; company_status: string }
    if (redeemedRow.company_status === 'inativo') {
      throw new Error('Este convite pertence a uma empresa desativada.')
    }

    const { data: signUpData, error: signUpError } = await supabase!.auth.signUp({
      email: input.email,
      password: input.password,
    })
    if (signUpError || !signUpData.user) throw new Error(signUpError?.message ?? 'Não foi possível criar sua conta.')
    const { data: profile, error: profileError } = await supabase!
      .from('profiles')
      .insert({
        id: signUpData.user.id,
        company_id: redeemedRow.company_id,
        name: input.name,
        email: input.email,
        role: redeemedRow.role,
        department: redeemedRow.department,
      })
      .select()
      .single()
    if (profileError || !profile) throw new Error('Não foi possível criar seu perfil.')

    return profileToAuthUser(profile as ProfileRow)
  }

  await delay(700)

  if (input.code.trim().toUpperCase() !== DEMO_INVITE_CODE) {
    throw new Error('Código inválido. Peça um novo código para o seu gestor.')
  }

  if (mockUsers.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error('Já existe uma conta com esse e-mail.')
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    name: input.name,
    email: input.email,
    password: input.password,
    role: 'colaborador' as const,
  }
  mockUsers.push(newUser)

  const { password: _password, ...user } = newUser
  return user
}
