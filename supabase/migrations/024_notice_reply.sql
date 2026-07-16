-- Lets the recipient reply to an aviso instead of only marking it read.
alter table public.notices
  add column if not exists reply text,
  add column if not exists replied_at timestamptz;
