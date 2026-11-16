# Database files

Nothing here runs automatically. Each file is pasted into the Supabase SQL editor
(Supabase dashboard > SQL Editor > New query > paste > Run).

## For the existing (live) database

Run these two once, in this order. Both are safe to run again.

| File | What it does |
|---|---|
| `migrations/20261113_progress_kinds.sql` | Lets the app save prayer streak days and private intentions; limits the size of a saved value |
| `migrations/20261113_events_limits.sql` | Limits the size of anonymous event details |

Until the first one is run, streak days and intentions stay on each person's device. They
upload by themselves the next time the app opens after it is run. Nothing is lost.

## For a brand-new database

| File | Table | Notes |
|---|---|---|
| `user_progress.sql` | `user_progress` | Saved progress per user |
| `events.sql` | `events` | Anonymous share and install counts |
| `profiles.sql` | `profiles` | Names. Reconstructed from the app's code; compare with production first |
| `push_subscriptions.sql` | `push_subscriptions` | Devices for notifications. Reconstructed; compare with production first |

## Not in this repository yet

The push sender: the Supabase Edge Function (and its schedule) that sends the daily
notifications. It lives only in the Supabase project. Export it and add it here so it can
be restored if the project is ever lost.
