-- Tighten: once published, ANY same-company user could edit/delete a procedure (030 only
-- restricted drafts to their author). Now published procedures can only be edited/deleted by
-- their own author, or an admin/gestor — drafts keep the existing literal author-only rule
-- (admin is deliberately NOT exempt there, per the earlier decision in 030).

drop policy "procedures_update_same_company" on public.procedures;

create policy "procedures_update_same_company" on public.procedures
  for update using (
    company_id = public.current_company_id()
    and (
      (status = 'rascunho' and (created_by = auth.uid() or created_by is null))
      or (status = 'publicado' and (created_by = auth.uid() or created_by is null or public.current_user_role() in ('admin', 'gestor')))
    )
  );

drop policy "procedures_delete_same_company" on public.procedures;

create policy "procedures_delete_same_company" on public.procedures
  for delete using (
    company_id = public.current_company_id()
    and (
      (status = 'rascunho' and (created_by = auth.uid() or created_by is null))
      or (status = 'publicado' and (created_by = auth.uid() or created_by is null or public.current_user_role() in ('admin', 'gestor')))
    )
  );

-- Attachments (055) mirror the update/delete rule inline rather than delegating to the policy
-- above, so they need the same tightening or a colleague could still add/remove files on a
-- published procedure they don't own.
drop policy "procedure_attachments_insert" on public.procedure_attachments;

create policy "procedure_attachments_insert" on public.procedure_attachments
  for insert with check (
    exists (
      select 1 from public.procedures p
      where p.id = procedure_id
        and p.company_id = public.current_company_id()
        and (
          (p.status = 'rascunho' and (p.created_by = auth.uid() or p.created_by is null))
          or (p.status = 'publicado' and (p.created_by = auth.uid() or p.created_by is null or public.current_user_role() in ('admin', 'gestor')))
        )
    )
  );

drop policy "procedure_attachments_delete" on public.procedure_attachments;

create policy "procedure_attachments_delete" on public.procedure_attachments
  for delete using (
    exists (
      select 1 from public.procedures p
      where p.id = procedure_id
        and p.company_id = public.current_company_id()
        and (
          (p.status = 'rascunho' and (p.created_by = auth.uid() or p.created_by is null))
          or (p.status = 'publicado' and (p.created_by = auth.uid() or p.created_by is null or public.current_user_role() in ('admin', 'gestor')))
        )
    )
  );
