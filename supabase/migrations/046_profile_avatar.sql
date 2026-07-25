-- Profile photo upload: a real avatar image instead of always showing the initials circle.

alter table public.profiles add column if not exists avatar_url text;

-- Storage: public bucket (avatars aren't sensitive, and a public URL means every place that
-- shows one - sidebar, Usuários table, etc. - doesn't need a signed-URL round trip), one folder
-- per user (not per company, unlike library-files: a person keeps the same avatar path even if
-- they later change companies).
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_update_own" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_delete_own" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
