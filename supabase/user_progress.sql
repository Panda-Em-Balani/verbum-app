-- Per-user saved progress: favourite verses, prayed novena days and the current rosary.
-- Used by src/progress.js. Run once in the Supabase SQL editor.
create table if not exists public.user_progress (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (kind in ('favorite', 'novena_day', 'rosary')),
  item_key text not null check (char_length(item_key) <= 200),
  value jsonb,
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
