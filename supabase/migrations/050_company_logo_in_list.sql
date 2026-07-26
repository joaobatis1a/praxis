-- Surfaces the company's logo (added in 047_company_logo.sql) in the maintenance panel's company
-- list, so the "Empresas cadastradas" table can show each company's photo next to its name.

drop function if exists public.list_all_companies();

create function public.list_all_companies()
returns table(
  id uuid,
  name text,
  company_number bigint,
  logo_url text,
  status text,
  created_at timestamptz,
  member_count bigint,
  admin_names text[],
  admin_emails text[],
  contact_name text,
  contact_phone text,
  notes text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id,
    c.name,
    c.company_number,
    c.logo_url,
    c.status,
    c.created_at,
    (select count(*) from public.profiles p where p.company_id = c.id),
    (select array_agg(p.name order by p.created_at) from public.profiles p where p.company_id = c.id and p.role = 'admin'),
    (select array_agg(p.email order by p.created_at) from public.profiles p where p.company_id = c.id and p.role = 'admin'),
    c.contact_name,
    c.contact_phone,
    c.notes
  from public.companies c
  where public.is_maintenance_account()
  order by c.created_at desc
$$;

grant execute on function public.list_all_companies() to authenticated;
