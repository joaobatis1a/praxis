-- companies has RLS enabled (001/002_fix_rls_policies.sql) but NEVER had a DELETE policy in its
-- entire history — only select/insert/update. With RLS enabled and no matching policy, Postgres
-- silently matches zero rows for DELETE instead of raising an error, which is exactly the
-- "I select the rows, click delete, and nothing happens" symptom — no error toast, because
-- nothing actually failed, the statement just had nothing it was allowed to touch.
--
-- The app itself never hit this because both delete_company_and_users (018) and
-- delete_company_as_maintenance (038) are SECURITY DEFINER functions, which bypass RLS via table
-- ownership — but a raw delete from the Supabase dashboard has no such bypass. This mirrors the
-- exact same authorization those two functions already enforce: a company's own admin, or any
-- maintenance account.
create policy "companies_delete_by_admin_or_maintenance" on public.companies
  for delete using (
    public.is_maintenance_account()
    or (
      id = public.current_company_id()
      and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
    )
  );
