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
