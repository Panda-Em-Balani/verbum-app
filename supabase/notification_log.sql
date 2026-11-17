-- Reconstructed from the push sender's code. Compare with production before running.
-- Do not run against a database where the table already exists.
--
-- One row per notification sent, so each is sent only once a day.
-- Used only by the push sender (supabase/functions/push-sender), which runs with the
-- service role; nobody reads or writes it through the public API.
create table if not exists public.notification_log (
  id bigint generated always as identity primary key,
  tag text not null,
  sent_at timestamptz not null default now()
);

create index if not exists notification_log_tag_sent_at on public.notification_log (tag, sent_at);

-- Row level security on, with no policies: only the service role can use the table.
alter table public.notification_log enable row level security;
