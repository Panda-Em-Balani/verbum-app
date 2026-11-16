-- Allows the two new kinds of saved progress: the days prayed (streak) and private intentions.
-- Also limits how large one saved value can be.
-- Safe to run more than once. Run in the Supabase SQL editor.
alter table public.user_progress drop constraint if exists user_progress_kind_check;
alter table public.user_progress add constraint user_progress_kind_check
  check (kind in ('favorite', 'novena_day', 'rosary', 'prayer_log', 'intention'));

alter table public.user_progress drop constraint if exists user_progress_value_size;
alter table public.user_progress add constraint user_progress_value_size
  check (value is null or pg_column_size(value) <= 4096) not valid;
