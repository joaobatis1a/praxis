-- Auto-expiring invite codes (ported from a sibling project): a freshly generated invite code
-- is only valid for a few minutes instead of forever. The UI (InviteCodeModal) shows a live
-- countdown and silently mints a fresh code when the old one expires, so nothing changes for an
-- admin who shares it right away — this only closes the "a leaked/forgotten code still works
-- months later" gap.
--
-- The one exception is the admin invite code minted when maintenance creates a new company
-- (create_company_for_client, see 033/038/045) — that one is documented as intentionally
-- reusable/persistent (see 044_get_company_invite_code.sql), so it can be recovered later if the
-- "convite gerado" modal is closed by accident. It never passes expires_at on insert, so it keeps
-- the column's default of null ("never expires"), same as before this migration.

alter table public.invite_codes
  add column if not exists expires_at timestamptz;

-- Postgres won't let CREATE OR REPLACE change a function's return columns, so the existing
-- signature (013_company_status.sql) has to be dropped first — same shape, just gated on expiry.
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
    and (ic.expires_at is null or ic.expires_at > now())
$$;

-- maintenance_invite_codes were already meant to be short-lived ("no reason to leave a code
-- valid forever", see 035) but were only ever single-use-by-redemption, never time-boxed. Every
-- existing row gets 5 minutes from "now" on migrate; new rows get 5 minutes from insert.
alter table public.maintenance_invite_codes
  add column if not exists expires_at timestamptz not null default (now() + interval '5 minutes');

create or replace function public.redeem_maintenance_invite_code(invite_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.maintenance_invite_codes
    where code = invite_code and expires_at > now()
  ) then
    return false;
  end if;

  insert into public.maintenance_accounts (email, added_by)
  values (auth.jwt() ->> 'email', 'code:' || invite_code)
  on conflict (email) do nothing;

  delete from public.maintenance_invite_codes where code = invite_code;
  return true;
end;
$$;

-- Lets a maintenance account opportunistically clean up its own expired, never-redeemed codes
-- when generating a new one (see generateMaintenanceInviteCode) — there was no delete policy at
-- all before, so those rows would otherwise sit dead in the table forever.
create policy "maintenance_invite_codes_delete_by_maintenance" on public.maintenance_invite_codes
  for delete using (public.is_maintenance_account());
