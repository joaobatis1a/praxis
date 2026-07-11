export type Role = 'admin' | 'gestor' | 'colaborador'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
}
