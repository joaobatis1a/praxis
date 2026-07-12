import { teamMembers } from '../mocks/teamMembers'
import type { AuthUser } from '../features/auth/types'
import { isSupabase } from './dataSource'

/** Mock mode has no `department` on AuthUser — look it up via the teamMembers mock instead. */
export function getUserDepartment(user: AuthUser | null | undefined): string | undefined {
  if (!user) return undefined
  if (isSupabase) return user.department
  return teamMembers.find((m) => m.id === user.id)?.department
}
