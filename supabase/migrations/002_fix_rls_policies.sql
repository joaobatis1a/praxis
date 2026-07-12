-- Idempotent re-apply: safe to run even if some of this already exists.

create or replace function public.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id from public.profiles where id = auth.uid()
$$;

drop policy if exists "companies_select_own" on public.companies;
create policy "companies_select_own" on public.companies
  for select using (id = public.current_company_id());

drop policy if exists "companies_insert_any_authenticated" on public.companies;
create policy "companies_insert_any_authenticated" on public.companies
  for insert with check (auth.uid() is not null);

drop policy if exists "profiles_select_same_company" on public.profiles;
create policy "profiles_select_same_company" on public.profiles
  for select using (company_id = public.current_company_id());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
  for update using (
    id = auth.uid()
    or (
      company_id = public.current_company_id()
      and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
    )
  );

-- ground-truth check: run this after the block above and tell me what it returns
select tablename, policyname, cmd, with_check
from pg_policies
where tablename in ('companies', 'profiles')
order by tablename, policyname;
