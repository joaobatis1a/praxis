-- Company logo upload: shown in Configurações > Empresa, admin-only (same gating as the
-- existing companies_update_by_admin policy this column falls under).

alter table public.companies add column if not exists logo_url text;

-- Storage: public bucket (same reasoning as avatars — not sensitive, and a public URL avoids a
-- signed-URL round trip everywhere it'd be shown), one folder per company.
insert into storage.buckets (id, name, public)
values ('company-logos', 'company-logos', true)
on conflict (id) do nothing;

create policy "company_logos_insert_admin" on storage.objects
  for insert with check (
    bucket_id = 'company-logos'
    and (storage.foldername(name))[1] = public.current_company_id()::text
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "company_logos_update_admin" on storage.objects
  for update using (
    bucket_id = 'company-logos'
    and (storage.foldername(name))[1] = public.current_company_id()::text
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "company_logos_delete_admin" on storage.objects
  for delete using (
    bucket_id = 'company-logos'
    and (storage.foldername(name))[1] = public.current_company_id()::text
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
