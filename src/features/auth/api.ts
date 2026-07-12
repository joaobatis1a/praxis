import { mockUsers } from '../../mocks/users'
import type { AuthUser } from './types'

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function loginRequest(email: string, password: string): Promise<AuthUser> {
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
