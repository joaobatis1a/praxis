-- Multiple file attachments per procedure, addable/removable one at a time (independent of the
-- single video field already on `procedures`, and independent of the create/edit form) - a
-- separate table rather than reusing library_documents so it can't clutter/couple with Biblioteca.
create table public.procedure_attachments (
  id uuid primary key default gen_random_uuid(),
  procedure_id uuid not null references public.procedures(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_type text not null,
  uploaded_by text not null,
  created_at timestamptz not null default now()
);

alter table public.procedure_attachments enable row level security;

-- Mirrors procedures_select_own_department (027/030): visible to whoever can already see the
-- parent procedure (draft -> author only, published -> own department or admin).
create policy "procedure_attachments_select" on public.procedure_attachments
  for select using (
    exists (
      select 1 from public.procedures p
      where p.id = procedure_id
        and p.company_id = public.current_company_id()
        and (
          (p.status = 'rascunho' and (p.created_by = auth.uid() or p.created_by is null))
          or (p.status = 'publicado' and (p.department = public.current_user_department() or public.current_user_role() = 'admin'))
        )
    )
  );

-- Mirrors procedures_update_same_company (030): whoever could edit the parent procedure can
-- attach/remove its files.
create policy "procedure_attachments_insert" on public.procedure_attachments
  for insert with check (
    exists (
      select 1 from public.procedures p
      where p.id = procedure_id
        and p.company_id = public.current_company_id()
        and (p.status <> 'rascunho' or p.created_by = auth.uid() or p.created_by is null)
    )
  );

create policy "procedure_attachments_delete" on public.procedure_attachments
  for delete using (
    exists (
      select 1 from public.procedures p
      where p.id = procedure_id
        and p.company_id = public.current_company_id()
        and (p.status <> 'rascunho' or p.created_by = auth.uid() or p.created_by is null)
    )
  );

-- Storage: private bucket, one folder per company (same convention as procedure-videos/library-files)
insert into storage.buckets (id, name, public)
values ('procedure-attachments', 'procedure-attachments', false)
on conflict (id) do nothing;

create policy "procedure_attachments_files_select" on storage.objects
  for select using (
    bucket_id = 'procedure-attachments'
    and (storage.foldername(name))[1] = public.current_company_id()::text
  );

create policy "procedure_attachments_files_insert" on storage.objects
  for insert with check (
    bucket_id = 'procedure-attachments'
    and (storage.foldername(name))[1] = public.current_company_id()::text
  );

create policy "procedure_attachments_files_delete" on storage.objects
  for delete using (
    bucket_id = 'procedure-attachments'
    and (storage.foldername(name))[1] = public.current_company_id()::text
  );
