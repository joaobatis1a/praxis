-- Maintenance had zero way to track who the client contact is beyond the
-- generated invite code. Adds an optional contact name/phone + free-text
-- notes, filled in (optionally) when a maintenance account creates a company.
--
-- Note on this migration also touching list_all_companies/set_company_status/
-- delete_company_as_maintenance: migration 034_maintenance_company_actions.sql
-- (which was supposed to define the multi-admin array_agg version of
-- list_all_companies, plus these two RPCs) was committed empty — the actual
-- SQL was run by hand in the Supabase SQL editor at the time and never made
-- it into a migration file. This migration reconstructs all three from the
-- frontend's actual usage (src/features/maintenance/api.ts) so the migration
-- history matches what's really running, since it has to touch
-- list_all_companies anyway for the new contact fields.

alter table public.companies
  add column if not exists contact_name text,
  add column if not exists contact_phone text,
  add column if not exists notes text;

drop function if exists public.create_company_for_client(text, text);

create function public.create_company_for_client(
  company_name text,
  invite_code text,
  contact_name text default null,
  contact_phone text default null,
  notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_company_id uuid;
begin
  if not public.is_maintenance_account() then
    raise exception 'Not authorized.';
  end if;

  insert into public.companies (name, contact_name, contact_phone, notes)
  values (company_name, nullif(trim(contact_name), ''), nullif(trim(contact_phone), ''), nullif(trim(notes), ''))
  returning id into new_company_id;

  insert into public.invite_codes (code, company_id, role) values (invite_code, new_company_id, 'admin');

  return new_company_id;
end;
$$;

grant execute on function public.create_company_for_client(text, text, text, text, text) to authenticated;

drop function if exists public.list_all_companies();

create function public.list_all_companies()
returns table(
  id uuid,
  name text,
  status text,
  created_at timestamptz,
  member_count bigint,
  admin_names text[],
  admin_emails text[],
  contact_name text,
  contact_phone text,
  notes text
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
    (select array_agg(p.name order by p.created_at) from public.profiles p where p.company_id = c.id and p.role = 'admin'),
    (select array_agg(p.email order by p.created_at) from public.profiles p where p.company_id = c.id and p.role = 'admin'),
    c.contact_name,
    c.contact_phone,
    c.notes
  from public.companies c
  where public.is_maintenance_account()
  order by c.created_at desc
$$;

grant execute on function public.list_all_companies() to authenticated;

create or replace function public.set_company_status(target_company_id uuid, new_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_maintenance_account() then
    raise exception 'Not authorized.';
  end if;
  if new_status not in ('ativo', 'inativo') then
    raise exception 'Invalid status.';
  end if;
  update public.companies set status = new_status where id = target_company_id;
end;
$$;

grant execute on function public.set_company_status(uuid, text) to authenticated;

create or replace function public.delete_company_as_maintenance(target_company_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  member_ids uuid[];
begin
  if not public.is_maintenance_account() then
    raise exception 'Not authorized.';
  end if;

  select array_agg(id) into member_ids from public.profiles where company_id = target_company_id;

  delete from public.companies where id = target_company_id;
  delete from auth.users where id = any(member_ids);
end;
$$;

grant execute on function public.delete_company_as_maintenance(uuid) to authenticated;
