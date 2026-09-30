-- Anonymous share / install counts used by src/analytics.js.
-- Run once in the Supabase SQL editor.
create table if not exists public.events (
  id bigint generated always as identity primary key,
  event text not null check (char_length(event) <= 64),
  props jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

-- Anyone may add an event; nobody can read them through the public API.
drop policy if exists "events insert only" on public.events;
create policy "events insert only" on public.events
  for insert to anon, authenticated with check (true);

-- Example: shares and installs per day
-- select date_trunc('day', created_at) d, event, count(*) from public.events group by 1, 2 order by 1 desc;
