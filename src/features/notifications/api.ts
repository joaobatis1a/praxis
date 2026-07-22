import { isSupabase } from '../../lib/dataSource'
import { supabase } from '../../lib/supabaseClient'
import { notifications as initialNotifications, type AppNotification, type NotificationType } from '../../mocks/notifications'
import type { Role } from '../auth/types'

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

let notifications: AppNotification[] = structuredClone(initialNotifications)
let disabledTypesByUser: Record<string, NotificationType[]> = {}
let dismissedByUser: Record<string, string[]> = {}

export interface NotifyInput {
  type: NotificationType
  title: string
  description: string
  targetUserId?: string
  targetDepartment?: string
  targetRoles?: Role[]
  linkTo?: string
}

export interface NotificationRecipient {
  id: string
  role: Role
  department?: string
}

interface NotificationRow {
  id: string
  type: NotificationType
  title: string
  description: string
  created_at: string
  target_user_id: string | null
  target_department: string | null
  target_roles: Role[] | null
  link_to: string | null
}

function rowToNotification(row: NotificationRow, readBy: string[]): AppNotification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    createdAt: row.created_at,
    readBy,
    targetUserId: row.target_user_id ?? undefined,
    targetDepartment: row.target_department ?? undefined,
    targetRoles: row.target_roles ?? undefined,
    linkTo: row.link_to ?? undefined,
  }
}

/** Fire-and-forget: called by other feature api.ts modules when a notify-worthy event happens. */
export async function notify(input: NotifyInput): Promise<void> {
  if (isSupabase) {
    await supabase!.from('notifications').insert({
      type: input.type,
      title: input.title,
      description: input.description,
      target_user_id: input.targetUserId ?? null,
      target_department: input.targetDepartment ?? null,
      target_roles: input.targetRoles ?? null,
      link_to: input.linkTo ?? null,
    })
    return
  }

  const newNotification: AppNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    readBy: [],
    ...input,
  }
  notifications = [newNotification, ...notifications]
}

function isRelevant(n: AppNotification, user: NotificationRecipient) {
  if (n.targetUserId) return n.targetUserId === user.id
  if (n.targetDepartment && n.targetRoles) {
    return n.targetDepartment === user.department || n.targetRoles.includes(user.role)
  }
  if (n.targetDepartment) return n.targetDepartment === user.department
  if (n.targetRoles) return n.targetRoles.includes(user.role)
  return true
}

export async function listNotifications(user: NotificationRecipient): Promise<(AppNotification & { read: boolean })[]> {
  if (isSupabase) {
    const disabled = await getDisabledTypes(user.id)
    const { data, error } = await supabase!
      .from('notifications')
      .select('*, notification_reads(user_id), notification_dismissals(user_id)')
      .order('created_at', { ascending: false })
    if (error || !data) return []
    return (data as (NotificationRow & { notification_reads: { user_id: string }[]; notification_dismissals: { user_id: string }[] })[])
      .filter((row) => !disabled.includes(row.type) && row.notification_dismissals.length === 0)
      .map((row) => {
        const read = row.notification_reads.length > 0
        return { ...rowToNotification(row, read ? [user.id] : []), read }
      })
  }

  const disabled = disabledTypesByUser[user.id] ?? []
  const dismissed = dismissedByUser[user.id] ?? []
  const relevant = notifications
    .filter((n) => isRelevant(n, user) && !disabled.includes(n.type) && !dismissed.includes(n.id))
    .map((n) => ({ ...n, read: n.readBy.includes(user.id) }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return delay(relevant)
}

export async function getDisabledTypes(userId: string): Promise<NotificationType[]> {
  if (isSupabase) {
    const { data, error } = await supabase!.from('notification_preferences').select('type')
    if (error || !data) return []
    return (data as { type: NotificationType }[]).map((r) => r.type)
  }
  return delay(disabledTypesByUser[userId] ?? [])
}

export async function setTypeEnabled(userId: string, type: NotificationType, enabled: boolean): Promise<NotificationType[]> {
  if (isSupabase) {
    if (enabled) {
      const { error } = await supabase!.from('notification_preferences').delete().eq('type', type)
      if (error) throw new Error('Não foi possível atualizar a preferência.')
    } else {
      const { error } = await supabase!
        .from('notification_preferences')
        .upsert({ type }, { onConflict: 'user_id,type', ignoreDuplicates: true })
      if (error) throw new Error('Não foi possível atualizar a preferência.')
    }
    return getDisabledTypes(userId)
  }

  const current = disabledTypesByUser[userId] ?? []
  disabledTypesByUser[userId] = enabled ? current.filter((t) => t !== type) : [...new Set([...current, type])]
  return delay(disabledTypesByUser[userId])
}

export async function markAsRead(id: string, userId: string): Promise<void> {
  if (isSupabase) {
    const { error } = await supabase!
      .from('notification_reads')
      .upsert({ notification_id: id }, { onConflict: 'notification_id,user_id', ignoreDuplicates: true })
    if (error) throw new Error('Não foi possível marcar como lida.')
    return
  }

  const n = notifications.find((x) => x.id === id)
  if (n && !n.readBy.includes(userId)) n.readBy.push(userId)
  return delay(undefined)
}

export async function markAllAsRead(ids: string[], userId: string): Promise<void> {
  if (ids.length === 0) return

  if (isSupabase) {
    const { error } = await supabase!
      .from('notification_reads')
      .upsert(
        ids.map((id) => ({ notification_id: id })),
        { onConflict: 'notification_id,user_id', ignoreDuplicates: true },
      )
    if (error) throw new Error('Não foi possível marcar como lidas.')
    return
  }

  for (const id of ids) {
    const n = notifications.find((x) => x.id === id)
    if (n && !n.readBy.includes(userId)) n.readBy.push(userId)
  }
  return delay(undefined)
}

/** Per-user dismiss — hides the notification from this user's list only. A notification targeted
 * at a whole department/role is one shared row read by many people, so this can't be a real
 * delete of the `notifications` row itself without removing it for everyone else too. */
export async function dismissNotification(id: string, userId: string): Promise<void> {
  if (isSupabase) {
    const { error } = await supabase!
      .from('notification_dismissals')
      .upsert({ notification_id: id }, { onConflict: 'notification_id,user_id', ignoreDuplicates: true })
    if (error) throw new Error('Não foi possível apagar a notificação.')
    return
  }

  const current = dismissedByUser[userId] ?? []
  dismissedByUser[userId] = current.includes(id) ? current : [...current, id]
  return delay(undefined)
}

export async function dismissAllNotifications(ids: string[], userId: string): Promise<void> {
  if (ids.length === 0) return

  if (isSupabase) {
    const { error } = await supabase!
      .from('notification_dismissals')
      .upsert(
        ids.map((id) => ({ notification_id: id })),
        { onConflict: 'notification_id,user_id', ignoreDuplicates: true },
      )
    if (error) throw new Error('Não foi possível limpar as notificações.')
    return
  }

  const current = dismissedByUser[userId] ?? []
  dismissedByUser[userId] = [...new Set([...current, ...ids])]
  return delay(undefined)
}
