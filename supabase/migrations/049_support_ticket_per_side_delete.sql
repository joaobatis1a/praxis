-- "Excluir" on a support ticket used to be a hard DELETE, which removed the ticket for both
-- sides no matter who clicked it (the sender's own record disappeared from the maintenance
-- inbox too, and vice versa). Replaces it with a per-viewer hide: each side can clear the ticket
-- from their own list independently; the row is only actually deleted once both sides have hidden it.

alter table public.support_tickets
  add column if not exists hidden_by_user boolean not null default false,
  add column if not exists hidden_by_admin boolean not null default false;

drop policy if exists "support_tickets_delete_own_or_owner" on public.support_tickets;

create function public.hide_support_ticket(p_ticket_id uuid, p_as_admin boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_as_admin then
    if not public.is_maintenance_account() then
      raise exception 'Not authorized.';
    end if;
    update public.support_tickets set hidden_by_admin = true where id = p_ticket_id;
  else
    update public.support_tickets set hidden_by_user = true where id = p_ticket_id and user_id = auth.uid();
  end if;

  delete from public.support_tickets
  where id = p_ticket_id and hidden_by_user and hidden_by_admin;
end;
$$;

grant execute on function public.hide_support_ticket(uuid, boolean) to authenticated;
