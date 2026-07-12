-- Biblioteca de Conhecimento: recursive folder tree, documents, version history, per-user favorites
create table public.library_folders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade default public.current_company_id(),
  parent_id uuid references public.library_folders(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.library_folders enable row level security;

create policy "library_folders_select_same_company" on public.library_folders
  for select using (company_id = public.current_company_id());
create policy "library_folders_insert_same_company" on public.library_folders
  for insert with check (company_id = public.current_company_id());
create policy "library_folders_update_same_company" on public.library_folders
  for update using (company_id = public.current_company_id());
create policy "library_folders_delete_same_company" on public.library_folders
  for delete using (company_id = public.current_company_id());

create table public.library_documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade default public.current_company_id(),
  folder_id uuid references public.library_folders(id) on delete cascade,
  title text not null,
  type text not null check (type in ('pdf', 'doc', 'sheet', 'video', 'image')),
  author text not null,
  updated_at date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.library_documents enable row level security;

create policy "library_documents_select_same_company" on public.library_documents
  for select using (company_id = public.current_company_id());
create policy "library_documents_insert_same_company" on public.library_documents
  for insert with check (company_id = public.current_company_id());
create policy "library_documents_update_same_company" on public.library_documents
  for update using (company_id = public.current_company_id());
create policy "library_documents_delete_same_company" on public.library_documents
  for delete using (company_id = public.current_company_id());

-- Version history: immutable log, one row per version
create table public.library_document_versions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade default public.current_company_id(),
  document_id uuid not null references public.library_documents(id) on delete cascade,
  version text not null,
  date date not null default current_date,
  author text not null,
  note text not null,
  created_at timestamptz not null default now()
);

alter table public.library_document_versions enable row level security;

create policy "library_document_versions_select_same_company" on public.library_document_versions
  for select using (company_id = public.current_company_id());
create policy "library_document_versions_insert_same_company" on public.library_document_versions
  for insert with check (company_id = public.current_company_id());

-- Favorites are per-user (the mock's global boolean was a demo simplification)
create table public.library_document_favorites (
  document_id uuid not null references public.library_documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now(),
  primary key (document_id, user_id)
);

alter table public.library_document_favorites enable row level security;

create policy "library_document_favorites_select_own" on public.library_document_favorites
  for select using (user_id = auth.uid());

create policy "library_document_favorites_insert_own" on public.library_document_favorites
  for insert with check (
    user_id = auth.uid()
    and exists (select 1 from public.library_documents d where d.id = document_id and d.company_id = public.current_company_id())
  );

create policy "library_document_favorites_delete_own" on public.library_document_favorites
  for delete using (user_id = auth.uid());
