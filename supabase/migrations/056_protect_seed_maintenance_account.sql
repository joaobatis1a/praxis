-- The very first maintenance account is seeded by hand (see the comment at the end of
-- 032_maintenance_accounts.sql: `added_by = 'seed'`) since no UI can create it. It should never
-- be removable through the app, by anyone — including another maintenance account — since it's
-- the one guaranteed way back in if something goes wrong with every other account.
create or replace function public.remove_maintenance_account(target_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  total int;
begin
  if not public.is_maintenance_account() then
    raise exception 'Not authorized.';
  end if;
  if exists (select 1 from public.maintenance_accounts where email = lower(trim(target_email)) and added_by = 'seed') then
    raise exception 'Esta conta foi criada por seed e não pode ser removida.';
  end if;
  select count(*) into total from public.maintenance_accounts;
  if total <= 1 then
    raise exception 'Cannot remove the last maintenance account.';
  end if;
  delete from public.maintenance_accounts where email = lower(trim(target_email));
end;
$$;
