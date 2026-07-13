-- Lets each company's admin define their own department list instead of the
-- previously hardcoded one. `profiles.department` / `procedures.department` /
-- `notices` targeting / `invite_codes.department` all stay plain text (not a
-- foreign key) — this table is only the source of truth for the dropdown
-- options going forward, not a constraint on data already saved.

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade default public.current_company_id(),
  name text not null,
  created_at timestamptz not null default now(),
  unique (company_id, name)
);

alter table public.departments enable row level security;

create policy "departments_select_same_company" on public.departments
  for select using (company_id = public.current_company_id());

create policy "departments_insert_by_admin" on public.departments
  for insert with check (
    company_id = public.current_company_id()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "departments_delete_by_admin" on public.departments
  for delete using (
    company_id = public.current_company_id()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- seed every existing company with the same six departments the app had hardcoded until now
insert into public.departments (company_id, name)
select c.id, d.name
from public.companies c
cross join (values ('Diretoria'), ('Operações'), ('Comercial'), ('Financeiro'), ('Suporte'), ('Recursos Humanos')) as d(name)
on conflict (company_id, name) do nothing;

-- new companies (signup "Criar empresa") get the same starting set — the admin can add/remove from there
create function public.seed_default_departments()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.departments (company_id, name)
  values
    (new.id, 'Diretoria'),
    (new.id, 'Operações'),
    (new.id, 'Comercial'),
    (new.id, 'Financeiro'),
    (new.id, 'Suporte'),
    (new.id, 'Recursos Humanos');
  return new;
end;
$$;

create trigger trg_seed_default_departments
  after insert on public.companies
  for each row execute function public.seed_default_departments();
