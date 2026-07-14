// Kept in sync with the `is_praxis_owner()` check in supabase/migrations/019_support_tickets.sql —
// there's no cross-company "super admin" role in the app yet, so the owner is matched by login email.
export const PRAXIS_OWNER_EMAIL = 'pessoalba1is1a@gmail.com'

export function isPraxisOwner(email?: string | null): boolean {
  return email === PRAXIS_OWNER_EMAIL
}
