-- Gestão de Usuários needs: gestor (not just admin) can manage teammates,
-- a delete policy on profiles, and an insert policy on invite_codes so
-- admin/gestor can generate invite codes for their own company.

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
  for update using (
    id = auth.uid()
    or (
      company_id = public.current_company_id()
      and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'gestor'))
    )
  );

drop policy if exists "profiles_delete_by_admin_or_gestor" on public.profiles;
create policy "profiles_delete_by_admin_or_gestor" on public.profiles
  for delete using (
    company_id = public.current_company_id()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'gestor'))
  );

alter table public.invite_codes alter column company_id set default public.current_company_id();

drop policy if exists "invite_codes_insert_by_admin_or_gestor" on public.invite_codes;
create policy "invite_codes_insert_by_admin_or_gestor" on public.invite_codes
  for insert with check (
    company_id = public.current_company_id()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'gestor'))
  );
