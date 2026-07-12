import { isSupabase } from '../../lib/dataSource'
import { supabase } from '../../lib/supabaseClient'
import { notices as initialNotices, type Notice, type NoticeRecipientType } from '../../mocks/notices'
import { notify } from '../notifications/api'

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

let notices: Notice[] = structuredClone(initialNotices)

interface NoticeRow {
  id: string
  procedure_id: string
  procedure_title: string
  description: string
  author_id: string
  author_name: string
  recipient_type: NoticeRecipientType
  recipient_id: string
  recipient_label: string
  read: boolean
  created_at: string
}

function rowToNotice(row: NoticeRow): Notice {
  return {
    id: row.id,
    procedureId: row.procedure_id,
    procedureTitle: row.procedure_title,
    description: row.description,
    authorId: row.author_id,
    authorName: row.author_name,
    recipientType: row.recipient_type,
    recipientId: row.recipient_id,
    recipientLabel: row.recipient_label,
    createdAt: row.created_at,
    read: row.read,
  }
}

export interface CreateNoticeInput {
  procedureId: string
  procedureTitle: string
  description: string
  authorId: string
  authorName: string
  recipientType: NoticeRecipientType
  recipientId: string
  recipientLabel: string
}

export async function listNotices(): Promise<Notice[]> {
  if (isSupabase) {
    const { data, error } = await supabase!.from('notices').select('*').order('created_at', { ascending: false })
    if (error || !data) throw new Error('Não foi possível carregar os avisos.')
    return (data as NoticeRow[]).map(rowToNotice)
  }
  return delay([...notices])
}

export async function createNotice(input: CreateNoticeInput): Promise<Notice> {
  if (isSupabase) {
    const { data, error } = await supabase!
      .from('notices')
      .insert({
        procedure_id: input.procedureId,
        procedure_title: input.procedureTitle,
        description: input.description,
        author_name: input.authorName,
        recipient_type: input.recipientType,
        recipient_id: input.recipientId,
        recipient_label: input.recipientLabel,
      })
      .select()
      .single()
    if (error || !data) throw new Error('Não foi possível criar o aviso.')
    const newNotice = rowToNotice(data as NoticeRow)
    notify({
      type: 'aviso',
      title: 'Novo aviso',
      description: `${input.authorName} enviou um aviso sobre "${input.procedureTitle}"`,
      ...(input.recipientType === 'user' ? { targetUserId: input.recipientId } : { targetDepartment: input.recipientId }),
      linkTo: '/avisos',
    })
    return newNotice
  }
  const newNotice: Notice = {
    id: `notice-${Date.now()}`,
    createdAt: new Date().toISOString(),
    read: false,
    ...input,
  }
  notices = [newNotice, ...notices]
  notify({
    type: 'aviso',
    title: 'Novo aviso',
    description: `${input.authorName} enviou um aviso sobre "${input.procedureTitle}"`,
    ...(input.recipientType === 'user' ? { targetUserId: input.recipientId } : { targetDepartment: input.recipientId }),
    linkTo: '/avisos',
  })
  return delay(newNotice)
}

export async function markAsRead(id: string): Promise<Notice> {
  if (isSupabase) {
    const { data, error } = await supabase!.from('notices').update({ read: true }).eq('id', id).select().single()
    if (error || !data) throw new Error('Não foi possível atualizar o aviso.')
    return rowToNotice(data as NoticeRow)
  }
  const notice = notices.find((n) => n.id === id)
  if (!notice) throw new Error('Aviso não encontrado')
  notice.read = true
  return delay(notice)
}

export async function deleteNotice(id: string): Promise<void> {
  if (isSupabase) {
    const { error } = await supabase!.from('notices').delete().eq('id', id)
    if (error) throw new Error('Não foi possível remover o aviso.')
    return
  }
  notices = notices.filter((n) => n.id !== id)
  return delay(undefined)
}
