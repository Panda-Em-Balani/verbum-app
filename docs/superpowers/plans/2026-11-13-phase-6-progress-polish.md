# Phase 6: Progress, Backend and Polish

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Read `2026-11-13-verbum-rebuild.md` first, especially Review Focus 3. Phase 5 must be complete.

**Goal:** Sync can't get stuck; people see their prayer streak, keep intentions and see when they prayed each novena day; the backend schema lives in the repo; motion and keyboard access are finished.

**Scope items:** O07, B15 (dated novena days, label), B17 (schema, events limit), V07 (motion), B18 (keyboard access).

**Owner action:** the two SQL migrations must run in Supabase **before** this phase is deployed to production. Until then the new kinds are rejected by the server; Task 1 makes that harmless (dropped, not stuck), but the data would not sync.

---

### Task 1: Sync queue that can't get stuck

**Files:**
- Modify: `src/progress.js`, `src/progress.test.js`

**Interfaces:**
- `send(op)` resolves to `'ok' | 'retry' | 'drop'`: `'ok'` without error; `'retry'` when the call throws, or `status` is 0, 401, 408, 429 or ≥ 500; `'drop'` for any other 4xx. `flush` removes `'ok'` and `'drop'` ops and stops at the first `'retry'`. A drop logs `console.warn('[Verbum] sync dropped', op.kind, status)` and calls `track('sync_drop', { kind: op.kind, status })`.
- Delete ops add `.eq('user_id', userId)` (RLS already limits rows; this makes the intent explicit).

- [ ] **Step 1: Write the failing tests** (jsdom; chainable Supabase mock returning programmable `{ error, status }`):
  - "loads a v1 cache unchanged": seed `verbum_progress_v1_u1` with `{ favorites: ['id:3','ref:Matthew 5:9'], novena: ['divine-mercy-0'], rosary: null, queue: [] }`, select fails → state has favourite `3` and `'Matthew 5:9'`, novena has `'divine-mercy-0'`.
  - "drops an op the server rejects with 4xx and continues": queue `[A (400), B (201)]` → both leave the queue, B was sent.
  - "keeps an op on network failure": thrown error → op stays, later ops not sent.
  - "retries on 401 and 503".
- [ ] **Step 2:** Implement. Pass.
- [ ] **Step 3:** Commit `fix: a rejected sync change no longer blocks later ones`.

### Task 2: Schema in the repo (B17)

**Files:**
- Create: `supabase/migrations/20261113_progress_kinds.sql`, `supabase/migrations/20261113_events_limits.sql`, `supabase/profiles.sql`, `supabase/push_subscriptions.sql`, `supabase/README.md`
- Modify: `supabase/user_progress.sql`

- [ ] **Step 1:** `20261113_progress_kinds.sql`:
  ```sql
  alter table public.user_progress drop constraint if exists user_progress_kind_check;
  alter table public.user_progress add constraint user_progress_kind_check
    check (kind in ('favorite', 'novena_day', 'rosary', 'prayer_log', 'intention'));
  alter table public.user_progress add constraint user_progress_value_size
    check (value is null or pg_column_size(value) <= 4096) not valid;
  ```
  Update `user_progress.sql` so a fresh install gets the same constraints.
- [ ] **Step 2:** `20261113_events_limits.sql`: `alter table public.events add constraint events_props_size check (pg_column_size(props) <= 2048) not valid;`
- [ ] **Step 3:** `profiles.sql` and `push_subscriptions.sql`, each starting with `-- Reconstructed from the app's code. Compare with production before running. Do not run against a database where the table already exists.` Profiles: `id uuid primary key references auth.users(id) on delete cascade`, `name text not null check (char_length(name) between 1 and 80)`, RLS select/insert/update own (`id = auth.uid()`). Push subscriptions: `id bigint generated always as identity primary key`, `user_id uuid not null references auth.users(id) on delete cascade`, `endpoint text not null unique`, `p256dh text not null`, `auth text not null`, `created_at timestamptz not null default now()`, RLS select/insert/update/delete own (`user_id = auth.uid()`; upsert needs select, insert and update).
- [ ] **Step 4:** `supabase/README.md`: what each file is, run order, and that the push sender (Edge Function) is not yet in the repo and the owner has been asked for it.
- [ ] **Step 5:** Commit `chore: database schema and migrations in the repo`.

### Task 3: Prayer log, streak and dated novena days (O07, B15)

**Files:**
- Create: `src/streak.js`, `src/streak.test.js`, `src/screens/home/PrayerWeekStrip.jsx`
- Modify: `src/progress.js`, `src/progress.test.js`, `HomeScreen.jsx`, `RosaryView.jsx`, `NovenaView.jsx`, `ThreeOClockView.jsx`

**Interfaces:**
- State additions (local cache gains the same fields; a cache without them loads as empty): `prayerLog: Map<dateKey, string[]>`, `intentions: Map<id, { text, createdAt, answeredAt }>` (Task 4). `novena` becomes `Map<key, dateKey | null>` (`.has` keeps working; old entries map to `null`).
- Server rows: `prayer_log` with `item_key` = date key and `value { acts: string[] }`; `novena_day` puts now carry `value { date }`.
- Produces in `progress.js`: `logPrayer(act: 'rosary' | 'novena' | 'chaplet'): void` (adds `act` to today's entry once; no-op if present or signed out). `toggleNovenaDay(key)` stores today's date when adding and calls `logPrayer('novena')`.
- Produces `src/streak.js`: `computeStreak(dateKeys: Iterable<string>, todayKey: string): { current: number, last7: Array<{ dateKey: string, prayed: boolean }> }`. `current` counts consecutive prayed days ending today, or ending yesterday when today has none yet; `last7` runs oldest to newest and ends today. Uses `addDays` from `src/utils/date.js`.
- `PrayerWeekStrip({ prayerLog })`: seven 32 px circles with weekday initials (filled `GOLD` with `ON_GOLD` check when prayed, `SURFACE` with `BORDER` otherwise), then "{n}-day streak" (`n ≥ 1`) or "Pray the Rosary, a novena day or the Chaplet to begin a streak." Placed on Home after `DailyVerseCard`.
- Triggers: `RosaryView` calls `logPrayer('rosary')` once when all five decades reach 10 beads; `ThreeOClockView` gets a `secondaryButton` "I prayed the Chaplet" → `logPrayer('chaplet')`, which shows "Prayed today ✓" once today's log has `chaplet`. Novena day button labels: "Mark day {n} as prayed" / "Day {n} prayed ✓ · {D Mon}" (date omitted when `null`).

- [ ] **Step 1: Write the failing tests**: `streak.test.js` › "empty is 0"; "today and yesterday is 2"; "yesterday only is 1"; "a gap resets"; "last7 has 7 days ending today, oldest first"; "crosses a month boundary". `progress.test.js` › "logPrayer adds an act once"; "toggleNovenaDay stores today's date"; "a v1 cache with novena as an array loads as a Map with null dates".
- [ ] **Step 2:** Implement and wire. Pass.
- [ ] **Step 3:** Commit `feat: prayer streak and dated novena days`.

### Task 4: Intentions journal (O07)

**Files:**
- Create: `src/screens/prayers/IntentionsView.jsx`, `src/screens/prayers/IntentionsView.test.jsx`
- Modify: `src/progress.js`, `src/router.js` (+ test), `PrayersScreen.jsx`, `App.jsx`, `scripts/screens.cjs`

**Interfaces:**
- Produces in `progress.js`: `addIntention(text: string): string | null` (trims; empty or > 500 characters → `null`; id from `crypto.randomUUID()`; `createdAt` ISO), `toggleIntentionAnswered(id: string): void` (sets/clears `answeredAt`), `deleteIntention(id: string): void`. Server kind `intention`, `item_key` = id.
- Router: add `intentions "/prayers/intentions"` before `novena`; `tabOf('intentions') === 'prayers'`; router test asserts the match.
- `IntentionsView`: Back (`goBack('/prayers')`), title "My Intentions", a labelled textarea (max 500, live "{n}/500"), "Add intention" `primaryButton` (disabled when empty), list newest first: text (`FONT_UI` 16), "Added {D Mon}", "Mark answered" / "Answered ✓ {D Mon}" toggle, "Delete" → `ConfirmDialog` ("Delete this intention?", destructive). Empty state: "Write down what you are praying for. Only you can see these." The Prayers list gets a "My Intentions" card at the top linking to the route.

- [ ] **Step 1: Write the failing test** `IntentionsView.test.jsx` (progress functions mocked): "adds an intention and clears the box"; "Add is disabled for blank text"; "delete asks first and only deletes on confirm".
- [ ] **Step 2:** Implement. Pass. Add `20-intentions` to the screenshot script.
- [ ] **Step 3:** Commit `feat: private intentions journal`.

### Task 5: Keyboard access for cards (B18) and motion (V07)

**Files:**
- Create: `src/components/Collapse.jsx`, `src/components/VerseCard.test.jsx`
- Modify: `VerseCard.jsx`, `DailyVerseCard.jsx`, `PrayersScreen.jsx` (prayer cards), `ExploreScreen.jsx` (saved cards), `ThreeOClockBanner.jsx`, `ThreeOClockView.jsx`, `SaintCard.jsx`, `App.jsx`, `src/styles/globalCss.js`

**Interfaces:**
- Card pattern: the card container is a plain `div`; its tappable header (text + ref + the +/− mark) is a full-width `<button type="button" aria-expanded={open}>` with no default button styling; the heart and share buttons sit **outside** that button. No `onClick` on any `div` remains (`grep -rn "<div[^>]*onClick" src` → no output).
- `Collapse({ open: boolean, children })`: wrapper with `display: grid`, `gridTemplateRows: open ? '1fr' : '0fr'`, transition 200 ms ease; inner `overflow: hidden`; children stay mounted; `aria-hidden` and `inert` when closed.
- `GLOBAL_CSS` adds `@keyframes verbum-fade { from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: none } }` and `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important } }`. The routed screen wrapper in `App.jsx` gets `key={route.name}` and `animation: verbum-fade 150ms ease-out`.
- Saint photo: while loading, its 80×80 box shows a `SURFACE` → `CARD` shimmer (`background-size: 200% 100%` with a 1.2 s linear infinite animation), replaced by the image on load, the `Cross` on error.

- [ ] **Step 1: Write the failing test** `VerseCard.test.jsx` (jsdom): "the card toggles from its header button" (click the button named by the verse text → `aria-expanded="true"`); "the heart is not inside the toggle button" (`heart.closest('button[aria-expanded]')` is `null`); "collapsed content is inert".
- [ ] **Step 2:** Implement for every card listed. Pass.
- [ ] **Step 3:** Keyboard check in the screenshot browser (add to the script): on `/explore`, press Tab until the first verse header is focused, press Enter, expect it expanded; press Tab, expect focus on the heart.
- [ ] **Step 4:** Per-phase checklist. Screens to `<scratchpad>/phase-6-after`. Commit `feat: keyboard-friendly cards and gentle motion` and push.

### Task 6: Wrap-up

- [ ] **Step 1:** Re-run every screenshot and Read each one. Compare against `phase-1-before` and write a short before/after summary for the owner.
- [ ] **Step 2:** Tell the owner, in one message: what shipped by phase; the owner actions still open (SQL migrations, Supabase URLs, optional Google, preview database, push-sender code, content review); and that a pull request can be opened when they ask.
