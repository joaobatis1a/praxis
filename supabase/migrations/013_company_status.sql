-- Lets the platform owner suspend a company's access (toggled manually via
-- Table Editor for now — there is no in-app "platform admin" panel yet).
alter table public.companies
  add column if not exists status text not null default 'ativo' check (status in ('ativo', 'inativo'));

-- redeem_invite_code now also returns the company's status, so signup can
-- reject codes for a deactivated company without needing a separate
-- RLS-gated read (the caller isn't authenticated yet at that point).
-- Postgres won't let CREATE OR REPLACE change a function's return columns,
-- so the old signature has to be dropped first.
drop function if exists public.redeem_invite_code(text);

create function public.redeem_invite_code(invite_code text)
returns table(company_id uuid, role public.app_role, department text, company_status text)
language sql
security definer
set search_path = public
as $$
  select ic.company_id, ic.role, ic.department, c.status
  from public.invite_codes ic
  join public.companies c on c.id = ic.company_id
  where ic.code = invite_code
$$;
