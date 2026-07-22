-- companies.created_by (added in 003_fix_companies_select_on_create.sql) references
-- auth.users(id) with no ON DELETE action, which defaults to NO ACTION/RESTRICT. That means
-- Postgres blocks deleting ANY auth.users row that created a company — which is most admins,
-- since every company has a creator — with a "foreign key constraint" error. Same underlying
-- gap already documented in 018_fix_delete_company_order.sql's comment, worked around there by
-- deleting the company row before the user row (so created_by is already gone by the time
-- auth.users is deleted) — but that workaround only helps the app's own delete_company_and_users/
-- delete_company_as_maintenance RPCs, not a raw delete of a user or company from the Supabase
-- dashboard directly. created_by is purely informational (used once, by the
-- "companies_select_own" policy, right after signup before a profile exists) — safe to null out.
alter table public.companies
  drop constraint if exists companies_created_by_fkey;
alter table public.companies
  add constraint companies_created_by_fkey foreign key (created_by) references auth.users(id) on delete set null;
