-- 1. Enum types
create type public.app_role as enum ('admin', 'gestor', 'colaborador');
create type public.member_status as enum ('ativo', 'inativo');

-- 2. Companies (tenants)
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- 3. Profiles: app-specific data for each authenticated user, 1:1 with auth.users
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  email text not null,
  role public.app_role not null default 'colaborador',
  department text,
  status public.member_status not null default 'ativo',
  created_at timestamptz not null default now()
);

-- 4. Invite codes: an admin/gestor gives one of these out to invite someone with a preset role
create table public.invite_codes (
  code text primary key,
  company_id uuid not null references public.companies(id) on delete cascade,
  role public.app_role not null default 'colaborador',
  department text
);

-- 5. Row Level Security
alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.invite_codes enable row level security;

-- helper: the calling user's own company_id, used by the policies below
create or replace function public.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id from public.profiles where id = auth.uid()
$$;

-- profiles: see everyone in your own company; create your own row once; update yourself or (if admin) anyone in your company
create policy "profiles_select_same_company" on public.profiles
  for select using (company_id = public.current_company_id());

create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());

create policy "profiles_update_own_or_admin" on public.profiles
  for update using (
    id = auth.uid()
    or (
      company_id = public.current_company_id()
      and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
    )
  );

-- companies: see your own company; any authenticated user can create a new one ("Criar empresa")
create policy "companies_select_own" on public.companies
  for select using (id = public.current_company_id());

create policy "companies_insert_any_authenticated" on public.companies
  for insert with check (auth.uid() is not null);

-- invite codes are never selected directly by clients — redeemed through this RPC instead,
-- so an unauthenticated/new signup can validate a code without needing broad table access
create or replace function public.redeem_invite_code(invite_code text)
returns table(company_id uuid, role public.app_role, department text)
language sql
security definer
set search_path = public
as $$
  select company_id, role, department from public.invite_codes where code = invite_code
$$;
