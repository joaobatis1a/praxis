-- While a procedure is a draft ("rascunho"), only its author can see or edit it —
-- not even admin. Once published, the existing department-scoped rule (027) applies.
alter table public.procedures add column created_by uuid references auth.users(id) on delete set null;
alter table public.procedures alter column created_by set default auth.uid();

-- Best-effort backfill for existing rows: match the stored author display name
-- to a profile in the same company. Rows that can't be matched stay null and
-- fall back to "visible to everyone" below, same as before this migration.
update public.procedures p
set created_by = pr.id
from public.profiles pr
where pr.company_id = p.company_id
  and pr.name = p.author
  and p.created_by is null;

drop policy "procedures_select_own_department" on public.procedures;

create policy "procedures_select_own_department" on public.procedures
  for select using (
    company_id = public.current_company_id()
    and (
      (status = 'rascunho' and (created_by = auth.uid() or created_by is null))
      or (status = 'publicado' and (department = public.current_user_department() or public.current_user_role() = 'admin'))
    )
  );

drop policy "procedures_update_same_company" on public.procedures;

create policy "procedures_update_same_company" on public.procedures
  for update using (
    company_id = public.current_company_id()
    and (status <> 'rascunho' or created_by = auth.uid() or created_by is null)
  );

drop policy "procedures_delete_same_company" on public.procedures;

create policy "procedures_delete_same_company" on public.procedures
  for delete using (
    company_id = public.current_company_id()
    and (status <> 'rascunho' or created_by = auth.uid() or created_by is null)
  );
