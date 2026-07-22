-- Audit log: "quem mudou o quê e quando", populated entirely by triggers (not
-- client code) so it can't be bypassed by any existing or future mutation path.
-- Scoped to what a company's own admin/gestor would care about: procedures,
-- library documents, notices, and role/department/status changes on
-- teammates. Deliberately does NOT cover maintenance-panel actions (company
-- status/delete) — those are performed by accounts with no `profiles` row in
-- the target company, which would make actor attribution awkward, and that's
-- a different (cross-tenant) concern from this per-company audit trail.

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  actor_name text not null,
  action text not null,
  entity_type text not null,
  entity_label text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index audit_log_company_created_idx on public.audit_log (company_id, created_at desc);

alter table public.audit_log enable row level security;

-- only admin/gestor of the same company can read it; nobody can write to it
-- directly (no insert/update/delete policy) — the trigger functions below are
-- security definer, which bypasses RLS via table ownership.
create policy "audit_log_select_admin_gestor" on public.audit_log
  for select using (
    company_id = public.current_company_id()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'gestor'))
  );

create function public.write_audit_log(
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
end;
$$;

-- Procedures: create/publish/delete always logged. A plain "update" is only
-- logged when a structural field actually changed — completed_step_ids,
-- video_watched, completed/completed_at/completed_by and updated_at change on
-- every checklist toggle, which is not audit-worthy and would flood the log.
create function public.audit_procedures()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP = 'INSERT' then
    perform public.write_audit_log(NEW.company_id, 'created', 'procedure', NEW.title);
    return NEW;
  elsif TG_OP = 'UPDATE' then
    if OLD.status = 'rascunho' and NEW.status = 'publicado' then
      perform public.write_audit_log(NEW.company_id, 'published', 'procedure', NEW.title);
    elsif OLD.title is distinct from NEW.title
       or OLD.department is distinct from NEW.department
       or OLD.responsible is distinct from NEW.responsible
       or OLD.steps is distinct from NEW.steps
       or OLD.video_name is distinct from NEW.video_name then
      perform public.write_audit_log(NEW.company_id, 'updated', 'procedure', NEW.title);
    end if;
    return NEW;
  elsif TG_OP = 'DELETE' then
    perform public.write_audit_log(OLD.company_id, 'deleted', 'procedure', OLD.title);
    return OLD;
  end if;
  return null;
end;
$$;

create trigger trg_audit_procedures
  after insert or update or delete on public.procedures
  for each row execute function public.audit_procedures();

-- Library documents: no noisy per-user toggle fields on this table, so every
-- update is audit-worthy.
create function public.audit_library_documents()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP = 'INSERT' then
    perform public.write_audit_log(NEW.company_id, 'created', 'document', NEW.title);
    return NEW;
  elsif TG_OP = 'UPDATE' then
    perform public.write_audit_log(NEW.company_id, 'updated', 'document', NEW.title);
    return NEW;
  elsif TG_OP = 'DELETE' then
    perform public.write_audit_log(OLD.company_id, 'deleted', 'document', OLD.title);
    return OLD;
  end if;
  return null;
end;
$$;

create trigger trg_audit_library_documents
  after insert or update or delete on public.library_documents
  for each row execute function public.audit_library_documents();

-- Notices: only creation/deletion are audit-worthy — the `read` flag flips on
-- every view, which would flood the log if logged as an "update".
create function public.audit_notices()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP = 'INSERT' then
    perform public.write_audit_log(NEW.company_id, 'created', 'notice', left(NEW.description, 100));
    return NEW;
  elsif TG_OP = 'DELETE' then
    perform public.write_audit_log(OLD.company_id, 'deleted', 'notice', left(OLD.description, 100));
    return OLD;
  end if;
  return null;
end;
$$;

create trigger trg_audit_notices
  after insert or delete on public.notices
  for each row execute function public.audit_notices();

-- Profiles: only role/department/status changes are audit-worthy — theme
-- preference and other self-service edits update this row constantly and
-- aren't. Insert (signup) and delete (leave/remove) are intentionally not
-- logged: insert happens before there's a meaningful "who did this" actor
-- distinct from the row itself, and delete's actor resolution is ambiguous
-- for self-leave (the acting profile row is already gone by AFTER DELETE).
create function public.audit_profiles()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if OLD.role is distinct from NEW.role then
    perform public.write_audit_log(NEW.company_id, 'role_changed', 'user', NEW.name, jsonb_build_object('from', OLD.role, 'to', NEW.role));
  end if;
  if OLD.department is distinct from NEW.department then
    perform public.write_audit_log(NEW.company_id, 'department_changed', 'user', NEW.name, jsonb_build_object('from', OLD.department, 'to', NEW.department));
  end if;
  if OLD.status is distinct from NEW.status then
    perform public.write_audit_log(NEW.company_id, case when NEW.status = 'inativo' then 'deactivated' else 'reactivated' end, 'user', NEW.name);
  end if;
  return NEW;
end;
$$;

create trigger trg_audit_profiles
  after update on public.profiles
  for each row execute function public.audit_profiles();
