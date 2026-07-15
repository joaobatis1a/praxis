export type Role = 'admin' | 'gestor' | 'colaborador'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
  /** only populated when VITE_DATA_SOURCE=supabase — mock mode looks this up separately via teamMembers */
  companyId?: string
  department?: string
  /** cross-device theme preference, only populated when VITE_DATA_SOURCE=supabase */
  theme?: 'light' | 'dark' | null
}
