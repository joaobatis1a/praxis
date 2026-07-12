-- Avisos: shift-handoff notes. procedure_id/procedure_title are denormalized text
-- (not an FK) because Procedimentos isn't migrated to Supabase yet.
create table public.notices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade default public.current_company_id(),
  procedure_id text not null,
  procedure_title text not null,
  description text not null,
  author_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  author_name text not null,
  recipient_type text not null check (recipient_type in ('user', 'department')),
  recipient_id text not null,
  recipient_label text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notices enable row level security;

create policy "notices_select_same_company" on public.notices
  for select using (company_id = public.current_company_id());

create policy "notices_insert_same_company" on public.notices
  for insert with check (company_id = public.current_company_id());

create policy "notices_update_same_company" on public.notices
  for update using (company_id = public.current_company_id());

create policy "notices_delete_same_company" on public.notices
  for delete using (company_id = public.current_company_id());
