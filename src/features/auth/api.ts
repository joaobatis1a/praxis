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

async function fetchOwnProfile(userId: string): Promise<AuthUser> {
  const { data, error } = await supabase!.from('profiles').select('*').eq('id', userId).single()
  if (error || !data) throw new Error('Não foi possível carregar seu perfil.')
  return profileToAuthUser(data as ProfileRow)
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

    const { data: signUpData, error: signUpError } = await supabase!.auth.signUp({
      email: input.email,
      password: input.password,
    })
    if (signUpError || !signUpData.user) throw new Error(signUpError?.message ?? 'Não foi possível criar sua conta.')

    const redeemedRow = redeemed as { company_id: string; role: Role; department: string | null }
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
