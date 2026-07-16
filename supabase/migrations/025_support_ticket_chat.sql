-- Turns each support ticket into a real multi-message conversation instead of a single
-- message + single reply, adds a "resolvido" status before a ticket can be closed
-- (aberto -> resolvido -> encerrado), and allows deleting tickets.

create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete set null,
  sender_name text not null,
  is_owner boolean not null default false,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.support_messages enable row level security;

create policy "support_messages_select" on public.support_messages
  for select using (
    exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and (t.user_id = auth.uid() or public.is_praxis_owner())
    )
  );

create policy "support_messages_insert" on public.support_messages
  for insert with check (
    exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id
        and t.status <> 'encerrado'
        and (t.user_id = auth.uid() or public.is_praxis_owner())
    )
    and (
      (is_owner and public.is_praxis_owner())
      or (not is_owner and sender_id = auth.uid())
    )
  );

-- backfill: move each ticket's original message + reply into the new messages table
insert into public.support_messages (ticket_id, sender_id, sender_name, is_owner, message, created_at)
select id, user_id, user_name, false, message, created_at from public.support_tickets;

insert into public.support_messages (ticket_id, sender_name, is_owner, message, created_at)
select id, 'Suporte Praxis', true, reply, coalesce(replied_at, created_at)
from public.support_tickets
where reply is not null;

alter table public.support_tickets drop column message;
alter table public.support_tickets drop column reply;
alter table public.support_tickets drop column replied_at;

alter table public.support_tickets drop constraint if exists support_tickets_status_check;
update public.support_tickets set status = 'resolvido' where status = 'respondido';
alter table public.support_tickets
  add constraint support_tickets_status_check check (status in ('aberto', 'resolvido', 'encerrado'));

create policy "support_tickets_delete_own_or_owner" on public.support_tickets
  for delete using (user_id = auth.uid() or public.is_praxis_owner());

-- Lets a user close their own ticket once the owner marked it resolved, without granting a
-- bare UPDATE policy that would also let them rewrite other columns (status included, to any value).
create function public.close_own_support_ticket(p_ticket_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.support_tickets
  set status = 'encerrado'
  where id = p_ticket_id and user_id = auth.uid() and status = 'resolvido';
end;
$$;

grant execute on function public.close_own_support_ticket(uuid) to authenticated;
