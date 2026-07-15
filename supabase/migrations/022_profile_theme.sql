-- Persists the user's light/dark theme choice on their profile, so it follows them across
-- devices/browsers instead of living only in that browser's localStorage.
alter table public.profiles
  add column if not exists theme text check (theme in ('light', 'dark'));
