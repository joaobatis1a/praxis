-- Restrict Procedimentos visibility to the viewer's own department.
-- Only admin sees procedures across all departments; gestor and colaborador
-- are both scoped to their own department (creation/editing rules unchanged).
drop policy "procedures_select_same_company" on public.procedures;

create policy "procedures_select_own_department" on public.procedures
  for select using (
    company_id = public.current_company_id()
    and (
      department = public.current_user_department()
      or public.current_user_role() = 'admin'
    )
  );
