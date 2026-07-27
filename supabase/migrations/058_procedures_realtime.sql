-- Procedures had no realtime subscription at all — a newly published procedure (or one edited/
-- deleted) never appeared for other department members without an F5. RLS on the table already
-- scopes visibility correctly (own department + published, or own drafts), so adding it to the
-- realtime publication is enough; Realtime re-evaluates the SELECT policy per row/per subscriber.
alter publication supabase_realtime add table public.procedures;
