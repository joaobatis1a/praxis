-- Deleting a company cascades to delete its procedures/documents/notices, which fires the
-- audit triggers (037_audit_log.sql) for each one. Those triggers try to INSERT a new audit_log
-- row referencing the company that's mid-deletion in the very same transaction — by the time the
-- child row's AFTER DELETE trigger runs, the parent companies row is already gone as far as this
-- transaction can see, so the audit_log.company_id foreign key check fails and blocks the whole
-- company deletion. Discovered when a company delete errored with
-- "insert or update on table audit_log violates foreign key constraint audit_log_company_id_fkey".
--
-- Fix: audit logging must never be able to block the real operation it's observing. Make the
-- insert best-effort — swallow any error (not just this specific FK case, since a logging
-- side-effect should never be allowed to fail the primary action for any reason).
create or replace function public.write_audit_log(
  p_company_id uuid,
  p_action text,
  p_entity_type text,
  p_entity_label text,
  p_metadata jsonb default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_name text;
begin
  select name into v_actor_name from public.profiles where id = auth.uid();
  insert into public.audit_log (company_id, actor_id, actor_name, action, entity_type, entity_label, metadata)
  values (p_company_id, auth.uid(), coalesce(v_actor_name, 'Sistema'), p_action, p_entity_type, left(p_entity_label, 200), p_metadata);
exception
  when others then
    null;
end;
$$;
