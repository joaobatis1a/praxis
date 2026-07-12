import { teamMembers, type TeamMember, type UserStatus } from '../../mocks/teamMembers'
import type { Role } from '../auth/types'
import { notify } from '../notifications/api'

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

let members = [...teamMembers]

export function listUsers() {
  return delay([...members])
}

export interface CreateUserInput {
  name: string
  email: string
  role: Role
  department: string
}

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

export function setUserStatus(id: string, status: UserStatus) {
  members = members.map((m) => (m.id === id ? { ...m, status } : m))
  return delay(members.find((m) => m.id === id)!)
}

export function updateUser(id: string, input: CreateUserInput) {
  members = members.map((m) => (m.id === id ? { ...m, ...input } : m))
  return delay(members.find((m) => m.id === id)!)
}

export function deleteUser(id: string) {
  members = members.filter((m) => m.id !== id)
  return delay(undefined)
}
