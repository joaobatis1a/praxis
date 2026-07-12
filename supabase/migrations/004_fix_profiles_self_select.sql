-- Same chicken-and-egg problem as companies: right after inserting your own
-- profile, current_company_id() (which reads from profiles) can't see it yet
-- for the RETURNING visibility check. Add a direct "see your own row" clause.

drop policy if exists "profiles_select_same_company" on public.profiles;
create policy "profiles_select_same_company" on public.profiles
  for select using (
    id = auth.uid()
    or company_id = public.current_company_id()
  );
