-- Simplifies support ticket status from 3 states (aberto/resolvido/encerrado) down to 2
-- (aberto/encerrado) - the 3-state version left it unclear who was supposed to do what
-- ("resolvido" was an in-between state only the maintenance side could set, but only the ticket
-- owner could actually close, and there was no way to un-confuse a resolved-but-still-being-
-- discussed ticket). New model: either side closes it when they think it's done; replying to a
-- closed ticket reopens it automatically, no separate "reabrir" action needed.

update public.support_tickets set status = 'aberto' where status = 'resolvido';

alter table public.support_tickets drop constraint if exists support_tickets_status_check;
alter table public.support_tickets
  add constraint support_tickets_status_check check (status in ('aberto', 'encerrado'));

-- Replaces close_own_support_ticket (owner-only, resolvido->encerrado only) with a symmetric
-- toggle either the ticket's own user or any maintenance account can call.
drop function if exists public.close_own_support_ticket(uuid);

create or replace function public.set_support_ticket_status(p_ticket_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_status not in ('aberto', 'encerrado') then
    raise exception 'Status inválido.';
  end if;
  update public.support_tickets
  set status = p_status
  where id = p_ticket_id
    and (user_id = auth.uid() or public.is_maintenance_account());
end;
$$;

grant execute on function public.set_support_ticket_status(uuid, text) to authenticated;

-- Messages can now be inserted on a closed ticket too (that's how it reopens) - drop the old
-- status<>'encerrado' guard from the insert check.
drop policy if exists "support_messages_insert" on public.support_messages;
create policy "support_messages_insert" on public.support_messages
  for insert with check (
    exists (
      select 1 from public.support_tickets t
      where t.id = ticket_id and (t.user_id = auth.uid() or public.is_praxis_owner())
    )
    and (
      (is_owner and public.is_praxis_owner())
      or (not is_owner and sender_id = auth.uid())
    )
  );

create or replace function public.reopen_ticket_on_reply()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.support_tickets set status = 'aberto' where id = NEW.ticket_id and status = 'encerrado';
  return NEW;
end;
$$;

drop trigger if exists trg_reopen_ticket_on_reply on public.support_messages;
create trigger trg_reopen_ticket_on_reply
  after insert on public.support_messages
  for each row execute function public.reopen_ticket_on_reply();
