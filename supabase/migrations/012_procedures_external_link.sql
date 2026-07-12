-- Optional external link (Drive, YouTube, etc.) as an alternative to uploading the walkthrough video
alter table public.procedures
  add column external_url text;
