-- Optional external link (Drive, YouTube, etc.) as an alternative/complement to uploaded files
alter table public.library_documents
  add column external_url text;
