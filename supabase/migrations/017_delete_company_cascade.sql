-- Deleting a company via the Table Editor cascades `profiles` and every
-- other company_id-scoped table (already `on delete cascade`), but leaves
-- every member's real Supabase Auth account behind — the exact same
-- orphaned-login problem delete_user_and_auth (migration 015/016) fixed
-- for a single user, just at company scale. This function deletes every
-- member's auth.users row first (which cascades their profile for free),
-- then deletes the company row itself (which cascades everything else:
-- procedures, avisos, biblioteca, departments, invite_codes, etc.).
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
begin
  select company_id, role into caller_company_id, caller_role
  from public.profiles where id = caller_id;

  if caller_company_id is null or caller_company_id <> target_company_id or caller_role <> 'admin' then
    raise exception 'Not authorized to delete this company.';
  end if;

  delete from auth.users
  where id in (select id from public.profiles where company_id = target_company_id);

  delete from public.companies where id = target_company_id;
end;
$$;

grant execute on function public.delete_company_and_users(uuid) to authenticated;
