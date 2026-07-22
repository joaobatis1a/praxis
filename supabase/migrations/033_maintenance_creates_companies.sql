-- Company creation stops being self-service in the real (Supabase) deployment — a sales-led
-- product shouldn't let a random visitor spin up a free company, and a company's own employee
-- shouldn't be able to bypass an invite and create a separate company for themself either.
-- Only a maintenance account can create a company now, from the /manutencao panel, which then
-- hands out an admin invite code for the client's first user to redeem — same redemption flow
-- as any other invite, just with role 'admin' and a brand new, empty company behind it.
drop policy "companies_insert_any_authenticated" on public.companies;

create function public.create_company_for_client(company_name text, invite_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_company_id uuid;
begin
  if not public.is_maintenance_account() then
    raise exception 'Not authorized.';
  end if;

  insert into public.companies (name) values (company_name) returning id into new_company_id;
  insert into public.invite_codes (code, company_id, role) values (invite_code, new_company_id, 'admin');

  return new_company_id;
end;
$$;

grant execute on function public.create_company_for_client(text, text) to authenticated;
