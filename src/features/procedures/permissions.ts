import { isSupabase } from '../../lib/dataSource'
import type { Procedure } from '../../mocks/procedures'
import type { AuthUser } from '../auth/types'

/** Mirrors the RLS rule in 059_procedures_edit_delete_author_or_admin.sql: the procedure's own
 * author, or an admin/gestor, can edit/delete/manage its attachments. Real mode compares by
 * `createdBy` (auth uid); mock mode has no such id, so it falls back to matching the author's
 * display name — the same string `handleFormSubmit` writes at creation time. */
export function canManageProcedure(procedure: Procedure, user: AuthUser | null): boolean {
  if (!user) return false
  if (user.role === 'admin' || user.role === 'gestor') return true
  if (isSupabase) return procedure.createdBy == null || procedure.createdBy === user.id
  return procedure.author === user.name
}
