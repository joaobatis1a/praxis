-- Two bugs in the reopen-on-reply flow from 052:
-- 1. Reopening a closed ticket never cleared hidden_by_user/hidden_by_admin (049) - so if whoever
--    hid it on their own side later got a reply reopening the ticket, it stayed invisible on
--    their side forever, even though it's an active conversation again.
-- 2. Nothing in the UI signals a reopen happened - add a system message both sides can see.
alter table public.support_messages add column if not exists is_system boolean not null default false;

create or replace function public.reopen_ticket_on_reply()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  was_closed boolean;
begin
  -- system messages (like the one this function itself inserts below) never trigger a reopen -
  -- without this guard the insert below would recurse into this same trigger
  if NEW.is_system then
    return NEW;
  end if;

  select (status = 'encerrado') into was_closed from public.support_tickets where id = NEW.ticket_id;

  if was_closed then
    update public.support_tickets
    set status = 'aberto', hidden_by_user = false, hidden_by_admin = false
    where id = NEW.ticket_id;

    insert into public.support_messages (ticket_id, sender_id, sender_name, sender_avatar_url, is_owner, message, is_system)
    values (NEW.ticket_id, null, 'Sistema', null, false, 'Chamado reaberto automaticamente.', true);
  end if;

  return NEW;
end;
$$;
