export type SupportTicketStatus = 'aberto' | 'resolvido' | 'encerrado'

export interface SupportMessage {
  id: string
  ticketId: string
  senderId: string | null
  senderName: string
  isOwner: boolean
  message: string
  createdAt: string
}

export interface SupportTicket {
  id: string
  userId: string
  userName: string
  userEmail: string
  title: string
  status: SupportTicketStatus
  createdAt: string
  messages: SupportMessage[]
}
