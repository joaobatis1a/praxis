-- Adding a maintenance account moves to the same code-based invite system as everything else
-- (company invites, teammate invites), instead of typing someone's email in directly. Unlike
-- those, these codes are single-use — maintenance access is cross-tenant and higher-stakes, so
-- there's no reason to leave a code valid forever.
create table public.maintenance_invite_codes (
  code text primary key,
  created_by text,
  created_at timestamptz not null default now()
);

alter table public.maintenance_invite_codes enable row level security;

create policy "maintenance_invite_codes_select_by_maintenance" on public.maintenance_invite_codes
  for select using (public.is_maintenance_account());

create policy "maintenance_invite_codes_insert_by_maintenance" on public.maintenance_invite_codes
  for insert with check (public.is_maintenance_account());

-- redemption needs security definer: the redeemer isn't a maintenance account yet, so under
-- normal RLS they can't even see this table to validate the code — mirrors redeem_invite_code
-- (001_auth_schema.sql). Works for both a brand new signup and an already-logged-in user with
-- an existing company, since it only ever touches maintenance_accounts, never profiles.
create function public.redeem_maintenance_invite_code(invite_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.maintenance_invite_codes where code = invite_code) then
    return false;
  end if;

  insert into public.maintenance_accounts (email, added_by)
  values (auth.jwt() ->> 'email', 'code:' || invite_code)
  on conflict (email) do nothing;

  delete from public.maintenance_invite_codes where code = invite_code;
  return true;
end;
$$;

grant execute on function public.redeem_maintenance_invite_code(text) to authenticated;

-- superseded by the code-based flow above
drop function public.add_maintenance_account(text);
