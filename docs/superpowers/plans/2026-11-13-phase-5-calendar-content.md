# Phase 5: Liturgical Calendar and Content

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Read `2026-11-13-verbum-rebuild.md` first, especially Review Focus 5 and the content constraints. Phase 4 must be complete.

**Goal:** The day, season, saint and feast are right every day; the app takes the season's colour; the rosary and greeting behave; the verse library is fuller and correctly credited; the Mass screen is reliable; content doubts are listed for a human.

**Scope items:** O01, B11, V02, B15 (rosary default, same-day resume, greeting), B12, O08, B19, B14, O09.

**Verified facts (checked while planning; do not re-derive):** romcal 1.3.0 `calendarFor({ year, country: 'general', locale: 'en' })` returns exactly one celebration per date, each with `key`, `name`, `type`, `data.season.key`, `data.meta.liturgicalColor.key`. Types seen: `SOLEMNITY, FEAST, MEMORIAL, OPT_MEMORIAL, COMMEMORATION, SUNDAY, FERIA, HOLY_WEEK, TRIDUUM`. Season keys: `Advent, Christmastide, Early Ordinary Time, Later Ordinary Time, Lent, Holy Week, Easter`. Colours: `WHITE, GREEN, RED, PURPLE, ROSE`. One year compacts to ~41 KB JSON (~7 KB gzip). Samples: 2026-11-13 `fridayOfThe32ndWeekOfOrdinaryTime` GREEN; 2026-01-11 `baptismOfTheLord` FEAST WHITE (Christmastide); 2026-10-15 `saintTeresaOfJesusVirginAndDoctorOfTheChurch` MEMORIAL; 2026-03-04 `saintCasimir` COMMEMORATION PURPLE (Lent); 2025-12-14 `3rdSundayOfAdvent` ROSE; 2026-01-04 `epiphany` (the general calendar in romcal moves Epiphany to Sunday).

---

### Task 1: Date utilities and generated calendar data

**Files:**
- Create: `src/utils/date.js`, `src/utils/date.test.js`, `scripts/build-liturgical-calendar.mjs`, `src/liturgy/data/2025.json` … `src/liturgy/data/2036.json`
- Modify: `package.json` (devDependency `romcal@1.3.0`, script `"calendar": "node scripts/build-liturgical-calendar.mjs"`), `README.md`

**Interfaces:**
- Produces `src/utils/date.js`: `localDateKey(date: Date): string` (`YYYY-MM-DD` from local fields), `addDays(dateKey: string, n: number): string`, `msUntilMidnight(date: Date): number` (to the next local midnight, ≥ 1).
- Produces data files: `{ "MM-DD": [key, name, type, seasonKey, colorKey], ... }` for every date of that year.

- [ ] **Step 1: Write the failing test** `date.test.js`: "localDateKey uses local fields near midnight" (`new Date(2026, 10, 13, 23, 59)` → `2026-11-13`); "addDays crosses month and year" (`2026-02-28` +1 → `2026-03-01`; `2026-12-31` +1 → `2027-01-01`; `2026-03-01` −1 → `2026-02-28`); "msUntilMidnight" (`new Date(2026, 0, 1, 23, 0)` → 3,600,000).
- [ ] **Step 2:** Implement. Pass.
- [ ] **Step 3:** `npm i -D -E romcal@1.3.0`. Write `scripts/build-liturgical-calendar.mjs` (romcal is CommonJS: `createRequire(import.meta.url)('romcal')`), writing one file per year 2025–2036 in the format above. Run `npm run calendar`. Expected: 12 files, each 365 or 366 keys (assert in the script and exit 1 otherwise).
- [ ] **Step 4:** Commit `feat: pre-built liturgical calendar data 2025-2036`.

### Task 2: Calendar module and hook

**Files:**
- Create: `src/liturgy/calendar.js`, `src/liturgy/calendar.test.js`, `src/liturgy/useLiturgicalDay.js`
- Modify: `src/liturgy/legacy.js` (add `fallbackDay`)

**Interfaces:**
- `LiturgicalDay = { dateKey: string, key: string | null, name: string, rank: string, season: 'advent'|'christmas'|'lent'|'holyWeek'|'easter'|'ordinary', color: 'green'|'purple'|'white'|'red'|'rose', source: 'romcal'|'fallback' }`.
- Season mapping: `Advent→advent`, `Christmastide→christmas`, `Lent→lent`, `Holy Week→holyWeek`, `Easter→easter`, both Ordinary Time keys → `ordinary`. Colour: lower-case of the colour key.
- Produces `getLiturgicalDay(date: Date): Promise<LiturgicalDay>`: loads the year file through `import.meta.glob('./data/*.json', { import: 'default' })` (cached per year); missing year or date → `fallbackDay(date)`.
- Produces in `legacy.js`: `fallbackDay(date: Date): LiturgicalDay` from `getLiturgicalSeason(date)` (`key: null`, `rank: 'FERIA'`, `name` = season name, colour green/purple/white by season, `source: 'fallback'`).
- Produces `useLiturgicalDay(): LiturgicalDay | null` (`null` until loaded); re-runs at local midnight using `msUntilMidnight`.

- [ ] **Step 1: Write the failing test** `calendar.test.js`: each verified sample above returns its key, rank, season and colour; "uses local date near midnight" (`new Date(2026, 10, 13, 23, 59)` → key for 2026-11-13); "falls back outside generated years" (`new Date(2040, 5, 1)` → `source: 'fallback'`, `season: 'ordinary'`).
- [ ] **Step 2:** Implement. Pass.
- [ ] **Step 3:** Commit `feat: liturgical day lookup with fallback`.

### Task 3: Today card, saint and feast matching (B11)

**Files:**
- Create: `src/liturgy/match.js`, `src/liturgy/match.test.js`, `src/screens/home/TodayCard.jsx`
- Modify: `src/content/saints.js`, `src/content/happenings.js`, `HomeScreen.jsx`, `SaintCard.jsx`, `TodayInChurchCard.jsx`, `src/liturgy/legacy.js`

**Interfaces:**
- Data: every saint and happening gets `romcalKey: string | null`. Fill it by searching the names in the whole of `src/liturgy/data/2026.json` (not only the entry's own date: some app dates follow the US calendar, e.g. Camillus de Lellis is 18 July in the app but `saintCamillusDeLellisPriest` on 14 July in the general calendar). Set the key only when the celebration is clearly the same person or event; otherwise `null`. Moveable happenings (the Baptism of the Lord) get their key and their fixed `month`/`day` become `null`. Both Peter and Paul use `peterAndPaulApostles` (verified). Every entry whose general-calendar date differs from the app's date goes into `docs/content-review.md` (Task 7) under "Calendar dates".
- Produces `pickForDay(day: LiturgicalDay, items: Array<{ romcalKey, feast?: {m,d}, month?, day? }>): { item, by: 'key' | 'date' } | null`: first pass, the first item whose `romcalKey === day.key`; only if none, second pass, the first item **without** a `romcalKey` whose date equals `day.dateKey`'s month/day, and only when `day.rank` is `FERIA`, `OPT_MEMORIAL` or `COMMEMORATION`. Key matches always beat date matches.
- Produces `RANK_LABEL`: `SOLEMNITY "Solemnity"`, `FEAST "Feast"`, `MEMORIAL "Memorial"`, `OPT_MEMORIAL "Optional memorial"`, `COMMEMORATION "Commemoration"`, `SUNDAY "Sunday"`, `FERIA "Weekday"`, `HOLY_WEEK "Holy Week"`, `TRIDUUM "Easter Triduum"`.
- Produces `SEASON_TEXT`: name and one-line description per season (reuse today's descriptions; `holyWeek`: "Holy Week", "The holiest week of the year, from Palm Sunday through the Easter Triduum.").
- `TodayCard({ day })`: eyebrow "Today in the Church", `day.name` (title), `RANK_LABEL[day.rank]` · season name, the season description. Background is the season tint from Task 4 (until then `SURFACE`).
- Home order: greeting, `DailyVerseCard`, `ThreeOClockBanner` (15:00 hour only), `TodayCard`, `TodayInChurchCard` (if `pickForDay(day, HAPPENINGS)`), `SaintCard` (if `pickForDay(day, SAINTS)`), Invite. Delete the old season card, `getSaintOfDay` and its rotation fallback. While `day` is `null`, render nothing in those slots.
- `SaintCard` receives `by` and shows "Feast day: {Month D}" (from `day.dateKey`) when `by === 'key'` or the match came from its date; the old year-2024 date formatting goes.

- [ ] **Step 1: Write the failing test** `match.test.js` with real `LiturgicalDay` objects from `getLiturgicalDay`: 2026-10-15 → Teresa of Avila; 2026-11-13 → no saint, no happening; 2026-01-11 → the Baptism of the Lord happening; 2027-01-10 → the Baptism happening again (moveable); 2026-06-29 → Saint Peter (key `peterAndPaulApostles`); 2026-03-04 → Saint Casimir happening; 2026-07-14 → Saint Camillus de Lellis by key (not Kateri by date); 2026-10-05 (FERIA) → Saint Faustina by date; and "every saint and happening with a romcalKey matches at least once in 2026–2027" (scan both years).
- [ ] **Step 2:** Implement and fill the data. Pass.
- [ ] **Step 3:** Commit `fix: saint and feast of the day follow the real calendar`.

### Task 4: Seasonal colours (V02)

**Files:**
- Create: `src/liturgy/seasonTheme.js`, `src/liturgy/seasonTheme.test.js`
- Modify: `AppHeader.jsx`, `TodayCard.jsx`, `App.jsx`

**Interfaces:**
- Produces `seasonTheme(color: LiturgicalDay['color']): { header: string, accent: string, tint: string }`, exactly: green `#2F5D3A / #3E7A4C / #EAF3EC`; purple `#4B2E6B / #6A4A92 / #F0EAF6`; rose `#8C3F63 / #A8577B / #F8EAF1`; red `#8E2A2A / #A83B3B / #F8EAEA`; white `#8B4513 / #B8860B / #FFF6E0`. Unknown → white.
- Header background = `seasonTheme(day.color).header` (`HEADER_BG` while `day` is `null`); `meta[name=theme-color]` content updated to match. `TodayCard` uses `tint` background and a 1.5 px `accent` border.

- [ ] **Step 1: Write the failing test**: "header text is readable on every season" (`contrastRatio(HEADER_TEXT, header) >= 4.5` for all five); "TEXT is readable on every tint" (≥ 4.5); "unknown colour falls back to white".
- [ ] **Step 2:** Implement and wire. Pass. Screens with the clock stubbed is not needed; instead Read `01-home.png` and confirm a green header (13 Nov is Ordinary Time).
- [ ] **Step 3:** Commit `feat: header and Today card follow the liturgical colour`.

### Task 5: Rosary, resume and greeting (B15 part)

**Files:**
- Create: `src/content/mysteryForDate.js`, `src/content/mysteryForDate.test.js`
- Modify: `RosaryView.jsx`, `src/progress.js`, `HomeScreen.jsx`

**Interfaces:**
- Produces `mysteryForDate(date: Date): 'Joyful'|'Sorrowful'|'Glorious'|'Luminous'`: Mon, Sat Joyful; Tue, Fri Sorrowful; Wed, Sun Glorious; Thu Luminous.
- `progress.js`: `today()` reuses `localDateKey(new Date())`. In `initProgress`, the local copy's `rosary` is dropped when its `date` isn't today, before the first `emit` (today it is only dropped after the server answers).

- [ ] **Step 1: Write the failing tests**: "mysteryForDate covers all seven weekdays" (13–19 Nov 2026 = Fri…Thu); in `src/progress.test.js` (create; jsdom; Supabase mocked to fail the select) "drops a local rosary from another day".
- [ ] **Step 2:** Implement. `RosaryView` initial mystery = saved rosary's mystery if present, else `mysteryForDate(new Date())`. Home greeting uses the first name in the morning, afternoon and evening ("Good Afternoon, Ana"). Pass.
- [ ] **Step 3:** Commit `fix: rosary opens on today's mysteries; greeting always uses the name`.

### Task 6: Verse library (B12, O08) and the NABRE notice

**Files:**
- Modify: `src/verses.js`, `src/content/categories.js`, `ExploreScreen.jsx`, `SoulScreen.jsx`, `AccountSheet.jsx`, `src/InstallPage.jsx`, `src/verses.test.js`
- Create: `src/content/credits.js`

**Interfaces:**
- `VERSES` grows to at least 60 entries; new ids continue from 16 with no gaps; existing entries unchanged. Each new entry has `ref`, `text` (NABRE wording), `book`, `category` (2–4 of the CATEGORIES ids), `explanation` (2–4 sentences, Catholic perspective, same voice as existing entries), `example` (1–3 sentences).
- Produces `src/content/credits.js`: `export const NABRE_NOTICE = "Scripture texts in this work are taken from the New American Bible, revised edition © 2010, 1991, 1986, 1970 Confraternity of Christian Doctrine, Inc., Washington, DC and are used by permission of the copyright owner. All Rights Reserved. No part of the New American Bible may be reproduced in any form without permission in writing from the copyright owner.";`
- Produces in `verses.js`: `LIBRARY`: `[...VERSES, ...DAILY_VERSES not already in VERSES by ref, each given id = ref]` (daily verses already favourite by ref, so their favourite keys don't change).

- [ ] **Step 1: Write the failing tests** in `verses.test.js`: "every category has at least 4 verses in LIBRARY"; "VERSES has at least 60 entries with unique refs"; "quoted Scripture stays under 4,500 words" (sum of `text` word counts across VERSES and DAILY_VERSES, deduplicated by ref); "every VERSES category id is a CATEGORIES id or one of courage, purpose, rest, suffering, prayer, relationships, virtue, guidance"; the Task 1 fixture test still passes.
- [ ] **Step 2:** Write the new verses. For each, fetch the chapter from `https://bible.usccb.org/bible/<book>/<chapter>` with the web-fetch agent and copy the wording exactly, using NABRE verse numbering (Psalms often differ by one from other Bibles). If the site can't be fetched, still add the verse but list it under "Unverified wording" in `docs/content-review.md` (Task 7). Pass the tests.
- [ ] **Step 3:** Explore Browse lists `LIBRARY` (favourite key = `id`); Saved resolves favourites against `LIBRARY`. Soul shows up to 6 matches.
- [ ] **Step 4:** `NABRE_NOTICE` appears in the AccountSheet "About Verbum" section and in small `MUTED` text at the bottom of `InstallPage`.
- [ ] **Step 5:** Commit `feat: fuller verse library with NABRE credit`.

### Task 7: Content review list (B19)

**Files:**
- Create: `docs/content-review.md`

- [ ] **Step 1:** Write the list for a human reviewer, with one table per section (item, where it is in the code, what to check, suggested fix). Change no prayer or verse text. Sections, at least:
  - **Verse numbering:** every Psalm reference in VERSES and DAILY_VERSES checked against NABRE numbering. Known: "Psalm 46:10" text is NABRE 46:11; "Psalm 34:18" text is NABRE 34:19. Refs stay as they are in code (shared links depend on them); the reviewer decides whether to show a corrected label.
  - **Catechism citations:** every `CCC nnn` in `src/content/*.js` and `src/verses.js` with the claim it supports (grep `CCC [0-9]`).
  - **Quote attributions:** saint quotes whose source is uncertain, e.g. the Francis of Assisi "Start by doing what is necessary…", the Catherine of Siena "Be who God meant you to be…", the Paul quote using a non-NABRE wording of Philippians 4:13.
  - **Calendar dates:** saints and happenings whose app date differs from the general Roman calendar (from Task 3), e.g. Camillus de Lellis.
  - **Shortened prayers:** the Divine Mercy novena day prayers are shortened from the Diary text.
  - **Unverified wording:** from Task 6, if any.
- [ ] **Step 2:** Commit `docs: content review list for a human proofreader`.

### Task 8: Mass screen (B14, O09)

**Files:**
- Modify: `src/content/streams.js`, `src/screens/MassScreen.jsx`

**Interfaces:**
- `STREAMS` entries: `{ id, label, note, icon: 'cross'|'broadcast', embedUrl: string | null, watchUrl: string }`:
  - Vatican News: `embedUrl` unchanged, `watchUrl "https://www.youtube.com/channel/UCz6g_U1LHLQNR6vT0ENPMbA/live"`.
  - Salt + Light: `embedUrl` unchanged, `watchUrl "https://www.youtube.com/channel/UCHHmjz7kliVPUCkqMxRLWlA/live"`.
  - EWTN: `embedUrl: null` (the fixed video ID goes stale), `watchUrl "https://www.ewtn.com/tv/watch-live"`.
- Constant `MASS_TIMES_URL = "https://masstimes.org/"`.

- [ ] **Step 1:** Check each `watchUrl` and `MASS_TIMES_URL` with the web-fetch agent. A URL whose site answers with an error page (not a bot refusal) is removed with its stream; note what you found in the commit message.
- [ ] **Step 2:** Mass screen: streams with `embedUrl` play inline as today; under the player, always show "Not playing? Open it in YouTube" linking `watchUrl` (`target="_blank" rel="noopener noreferrer"`). A stream with `embedUrl: null` shows "Watch on EWTN" as a `secondaryButton` link instead of selecting a player. A "Find Mass times near you" card (title, one line, `secondaryButton` link to `MASS_TIMES_URL`) sits above "A Note on Virtual Mass".
- [ ] **Step 3:** Per-phase checklist. Screens to `<scratchpad>/phase-5-after`. Commit `fix: reliable Mass streams and Mass times link` and push.
