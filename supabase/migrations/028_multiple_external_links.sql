-- Replace the single external_url text column with a list of {label, url} links,
-- on both library_documents and procedures.
alter table public.library_documents add column external_links jsonb not null default '[]'::jsonb;
update public.library_documents
  set external_links = jsonb_build_array(jsonb_build_object('label', 'Link', 'url', external_url))
  where external_url is not null and external_url <> '';
alter table public.library_documents drop column external_url;

alter table public.procedures add column external_links jsonb not null default '[]'::jsonb;
update public.procedures
  set external_links = jsonb_build_array(jsonb_build_object('label', 'Link', 'url', external_url))
  where external_url is not null and external_url <> '';
alter table public.procedures drop column external_url;
