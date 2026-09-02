-- 1. In Supabase Dashboard, open Authentication > Users and create an email/password user.
-- 2. Copy that user's UUID (not an access token, password, or email) into the value below.
-- 3. Run this statement in the Supabase SQL Editor after all Phase 3 migrations.
-- 4. Keep this file as a template; do not commit a real user UUID.

insert into public.admin_users (user_id)
values ('00000000-0000-0000-0000-000000000000')
on conflict (user_id) do nothing;
