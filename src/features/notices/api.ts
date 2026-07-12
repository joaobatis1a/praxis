import { notices as initialNotices, type Notice, type NoticeRecipientType } from '../../mocks/notices'
import { notify } from '../notifications/api'

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

let notices: Notice[] = structuredClone(initialNotices)

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

export function listNotices(): Promise<Notice[]> {
  return delay([...notices])
}

export function createNotice(input: CreateNoticeInput): Promise<Notice> {
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

export function markAsRead(id: string): Promise<Notice> {
  const notice = notices.find((n) => n.id === id)
  if (!notice) throw new Error('Aviso não encontrado')
  notice.read = true
  return delay(notice)
}

export function deleteNotice(id: string): Promise<void> {
  notices = notices.filter((n) => n.id !== id)
  return delay(undefined)
}
