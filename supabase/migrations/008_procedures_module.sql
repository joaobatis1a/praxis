-- Procedimentos: checklist + video walkthrough + completion tracking
create table public.procedures (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade default public.current_company_id(),
  title text not null,
  department text not null,
  responsible text not null,
  status text not null check (status in ('publicado', 'rascunho')),
  estimated_minutes int not null default 0,
  author text not null,
  steps jsonb not null default '[]'::jsonb,
  completed_step_ids text[] not null default '{}',
  video_path text,
  video_name text,
  video_watched boolean not null default false,
  completed boolean not null default false,
  completed_at timestamptz,
  completed_by text,
  updated_at date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.procedures enable row level security;

create policy "procedures_select_same_company" on public.procedures
  for select using (company_id = public.current_company_id());

create policy "procedures_insert_same_company" on public.procedures
  for insert with check (company_id = public.current_company_id());

create policy "procedures_update_same_company" on public.procedures
  for update using (company_id = public.current_company_id());

create policy "procedures_delete_same_company" on public.procedures
  for delete using (company_id = public.current_company_id());

-- Procedure completions: immutable log of who finished what
create table public.procedure_completions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade default public.current_company_id(),
  procedure_id uuid not null references public.procedures(id) on delete cascade,
  procedure_title text not null,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  user_name text not null,
  completed_at timestamptz not null default now()
);

alter table public.procedure_completions enable row level security;

create policy "procedure_completions_select_same_company" on public.procedure_completions
  for select using (company_id = public.current_company_id());

create policy "procedure_completions_insert_same_company" on public.procedure_completions
  for insert with check (company_id = public.current_company_id());

-- Storage: private bucket for procedure walkthrough videos, one folder per company
insert into storage.buckets (id, name, public)
values ('procedure-videos', 'procedure-videos', false)
on conflict (id) do nothing;

create policy "procedure_videos_select" on storage.objects
  for select using (
    bucket_id = 'procedure-videos'
    and (storage.foldername(name))[1] = public.current_company_id()::text
  );

create policy "procedure_videos_insert" on storage.objects
  for insert with check (
    bucket_id = 'procedure-videos'
    and (storage.foldername(name))[1] = public.current_company_id()::text
  );

create policy "procedure_videos_delete" on storage.objects
  for delete using (
    bucket_id = 'procedure-videos'
    and (storage.foldername(name))[1] = public.current_company_id()::text
  );
