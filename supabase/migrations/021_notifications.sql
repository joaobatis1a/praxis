-- Migrates Notificações off the in-memory mock. Targeting logic (exact user > department/role
-- OR > department only > roles only > broadcast) moves into the SELECT policy itself, replacing
-- the client-side isRelevant() filter — RLS now decides what's visible, not the app.

create function public.current_user_department()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select department from public.profiles where id = auth.uid()
$$;

create function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade default public.current_company_id(),
  type text not null,
  title text not null,
  description text not null,
  created_at timestamptz not null default now(),
  target_user_id uuid references public.profiles(id) on delete cascade,
  target_department text,
  target_roles text[],
  link_to text
);

alter table public.notifications enable row level security;

create policy "notifications_select_relevant" on public.notifications
  for select using (
    company_id = public.current_company_id()
    and (
      target_user_id = auth.uid()
      or (
        target_user_id is null
        and (
          (target_department is null and target_roles is null)
          or (target_department is not null and target_department = public.current_user_department())
          or (target_roles is not null and public.current_user_role() = any(target_roles))
        )
      )
    )
  );

create policy "notifications_insert_same_company" on public.notifications
  for insert with check (company_id = public.current_company_id());

-- per-user read state — a row means "read by this user", same shape as library_document_favorites
create table public.notification_reads (
  notification_id uuid not null references public.notifications(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now(),
  primary key (notification_id, user_id)
);

alter table public.notification_reads enable row level security;

create policy "notification_reads_select_own" on public.notification_reads
  for select using (user_id = auth.uid());

create policy "notification_reads_insert_own" on public.notification_reads
  for insert with check (user_id = auth.uid());

-- per-user disabled notification types — a row means "this type is disabled for this user"
create table public.notification_preferences (
  user_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  type text not null,
  primary key (user_id, type)
);

alter table public.notification_preferences enable row level security;

create policy "notification_preferences_select_own" on public.notification_preferences
  for select using (user_id = auth.uid());

create policy "notification_preferences_insert_own" on public.notification_preferences
  for insert with check (user_id = auth.uid());

create policy "notification_preferences_delete_own" on public.notification_preferences
  for delete using (user_id = auth.uid());
