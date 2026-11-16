-- Reconstructed from the app's code. Compare with production before running.
-- Do not run against a database where the table already exists.
--
-- One row per user: the name used in the greeting. Used by src/auth/useAuth.js.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80)
);

alter table public.profiles enable row level security;

-- Each signed-in user can read and change only their own row.
drop policy if exists "profiles select own" on public.profiles;
create policy "profiles select own" on public.profiles
  for select to authenticated using (id = auth.uid());

drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own" on public.profiles
  for insert to authenticated with check (id = auth.uid());

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
