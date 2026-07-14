import { isSupabase } from '../../lib/dataSource'
import { supabase } from '../../lib/supabaseClient'
import { mockSupportTickets } from '../../mocks/supportTickets'
import type { AuthUser } from '../auth/types'
import type { SupportTicket } from './types'

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

interface TicketRow {
  id: string
  user_id: string
  user_name: string
  user_email: string
  message: string
  reply: string | null
  status: 'aberto' | 'respondido'
  created_at: string
  replied_at: string | null
}

function rowToTicket(row: TicketRow): SupportTicket {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    userEmail: row.user_email,
    message: row.message,
    reply: row.reply,
    status: row.status,
    createdAt: row.created_at,
    repliedAt: row.replied_at,
  }
}

export async function createTicket(user: AuthUser, message: string): Promise<SupportTicket> {
  if (isSupabase) {
    const { data, error } = await supabase!
      .from('support_tickets')
      .insert({ user_name: user.name, user_email: user.email, message })
      .select()
      .single()
    if (error || !data) throw new Error('Não foi possível enviar sua mensagem.')
    return rowToTicket(data as TicketRow)
  }

  await delay(500)
  const ticket: SupportTicket = {
    id: `ticket-${Date.now()}`,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    message,
    reply: null,
    status: 'aberto',
    createdAt: new Date().toISOString(),
    repliedAt: null,
  }
  mockSupportTickets.unshift(ticket)
  return ticket
}

export async function listMyTickets(userId: string): Promise<SupportTicket[]> {
  if (isSupabase) {
    const { data, error } = await supabase!
      .from('support_tickets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error || !data) return []
    return (data as TicketRow[]).map(rowToTicket)
  }

  await delay(300)
  return mockSupportTickets.filter((t) => t.userId === userId)
}

export async function listAllTickets(): Promise<SupportTicket[]> {
  if (isSupabase) {
    const { data, error } = await supabase!.from('support_tickets').select('*').order('created_at', { ascending: false })
    if (error || !data) return []
    return (data as TicketRow[]).map(rowToTicket)
  }

  await delay(300)
  return [...mockSupportTickets]
}

export async function replyToTicket(ticketId: string, reply: string): Promise<SupportTicket> {
  if (isSupabase) {
    const { data, error } = await supabase!
      .from('support_tickets')
      .update({ reply, status: 'respondido', replied_at: new Date().toISOString() })
      .eq('id', ticketId)
      .select()
      .single()
    if (error || !data) throw new Error('Não foi possível enviar a resposta.')
    return rowToTicket(data as TicketRow)
  }

  await delay(300)
  const ticket = mockSupportTickets.find((t) => t.id === ticketId)
  if (!ticket) throw new Error('Ticket não encontrado.')
  ticket.reply = reply
  ticket.status = 'respondido'
  ticket.repliedAt = new Date().toISOString()
  return ticket
}
