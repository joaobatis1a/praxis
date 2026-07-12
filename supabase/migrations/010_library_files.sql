-- Real file storage for Biblioteca de Conhecimento documents (video and image types)
alter table public.library_documents
  add column file_path text,
  add column file_name text;

-- Storage: private bucket, one folder per company (same convention as procedure-videos)
insert into storage.buckets (id, name, public)
values ('library-files', 'library-files', false)
on conflict (id) do nothing;

create policy "library_files_select" on storage.objects
  for select using (
    bucket_id = 'library-files'
    and (storage.foldername(name))[1] = public.current_company_id()::text
  );

create policy "library_files_insert" on storage.objects
  for insert with check (
    bucket_id = 'library-files'
    and (storage.foldername(name))[1] = public.current_company_id()::text
  );

create policy "library_files_delete" on storage.objects
  for delete using (
    bucket_id = 'library-files'
    and (storage.foldername(name))[1] = public.current_company_id()::text
  );
