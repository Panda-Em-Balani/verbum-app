-- Reconstructed from the app's code. Compare with production before running.
-- Do not run against a database where the table already exists.
--
-- One row per device that allowed notifications. Written by src/notifications.js; read by
-- the push sender (a Supabase Edge Function that is not in this repository yet).
create table if not exists public.push_subscriptions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

-- Each signed-in user can manage only their own devices. (Saving a device is an "upsert",
-- which needs select, insert and update.)
drop policy if exists "push select own" on public.push_subscriptions;
create policy "push select own" on public.push_subscriptions
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "push insert own" on public.push_subscriptions;
create policy "push insert own" on public.push_subscriptions
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "push update own" on public.push_subscriptions;
create policy "push update own" on public.push_subscriptions
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "push delete own" on public.push_subscriptions;
create policy "push delete own" on public.push_subscriptions
  for delete to authenticated using (user_id = auth.uid());
