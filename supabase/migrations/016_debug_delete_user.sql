-- Diagnostic tweak to 015: return how many auth.users rows the DELETE
-- actually matched, so we can tell whether it's silently deleting 0 rows
-- (permission/RLS issue on auth.users) vs. something else going on.
create or replace function public.delete_user_and_auth(target_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid := auth.uid();
  caller_company_id uuid;
  caller_role public.app_role;
  target_company_id uuid;
  deleted_count integer;
begin
  select company_id, role into caller_company_id, caller_role
  from public.profiles where id = caller_id;

  select company_id into target_company_id
  from public.profiles where id = target_user_id;

  if target_company_id is null or target_company_id <> caller_company_id then
    raise exception 'User not found in your company.';
  end if;

  if target_user_id <> caller_id and caller_role not in ('admin', 'gestor') then
    raise exception 'Not authorized to delete this user.';
  end if;

  delete from auth.users where id = target_user_id;
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

grant execute on function public.delete_user_and_auth(uuid) to authenticated;
