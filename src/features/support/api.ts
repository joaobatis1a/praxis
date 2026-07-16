import { isSupabase } from '../../lib/dataSource'
import { supabase } from '../../lib/supabaseClient'
import { mockSupportTickets } from '../../mocks/supportTickets'
import type { AuthUser } from '../auth/types'
import type { SupportMessage, SupportTicket, SupportTicketStatus } from './types'

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

interface TicketRow {
  id: string
  user_id: string
  user_name: string
  user_email: string
  status: SupportTicketStatus
  created_at: string
}

interface MessageRow {
  id: string
  ticket_id: string
  sender_id: string | null
  sender_name: string
  is_owner: boolean
  message: string
  created_at: string
}

function rowToMessage(row: MessageRow): SupportMessage {
  return {
    id: row.id,
    ticketId: row.ticket_id,
    senderId: row.sender_id,
    senderName: row.sender_name,
    isOwner: row.is_owner,
    message: row.message,
    createdAt: row.created_at,
  }
}

function rowToTicket(row: TicketRow, messages: SupportMessage[]): SupportTicket {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    userEmail: row.user_email,
    status: row.status,
    createdAt: row.created_at,
    messages,
  }
}

async function attachMessages(rows: TicketRow[]): Promise<SupportTicket[]> {
  if (rows.length === 0) return []
  const { data, error } = await supabase!
    .from('support_messages')
    .select('*')
    .in('ticket_id', rows.map((r) => r.id))
    .order('created_at', { ascending: true })
  const messages = error || !data ? [] : (data as MessageRow[]).map(rowToMessage)
  return rows.map((row) => rowToTicket(row, messages.filter((m) => m.ticketId === row.id)))
}

export async function createTicket(user: AuthUser, message: string): Promise<SupportTicket> {
  if (isSupabase) {
    const { data, error } = await supabase!
      .from('support_tickets')
      .insert({ user_name: user.name, user_email: user.email })
      .select()
      .single()
    if (error || !data) throw new Error('Não foi possível enviar sua mensagem.')
    const ticketRow = data as TicketRow

    const { data: msgData, error: msgError } = await supabase!
      .from('support_messages')
      .insert({ ticket_id: ticketRow.id, sender_id: user.id, sender_name: user.name, is_owner: false, message })
      .select()
      .single()
    if (msgError || !msgData) throw new Error('Não foi possível enviar sua mensagem.')
    return rowToTicket(ticketRow, [rowToMessage(msgData as MessageRow)])
  }

  await delay(400)
  const id = `ticket-${Date.now()}`
  const now = new Date().toISOString()
  const ticket: SupportTicket = {
    id,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    status: 'aberto',
    createdAt: now,
    messages: [{ id: `msg-${Date.now()}`, ticketId: id, senderId: user.id, senderName: user.name, isOwner: false, message, createdAt: now }],
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
    return attachMessages(data as TicketRow[])
  }

  await delay(300)
  return mockSupportTickets.filter((t) => t.userId === userId)
}

export async function listAllTickets(): Promise<SupportTicket[]> {
  if (isSupabase) {
    const { data, error } = await supabase!.from('support_tickets').select('*').order('created_at', { ascending: false })
    if (error || !data) return []
    return attachMessages(data as TicketRow[])
  }

  await delay(300)
  return [...mockSupportTickets]
}

export async function sendMessage(ticketId: string, sender: { id: string; name: string }, message: string, isOwner: boolean): Promise<SupportMessage> {
  if (isSupabase) {
    const { data, error } = await supabase!
      .from('support_messages')
      .insert({ ticket_id: ticketId, sender_id: sender.id, sender_name: sender.name, is_owner: isOwner, message })
      .select()
      .single()
    if (error || !data) throw new Error('Não foi possível enviar a mensagem.')
    return rowToMessage(data as MessageRow)
  }

  await delay(250)
  const ticket = mockSupportTickets.find((t) => t.id === ticketId)
  if (!ticket) throw new Error('Chamado não encontrado.')
  const msg: SupportMessage = {
    id: `msg-${Date.now()}`,
    ticketId,
    senderId: sender.id,
    senderName: sender.name,
    isOwner,
    message,
    createdAt: new Date().toISOString(),
  }
  ticket.messages.push(msg)
  return msg
}

export async function setTicketStatus(ticketId: string, status: SupportTicketStatus): Promise<void> {
  if (isSupabase) {
    const { error } = await supabase!.from('support_tickets').update({ status }).eq('id', ticketId)
    if (error) throw new Error('Não foi possível atualizar o status.')
    return
  }

  await delay(200)
  const ticket = mockSupportTickets.find((t) => t.id === ticketId)
  if (ticket) ticket.status = status
}

export async function closeOwnTicket(ticketId: string): Promise<void> {
  if (isSupabase) {
    const { error } = await supabase!.rpc('close_own_support_ticket', { p_ticket_id: ticketId })
    if (error) throw new Error('Não foi possível encerrar o chamado.')
    return
  }

  await delay(200)
  const ticket = mockSupportTickets.find((t) => t.id === ticketId)
  if (ticket && ticket.status === 'resolvido') ticket.status = 'encerrado'
}

export async function deleteTicket(ticketId: string): Promise<void> {
  if (isSupabase) {
    const { error } = await supabase!.from('support_tickets').delete().eq('id', ticketId)
    if (error) throw new Error('Não foi possível excluir o chamado.')
    return
  }

  await delay(200)
  const idx = mockSupportTickets.findIndex((t) => t.id === ticketId)
  if (idx !== -1) mockSupportTickets.splice(idx, 1)
}
