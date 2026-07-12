-- Fix: right after creating a company, the creator has no profile yet, so the
-- "see your own company" policy (which depends on your profile's company_id)
-- can't see the row it just inserted — and INSERT ... RETURNING needs SELECT
-- visibility on the new row. Add a creator column so the insert is self-visible.

alter table public.companies add column if not exists created_by uuid references auth.users(id);
alter table public.companies alter column created_by set default auth.uid();

drop policy if exists "companies_select_own" on public.companies;
create policy "companies_select_own" on public.companies
  for select using (
    id = public.current_company_id()
    or created_by = auth.uid()
  );
