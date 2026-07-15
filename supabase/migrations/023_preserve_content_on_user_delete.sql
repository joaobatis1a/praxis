-- Deleting/removing a user (delete_user_and_auth deletes the auth.users row, which cascades)
-- was also wiping out content they created, because notices.author_id and
-- procedure_completions.user_id were "on delete cascade". Both already keep a denormalized
-- name (author_name / user_name) for display, so there's no need to delete the row itself —
-- just null out the now-dangling reference to the deleted account.
alter table public.notices
  drop constraint if exists notices_author_id_fkey;
alter table public.notices
  alter column author_id drop not null;
alter table public.notices
  add constraint notices_author_id_fkey foreign key (author_id) references auth.users(id) on delete set null;

alter table public.procedure_completions
  drop constraint if exists procedure_completions_user_id_fkey;
alter table public.procedure_completions
  alter column user_id drop not null;
alter table public.procedure_completions
  add constraint procedure_completions_user_id_fkey foreign key (user_id) references auth.users(id) on delete set null;
