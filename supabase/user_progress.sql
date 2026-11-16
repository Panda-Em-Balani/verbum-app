-- Per-user saved progress: favourite verses, prayed novena days, the current rosary,
-- the days prayed (streak) and private intentions.
-- For a new database. An existing database needs migrations/20261113_progress_kinds.sql instead.
-- Used by src/progress.js. Run once in the Supabase SQL editor.
create table if not exists public.user_progress (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null constraint user_progress_kind_check check (kind in ('favorite', 'novena_day', 'rosary', 'prayer_log', 'intention')),
  item_key text not null check (char_length(item_key) <= 200),
  value jsonb constraint user_progress_value_size check (value is null or pg_column_size(value) <= 4096),
  updated_at timestamptz not null default now(),
  primary key (user_id, kind, item_key)
);

alter table public.user_progress enable row level security;

-- Each signed-in user can read and change only their own rows.
drop policy if exists "progress select own" on public.user_progress;
create policy "progress select own" on public.user_progress
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "progress insert own" on public.user_progress;
create policy "progress insert own" on public.user_progress
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "progress update own" on public.user_progress;
create policy "progress update own" on public.user_progress
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "progress delete own" on public.user_progress;
create policy "progress delete own" on public.user_progress
  for delete to authenticated using (user_id = auth.uid());
