-- Fix: a re-created profile (same email, new profile id — e.g. removed then re-invited/re-signed-up)
-- inherited the company's entire historical notifications/avisos/atividade feed, not just what
-- happens after they (re)joined. All three were scoped only by company/department/role, with no
-- lower bound on created_at relative to when this profile row itself was created.

create or replace function public.current_user_joined_at()
returns timestamptz
language sql
stable
security definer
set search_path = public
as $$
  select created_at from public.profiles where id = auth.uid()
$$;

drop policy if exists "notifications_select_relevant" on public.notifications;
create policy "notifications_select_relevant" on public.notifications
  for select using (
    company_id = public.current_company_id()
    and created_at >= public.current_user_joined_at()
    and (
      target_user_id = auth.uid()
      or (
        target_user_id is null
        and (
          (target_department is null and target_roles is null)
          or (target_department is not null and target_department = public.current_user_department())
          or (target_roles is not null and public.current_user_role() = any(target_roles))
        )
      )
    )
  );

drop policy if exists "notices_select_same_company" on public.notices;
create policy "notices_select_same_company" on public.notices
  for select using (
    company_id = public.current_company_id()
    and created_at >= public.current_user_joined_at()
  );

drop policy if exists "audit_log_select_admin_gestor" on public.audit_log;
create policy "audit_log_select_admin_gestor" on public.audit_log
  for select using (
    company_id = public.current_company_id()
    and created_at >= public.current_user_joined_at()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'gestor'))
  );
