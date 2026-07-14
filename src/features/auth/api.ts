import { isSupabase } from '../../lib/dataSource'
import { supabase } from '../../lib/supabaseClient'
import { mockUsers } from '../../mocks/users'
import type { AuthUser, Role } from './types'

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
}

function profileToAuthUser(profile: ProfileRow): AuthUser {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    companyId: profile.company_id,
    department: profile.department ?? undefined,
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
  if (!(await isCompanyActive(profile.company_id))) {
    await supabase!.auth.signOut()
    throw new Error('Sua empresa foi desativada. Entre em contato com o suporte.')
  }
  return profileToAuthUser(profile)
}

export function loginWithGoogle() {
  return supabase!.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/login` },
  })
}

export function signupCompanyWithGoogle(companyName: string) {
  const params = new URLSearchParams({ oauthIntent: 'company', companyName })
  return supabase!.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/signup?${params.toString()}` },
  })
}

export function signupCodeWithGoogle(code: string) {
  const params = new URLSearchParams({ oauthIntent: 'code', inviteCode: code })
  return supabase!.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/signup?${params.toString()}` },
  })
}

interface GoogleSessionUser {
  id: string
  email?: string
  user_metadata?: Record<string, unknown>
}

/**
 * Called from AuthContext's SIGNED_IN handler when the URL carries an
 * `oauthIntent` — i.e. the user clicked "Continuar com Google" from the
 * signup page (company creation or invite-code redemption), not the login
 * page. Returns null if there's nothing to do (no intent in the URL).
 */
export async function completeGoogleSignup(user: GoogleSessionUser): Promise<AuthUser | null> {
  const params = new URLSearchParams(window.location.search)
  const intent = params.get('oauthIntent')
  if (!intent) return null

  // already has a profile (e.g. clicked "Criar empresa" but already has an account) — just log them in
  try {
    return await fetchOwnProfile(user.id)
  } catch {
    // no profile yet — fall through and create one below
  }

  const name = (user.user_metadata?.full_name as string) || (user.user_metadata?.name as string) || user.email || 'Usuário'
  const email = user.email ?? ''

  if (intent === 'company') {
    const companyName = params.get('companyName') ?? ''
    const { data: company, error: companyError } = await supabase!.from('companies').insert({ name: companyName }).select().single()
    if (companyError || !company) throw new Error('Não foi possível criar a empresa.')

    const { data: profile, error: profileError } = await supabase!
      .from('profiles')
      .insert({ id: user.id, company_id: company.id, name, email, role: 'admin' satisfies Role })
      .select()
      .single()
    if (profileError || !profile) throw new Error('Não foi possível criar seu perfil.')
    return profileToAuthUser(profile as ProfileRow)
  }

  if (intent === 'code') {
    const code = params.get('inviteCode') ?? ''
    const { data: redeemed, error: redeemError } = await supabase!.rpc('redeem_invite_code', { invite_code: code.trim() }).single()
    if (redeemError || !redeemed) throw new Error('Código inválido. Peça um novo código para o seu gestor.')

    const redeemedRow = redeemed as { company_id: string; role: Role; department: string | null; company_status: string }
    if (redeemedRow.company_status === 'inativo') throw new Error('Este convite pertence a uma empresa desativada.')

    const { data: profile, error: profileError } = await supabase!
      .from('profiles')
      .insert({
        id: user.id,
        company_id: redeemedRow.company_id,
        name,
        email,
        role: redeemedRow.role,
        department: redeemedRow.department,
      })
      .select()
      .single()
    if (profileError || !profile) throw new Error('Não foi possível criar seu perfil.')
    return profileToAuthUser(profile as ProfileRow)
  }

  return null
}

export async function loginRequest(email: string, password: string): Promise<AuthUser> {
  if (isSupabase) {
    const { data, error } = await supabase!.auth.signInWithPassword({ email, password })
    if (error || !data.user) throw new Error('E-mail ou senha inválidos.')
    return fetchOwnProfile(data.user.id)
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

export async function signupCompanyRequest(input: SignupCompanyInput): Promise<AuthUser> {
  if (isSupabase) {
    const { data: signUpData, error: signUpError } = await supabase!.auth.signUp({
      email: input.email,
      password: input.password,
    })
    if (signUpError || !signUpData.user) throw new Error(signUpError?.message ?? 'Não foi possível criar sua conta.')

    const { data: company, error: companyError } = await supabase!
      .from('companies')
      .insert({ name: input.companyName })
      .select()
      .single()
    if (companyError || !company) throw new Error('Não foi possível criar a empresa.')

    const { data: profile, error: profileError } = await supabase!
      .from('profiles')
      .insert({
        id: signUpData.user.id,
        company_id: company.id,
        name: input.name,
        email: input.email,
        role: 'admin' satisfies Role,
      })
      .select()
      .single()
    if (profileError || !profile) throw new Error('Não foi possível criar seu perfil.')

    return profileToAuthUser(profile as ProfileRow)
  }

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
