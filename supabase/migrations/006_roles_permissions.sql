-- Cargos e Permissões: store the role -> module -> enabled matrix per company
alter table public.companies
  add column permissions jsonb not null default '{
    "admin": {"biblioteca": true, "procedimentos": true, "avisos": true, "usuarios": true, "cargos": true, "configuracoes": true},
    "gestor": {"biblioteca": true, "procedimentos": true, "avisos": true, "usuarios": true, "cargos": false, "configuracoes": false},
    "colaborador": {"biblioteca": true, "procedimentos": true, "avisos": true, "usuarios": false, "cargos": false, "configuracoes": false}
  }'::jsonb;

-- only an admin of the company can edit its permissions matrix
create policy "companies_update_by_admin" on public.companies
  for update using (
    id = public.current_company_id()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  )
  with check (
    id = public.current_company_id()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
