-- If the "Convite de empresa gerado" modal is closed by accident right after creating a company,
-- there was previously no way to see that code again short of creating a whole new company —
-- invite_codes has no select policy at all (redemption reads it through a security-definer
-- function instead, see 001), and the code itself is reusable/persists indefinitely (unlike the
-- single-use maintenance codes in 035), it just wasn't retrievable from the UI.
create function public.get_company_invite_code(target_company_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_code text;
begin
  if not public.is_maintenance_account() then
    raise exception 'Not authorized.';
  end if;
  select code into v_code from public.invite_codes
  where company_id = target_company_id and role = 'admin'
  limit 1;
  return v_code;
end;
$$;

grant execute on function public.get_company_invite_code(uuid) to authenticated;
