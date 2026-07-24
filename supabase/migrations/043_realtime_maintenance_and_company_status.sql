-- Closes two "needs an F5 to see it" gaps found in the same session as the notification/company
-- delete fixes (040-042): removing your own maintenance access, or your company being
-- deactivated, didn't reflect in an already-open session until the next reload/login.

-- The old select policy only worked while at least one row for this email still existed
-- (is_maintenance_account() runs a fresh exists() query). The instant your own row is deleted,
-- that check flips false for you too - which blocks Realtime from authorizing delivery of the very
-- DELETE event about that row, since it re-evaluates the policy against current state. Add a
-- direct column comparison (mirrors profiles' "id = auth.uid()" self-row clause, 004) so seeing
-- your own row - deletion included - never depends on any row still existing.
drop policy if exists "maintenance_accounts_select_by_maintenance" on public.maintenance_accounts;
create policy "maintenance_accounts_select_by_maintenance" on public.maintenance_accounts
  for select using (
    email = (auth.jwt() ->> 'email')
    or public.is_maintenance_account()
  );

alter publication supabase_realtime add table public.maintenance_accounts;
alter publication supabase_realtime add table public.companies;
