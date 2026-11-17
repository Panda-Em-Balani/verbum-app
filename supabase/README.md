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

| `notification_log.sql` | `notification_log` | Which notifications were sent each day. Reconstructed; compare with production first |

## The push-notification sender

`functions/push-sender/index.ts` is the Supabase Edge Function that sends the daily
notifications (7:00 AM verse, 8:00 AM feast days, 3:00 PM Three O'Clock Hour, UAE time).
The copy here is a backup and the source for updates. It only takes effect when pasted
into the function in the Supabase dashboard (Edge Functions > the function > Code > Deploy).

Its list of daily verses is generated from `src/verses.js`:

    npm run push-verses

A test fails if the list in the function differs from the app's, so the morning
notification always shows the same verse and wording as the Home screen. After any change
to the daily verses, run the command and paste the file into Supabase again.

Secrets the function needs (set in the function's settings, never in this repository):
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VAPID_SUBJECT`, `VAPID_PUBLIC_KEY`,
`VAPID_PRIVATE_KEY`.

## Not in this repository yet

The schedule that calls the sender (a cron job in the Supabase project), and the function's
real name there (this copy is filed as `push-sender`).
