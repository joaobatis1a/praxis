export interface Company {
  name: string
  /** only populated when VITE_DATA_SOURCE=supabase — mock mode has no real file storage */
  logoUrl?: string | null
}

export const company: Company = {
  name: 'Praxis Demo',
}
