-- Limits the size of the extra details stored with each anonymous event, so the table
-- cannot be filled with large rows. Existing rows are left as they are.
-- Safe to run more than once. Run in the Supabase SQL editor.
alter table public.events drop constraint if exists events_props_size;
alter table public.events add constraint events_props_size
  check (pg_column_size(props) <= 2048) not valid;
