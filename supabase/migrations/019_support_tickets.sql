-- Support tickets: any company user can message the Praxis owner directly (not their own
-- company admin — this is cross-tenant support for the app itself, e.g. after a suspension).
-- There's no cross-company "super admin" role in the app yet, so the owner is identified by
-- their fixed login email instead of a role/table row.

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade default public.current_company_id(),
  user_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  user_name text not null,
  user_email text not null,
  message text not null,
  reply text,
  status text not null default 'aberto' check (status in ('aberto', 'respondido')),
  created_at timestamptz not null default now(),
  replied_at timestamptz
);

alter table public.support_tickets enable row level security;

create function public.is_praxis_owner()
returns boolean
language sql
stable
as $$
  select (auth.jwt() ->> 'email') = 'pessoalba1is1a@gmail.com';
$$;

create policy "support_tickets_select_own_or_owner" on public.support_tickets
  for select using (user_id = auth.uid() or public.is_praxis_owner());

create policy "support_tickets_insert_own" on public.support_tickets
  for insert with check (user_id = auth.uid() and company_id = public.current_company_id());

create policy "support_tickets_update_by_owner" on public.support_tickets
  for update using (public.is_praxis_owner()) with check (public.is_praxis_owner());
