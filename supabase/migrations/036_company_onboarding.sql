-- Lets a new company's admin dismiss the onboarding checklist shown on the
-- dashboard once they've done the initial setup (or just don't want it anymore).
alter table public.companies
  add column if not exists onboarding_dismissed boolean not null default false;

-- covered by the existing "companies_update_by_admin" policy from 006_roles_permissions.sql,
-- no new RLS policy needed.
