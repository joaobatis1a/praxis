-- Removing a teammate from the company should unlink them, not destroy their login —
-- otherwise they'd have to create a brand new account just to ever join another company
-- (or, if they're the Praxis owner being removed from their own company, they'd be locked
-- out entirely with no login left to fall back on). Mirrors leave_company() (020) but for
-- an admin/gestor acting on someone else instead of the caller acting on themself.
-- delete_user_and_auth (015) is untouched — it stays as-is for "Excluir minha conta", which
-- is an explicit self-account-deletion request and should still remove the login too.
create or replace function public.remove_user_from_company(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid := auth.uid();
  caller_company_id uuid;
  caller_role public.app_role;
  target_company_id uuid;
begin
  if target_user_id = caller_id then
    raise exception 'Use leave_company to remove yourself.';
  end if;

  select company_id, role into caller_company_id, caller_role
  from public.profiles where id = caller_id;

  select company_id into target_company_id
  from public.profiles where id = target_user_id;

  if target_company_id is null or target_company_id <> caller_company_id then
    raise exception 'User not found in your company.';
  end if;

  if caller_role not in ('admin', 'gestor') then
    raise exception 'Not authorized to remove this user.';
  end if;

  delete from public.profiles where id = target_user_id;
end;
$$;

grant execute on function public.remove_user_from_company(uuid) to authenticated;
