-- Lets a user remove themself from a company while keeping their Supabase Auth login intact —
-- unlike delete_user_and_auth, which removes the login too. Needed so the Praxis owner (see
-- is_praxis_owner() in 019_support_tickets.sql) can hand off admin and step away from his own
-- company without losing access to the Central de Suporte inbox, which is tied to his login email.
-- Self-scoped via auth.uid() internally — no target-user parameter, so it can never touch anyone
-- else's row.

create or replace function public.leave_company()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.profiles where id = auth.uid();
end;
$$;
