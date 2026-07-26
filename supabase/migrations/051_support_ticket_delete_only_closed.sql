-- "Excluir" on a support ticket should only be possible once it's closed (encerrado) — the UI now
-- hides the button otherwise, but that alone doesn't stop a direct RPC call, so enforce it
-- server-side too.

create or replace function public.hide_support_ticket(p_ticket_id uuid, p_as_admin boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.support_tickets where id = p_ticket_id and status = 'encerrado') then
    raise exception 'Só é possível excluir um chamado encerrado.';
  end if;

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
