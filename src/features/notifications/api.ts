import { notifications as initialNotifications, type AppNotification, type NotificationType } from '../../mocks/notifications'
import type { Role } from '../auth/types'

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

let notifications: AppNotification[] = structuredClone(initialNotifications)

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

/** Fire-and-forget: called by other feature api.ts modules when a notify-worthy event happens. */
export function notify(input: NotifyInput) {
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

export function listNotifications(user: NotificationRecipient): Promise<(AppNotification & { read: boolean })[]> {
  const relevant = notifications
    .filter((n) => isRelevant(n, user))
    .map((n) => ({ ...n, read: n.readBy.includes(user.id) }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return delay(relevant)
}

export function markAsRead(id: string, userId: string): Promise<void> {
  const n = notifications.find((x) => x.id === id)
  if (n && !n.readBy.includes(userId)) n.readBy.push(userId)
  return delay(undefined)
}

export function markAllAsRead(ids: string[], userId: string): Promise<void> {
  for (const id of ids) {
    const n = notifications.find((x) => x.id === id)
    if (n && !n.readBy.includes(userId)) n.readBy.push(userId)
  }
  return delay(undefined)
}
