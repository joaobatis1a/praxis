-- Platform-level account tier: floats across all companies, view-only access to the company
-- list, and manages its own membership. Generalizes the hardcoded is_praxis_owner() email
-- (019_support_tickets.sql) into a real, growable list.
create table public.maintenance_accounts (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  added_by text,
  created_at timestamptz not null default now()
);

alter table public.maintenance_accounts enable row level security;

create function public.is_maintenance_account()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.maintenance_accounts where email = (auth.jwt() ->> 'email')
  )
$$;

create policy "maintenance_accounts_select_by_maintenance" on public.maintenance_accounts
  for select using (public.is_maintenance_account());

-- inserts/deletes go through the RPCs below (not raw table access) so the
-- "never remove the last account" guard can't be bypassed from the client
create policy "maintenance_accounts_no_direct_write" on public.maintenance_accounts
  for all to authenticated
  using (false)
  with check (false);

create function public.add_maintenance_account(target_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_maintenance_account() then
    raise exception 'Not authorized.';
  end if;
  insert into public.maintenance_accounts (email, added_by)
  values (lower(trim(target_email)), auth.jwt() ->> 'email')
  on conflict (email) do nothing;
end;
$$;

create function public.remove_maintenance_account(target_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  total int;
begin
  if not public.is_maintenance_account() then
    raise exception 'Not authorized.';
  end if;
  select count(*) into total from public.maintenance_accounts;
  if total <= 1 then
    raise exception 'Cannot remove the last maintenance account.';
  end if;
  delete from public.maintenance_accounts where email = lower(trim(target_email));
end;
$$;

grant execute on function public.add_maintenance_account(text) to authenticated;
grant execute on function public.remove_maintenance_account(text) to authenticated;

-- read-only company list for the maintenance panel — never exposes anything beyond
-- basic identifying info, no drill-down into a company's actual data
create function public.list_all_companies()
returns table(
  id uuid,
  name text,
  status text,
  created_at timestamptz,
  member_count bigint,
  admin_name text,
  admin_email text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id,
    c.name,
    c.status,
    c.created_at,
    (select count(*) from public.profiles p where p.company_id = c.id),
    (select p.name from public.profiles p where p.company_id = c.id and p.role = 'admin' order by p.created_at limit 1),
    (select p.email from public.profiles p where p.company_id = c.id and p.role = 'admin' order by p.created_at limit 1)
  from public.companies c
  where public.is_maintenance_account()
  order by c.created_at desc
$$;

grant execute on function public.list_all_companies() to authenticated;

-- is_praxis_owner() (019_support_tickets.sql) backs every support_tickets/support_ticket_messages
-- RLS policy — redefining it to delegate here means the cross-tenant support inbox now follows
-- the same dynamic list, with zero changes to those policies (Postgres resolves the function by
-- name at evaluation time, so this alone updates every place that already calls it).
create or replace function public.is_praxis_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_maintenance_account()
$$;

-- seed the first maintenance account by hand (no UI can create the very first one):
-- insert into public.maintenance_accounts (email, added_by) values ('pessoalba1is1a@gmail.com', 'seed');
