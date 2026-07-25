-- Every avatar/logo upload was failing ("Não foi possível enviar a foto"). Root cause: uploading
-- with { upsert: true } makes the storage API check whether the object already exists before
-- deciding insert vs. update, which requires a SELECT policy on storage.objects — only
-- insert/update/delete policies existed for these two buckets, so that existence check was
-- silently denied and the whole upload failed, even on someone's very first photo.

create policy "avatars_select_own" on storage.objects
  for select using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "company_logos_select_admin" on storage.objects
  for select using (
    bucket_id = 'company-logos'
    and (storage.foldername(name))[1] = public.current_company_id()::text
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
