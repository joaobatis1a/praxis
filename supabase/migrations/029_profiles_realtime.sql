-- Let a user's own session pick up role/department/status changes live, without a reload.
alter publication supabase_realtime add table public.profiles;
