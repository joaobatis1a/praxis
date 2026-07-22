-- Lets a user delete/clear a notification from their own list without
-- affecting anyone else who was also targeted by the same row (a department-
-- or role-wide notification is one shared `notifications` row read by many
-- people — actually deleting it would remove it for everyone). Same shape
-- and per-user semantics as notification_reads.
create table public.notification_dismissals (
  notification_id uuid not null references public.notifications(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now(),
  primary key (notification_id, user_id)
);

alter table public.notification_dismissals enable row level security;

create policy "notification_dismissals_select_own" on public.notification_dismissals
  for select using (user_id = auth.uid());

create policy "notification_dismissals_insert_own" on public.notification_dismissals
  for insert with check (user_id = auth.uid());
