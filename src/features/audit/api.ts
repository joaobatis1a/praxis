import { isSupabase } from '../../lib/dataSource'
import { supabase } from '../../lib/supabaseClient'
import { auditLog as mockAuditLog } from '../../mocks/auditLog'
import { formatRelativeTime } from '../dashboard/api'

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export type AuditAction =
  | 'created'
  | 'updated'
  | 'published'
  | 'deleted'
  | 'role_changed'
  | 'department_changed'
  | 'deactivated'
  | 'reactivated'

export type AuditEntityType = 'procedure' | 'document' | 'notice' | 'user'

export interface AuditLogEntry {
  id: string
  actorName: string
  action: AuditAction
  entityType: AuditEntityType
  entityLabel: string
  metadata: { from?: string; to?: string } | null
  time: string
}

interface AuditLogRow {
  id: string
  actor_name: string
  action: AuditAction
  entity_type: AuditEntityType
  entity_label: string
  metadata: { from?: string; to?: string } | null
  created_at: string
}

const PAGE_SIZE = 50

export async function listAuditLog(offset = 0): Promise<{ entries: AuditLogEntry[]; hasMore: boolean }> {
  if (isSupabase) {
    const { data, error } = await supabase!
      .from('audit_log')
      .select('id, actor_name, action, entity_type, entity_label, metadata, created_at')
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)
    if (error || !data) return { entries: [], hasMore: false }
    const rows = data as AuditLogRow[]
    return {
      entries: rows.map((r) => ({
        id: r.id,
        actorName: r.actor_name,
        action: r.action,
        entityType: r.entity_type,
        entityLabel: r.entity_label,
        metadata: r.metadata,
        time: formatRelativeTime(r.created_at),
      })),
      hasMore: rows.length === PAGE_SIZE,
    }
  }

  const slice = mockAuditLog.slice(offset, offset + PAGE_SIZE)
  return delay({
    entries: slice.map((e) => ({
      id: e.id,
      actorName: e.actorName,
      action: e.action as AuditAction,
      entityType: e.entityType as AuditEntityType,
      entityLabel: e.entityLabel,
      metadata: e.metadata ?? null,
      time: formatRelativeTime(e.createdAt),
    })),
    hasMore: offset + PAGE_SIZE < mockAuditLog.length,
  })
}
