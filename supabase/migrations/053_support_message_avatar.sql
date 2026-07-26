-- WhatsApp-style avatars in the support chat: denormalize the sender's avatar url onto each
-- message at send time, same reasoning as the existing sender_name denormalization (the sender
-- may later leave the company / lose their profile row, but the message should still show who
-- sent it, photo included).
alter table public.support_messages add column if not exists sender_avatar_url text;
