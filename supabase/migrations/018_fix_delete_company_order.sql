-- Fixes 017: companies has a created_by column (added in an earlier RLS fix,
-- referencing auth.users) that isn't ON DELETE CASCADE. Deleting auth.users
-- rows first (017's order) violated that FK whenever the target user was the
-- company's creator. Deleting the company row first clears that reference —
-- then deleting the members' auth.users rows is safe (and still cascades
-- their now-already-deleted profiles harmlessly).
create or replace function public.delete_company_and_users(target_company_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid := auth.uid();
  caller_company_id uuid;
  caller_role public.app_role;
  member_ids uuid[];
begin
  select company_id, role into caller_company_id, caller_role
  from public.profiles where id = caller_id;

  if caller_company_id is null or caller_company_id <> target_company_id or caller_role <> 'admin' then
    raise exception 'Not authorized to delete this company.';
  end if;

  select array_agg(id) into member_ids from public.profiles where company_id = target_company_id;

  delete from public.companies where id = target_company_id;
  delete from auth.users where id = any(member_ids);
end;
$$;

grant execute on function public.delete_company_and_users(uuid) to authenticated;
