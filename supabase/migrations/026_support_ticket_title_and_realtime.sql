-- Adds a required title to support tickets (shown in the ticket list instead of the last
-- message), and turns on Supabase Realtime for the Suporte tables so new messages, status
-- changes, and new/deleted tickets show up live instead of requiring a page reload.

alter table public.support_tickets add column if not exists title text;

update public.support_tickets t
set title = coalesce(
  (select message from public.support_messages m where m.ticket_id = t.id and m.is_owner = false order by m.created_at asc limit 1),
  'Sem título'
)
where title is null;

alter table public.support_tickets alter column title set not null;

alter publication supabase_realtime add table public.support_tickets;
alter publication supabase_realtime add table public.support_messages;
