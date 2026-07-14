export interface SupportTicket {
  id: string
  userId: string
  userName: string
  userEmail: string
  message: string
  reply: string | null
  status: 'aberto' | 'respondido'
  createdAt: string
  repliedAt: string | null
}
