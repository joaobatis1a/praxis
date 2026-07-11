import type { AuthUser } from '../features/auth/types'

export const mockUsers: Array<AuthUser & { password: string }> = [
  {
    id: 'usr-1',
    name: 'Ana Ferreira',
    email: 'admin@praxis.com',
    password: 'senha123',
    role: 'admin',
  },
  {
    id: 'usr-2',
    name: 'Carlos Nunes',
    email: 'gestor@praxis.com',
    password: 'senha123',
    role: 'gestor',
  },
  {
    id: 'usr-3',
    name: 'Beatriz Lima',
    email: 'colaborador@praxis.com',
    password: 'senha123',
    role: 'colaborador',
  },
]
