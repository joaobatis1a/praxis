-- Deleting a user used to only remove the `profiles` row, leaving the real
-- auth.users account behind ("orphaned" login — no profile, no company, but
-- the email/password still work and block that email from ever signing up
-- again for real). This function deletes the auth.users row directly, which
-- cascades to `profiles` (its FK is `on delete cascade`, see migration 001)
-- and to auth's own internal tables (sessions, identities, etc.), removing
-- both sides in one atomic operation.
--
-- security definer + owned by the migration-running role (which has access
-- to the `auth` schema) is what makes this possible without a service_role
-- key on the client — the function re-implements the same authorization
-- `profiles_delete_by_admin_or_gestor` already enforces, plus allows
-- self-delete (needed for "Excluir minha conta" in Configurações, which
-- any role can do, not just admin/gestor).
create or replace function public.delete_user_and_auth(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid := auth.uid();
  caller_company_id uuid;
  caller_role public.app_role;
  target_company_id uuid;
begin
  select company_id, role into caller_company_id, caller_role
  from public.profiles where id = caller_id;

  select company_id into target_company_id
  from public.profiles where id = target_user_id;

  if target_company_id is null or target_company_id <> caller_company_id then
    raise exception 'User not found in your company.';
  end if;

  if target_user_id <> caller_id and caller_role not in ('admin', 'gestor') then
    raise exception 'Not authorized to delete this user.';
  end if;

  delete from auth.users where id = target_user_id;
end;
$$;

grant execute on function public.delete_user_and_auth(uuid) to authenticated;
