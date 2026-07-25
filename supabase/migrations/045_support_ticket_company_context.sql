-- Support tickets only showed the sender's name/email — the maintenance inbox had no cargo
-- (role) or company context, and companies had no stable short identifier to tell two
-- same-named clients apart. Adds both, plus a same-name guard on company creation.

-- 1. Company number: a short, sequential, human-readable identifier (companies can share a
-- display name; this can't collide). Backfilled in creation order for existing rows.
alter table public.companies add column if not exists company_number bigint;

create sequence if not exists public.companies_company_number_seq;

update public.companies c
set company_number = sub.rn
from (select id, row_number() over (order by created_at) as rn from public.companies) sub
where c.id = sub.id and c.company_number is null;

select setval('public.companies_company_number_seq', coalesce((select max(company_number) from public.companies), 0));

alter table public.companies alter column company_number set default nextval('public.companies_company_number_seq');
alter table public.companies alter column company_number set not null;
alter table public.companies add constraint companies_company_number_key unique (company_number);

-- 2. Reject creating a company with a name (trimmed, case-insensitive) that already exists.
drop function if exists public.create_company_for_client(text, text, text, text, text);

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

  if exists (select 1 from public.companies where lower(trim(name)) = lower(trim(company_name))) then
    raise exception 'Já existe uma empresa com esse nome.';
  end if;

  insert into public.companies (name, contact_name, contact_phone, notes)
  values (company_name, nullif(trim(contact_name), ''), nullif(trim(contact_phone), ''), nullif(trim(notes), ''))
  returning id into new_company_id;

  insert into public.invite_codes (code, company_id, role) values (invite_code, new_company_id, 'admin');

  return new_company_id;
end;
$$;

grant execute on function public.create_company_for_client(text, text, text, text, text) to authenticated;

-- 3. Surface company_number in the maintenance company list too, same reason.
drop function if exists public.list_all_companies();

create function public.list_all_companies()
returns table(
  id uuid,
  name text,
  company_number bigint,
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
    c.company_number,
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

-- 4. Support tickets: denormalize the sender's role and company (name + number) at the moment
-- the ticket is created, same reasoning as the existing user_name/user_email denormalization —
-- keeps historical tickets readable even if the person's role changes or they leave later.
-- Defaults are server-computed (not client-supplied) so nothing has to be trusted from the client.
alter table public.support_tickets
  add column if not exists user_role text,
  add column if not exists company_name text,
  add column if not exists company_number bigint;

update public.support_tickets t
set user_role = coalesce((select role::text from public.profiles p where p.id = t.user_id), 'colaborador'),
    company_name = coalesce((select name from public.companies c where c.id = t.company_id), ''),
    company_number = (select company_number from public.companies c where c.id = t.company_id)
where t.user_role is null;

alter table public.support_tickets alter column user_role set default (
  select role::text from public.profiles where id = auth.uid()
);
alter table public.support_tickets alter column company_name set default (
  select name from public.companies where id = public.current_company_id()
);
alter table public.support_tickets alter column company_number set default (
  select company_number from public.companies where id = public.current_company_id()
);

alter table public.support_tickets alter column user_role set not null;
alter table public.support_tickets alter column company_name set not null;
