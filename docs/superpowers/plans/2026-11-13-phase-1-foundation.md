# Phase 1: Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Read `2026-11-13-verbum-rebuild.md` (Global Constraints, Review Focus) first.

**Goal:** A test harness, a screenshot script, CI, and `App.jsx` split into focused files, then the starter CSS removed. Apart from Task 5, nothing changes on screen.

**Scope items:** O10 (split, tests, CI, README), B01, B18 (tests, CI, agent note).

## Target file structure (end of phase)

```
src/
  main.jsx                 entry (unchanged role)
  App.jsx                  shell only: session gate, banners, tab switch, layout
  theme.js                 unchanged this phase
  verses.js                unchanged (api/ imports it)
  content/
    saints.js              SAINTS            (App.jsx 19-50)
    rosary.js              ROSARY            (53-82)
    novenas.js             NOVENAS           (85-166)
    threeOclock.js         THREE_OCLOCK_PRAYER (169-176)
    categories.js          CATEGORIES        (179-186)
    happenings.js          HAPPENINGS        (360-407, lifted out of the component)
    prayers.js             PRAYERS           (833-838, lifted out of PrayersTab)
    streams.js             STREAMS           (883-902, lifted out of MassTab)
  liturgy/
    legacy.js              getEaster, getLiturgicalSeason, getSaintOfDay, isThreeOClockHour (189-223)
  dailyVerse.js            getDailyVerseStatic (554-558)
  components/
    Icons.jsx              Cross, HomeIco, ChatIco, BookIco, PrayIco, MassIco, HeartIco, ChevIco, BellIco, LockIco, CalendarIco, StarIco, UserIco (226-236, 451-453)
    Pill.jsx               Pill (235)
    VerseCard.jsx          VerseCard (239-267)
    NotificationBanner.jsx (270-303)
    InstallBanner.jsx      (306-328)
    AppHeader.jsx          (506-550)
    BottomNav.jsx          bottom nav block (1317-1328) as a component
  screens/
    auth/LoginPage.jsx     moved from src/LoginPage.jsx
    auth/NamePrompt.jsx    (457-503)
    home/HomeScreen.jsx    HomeTab (676-716)
    home/DailyVerseCard.jsx (554-595, minus getDailyVerseStatic)
    home/SaintCard.jsx     SaintOfDayCard (598-673)
    home/TodayInChurchCard.jsx DailyCatholicHappening (358-448, minus data)
    home/ThreeOClockBanner.jsx (331-355)
    SoulScreen.jsx         SoulCheckTab (991-1049)
    ExploreScreen.jsx      BibleSearchView + ExploreTab (719-756)
    prayers/PrayersScreen.jsx PrayersTab list + section switch (820-879 minus rosary block)
    prayers/RosaryView.jsx  the `section==="rosary"` block (855-876) plus its state and save effect
    prayers/NovenaView.jsx  (759-799)
    prayers/ThreeOClockView.jsx (802-817)
    MassScreen.jsx         MassTab (882-988, minus data)
  styles/globalCss.js      GLOBAL_CSS string: the `<style>` block in App.jsx 1274-1289, verbatim
scripts/
  screens.cjs              local screenshot script
  snapshot-verse-slugs.mjs one-off fixture generator (Task 1)
.github/workflows/ci.yml
```

Line numbers refer to `src/App.jsx` at commit `aa3cc9c`. Components keep their names, props and markup exactly.

---

### Task 1: Test harness and the shared-link safety net

**Files:**
- Modify: `package.json` (scripts, devDependencies), `vite.config.js`, `eslint.config.js`
- Create: `scripts/snapshot-verse-slugs.mjs`, `src/__fixtures__/verse-slugs.json`, `src/verses.test.js`

**Interfaces:**
- Produces: `npm test` (= `vitest run`); test files live next to code as `src/**/*.test.{js,jsx}`; jsdom tests opt in with a first-line `// @vitest-environment jsdom`.

- [ ] **Step 1:** `npm i -D -E vitest@5.1.0 jsdom@31.0.1 @testing-library/react@16.3.3`. Add scripts `"test": "vitest run"`, `"test:watch": "vitest"`.
- [ ] **Step 2:** In `vite.config.js` add `test: { environment: 'node', include: ['src/**/*.test.{js,jsx}'] }`. In `eslint.config.js` add a block for `['scripts/**/*.{js,mjs}', 'src/**/*.test.{js,jsx}', 'vite.config.js']` with `globals: { ...globals.node, ...globals.browser }`.
- [ ] **Step 3:** Write `scripts/snapshot-verse-slugs.mjs`: imports `VERSES`, `DAILY_VERSES`, `verseSlug` from `../src/verses.js` and writes `src/__fixtures__/verse-slugs.json` as `[{ "slug": "...", "ref": "..." }, ...]` for every verse in both lists. Run it once with `node scripts/snapshot-verse-slugs.mjs`. Expected: file with 65 entries. Commit the fixture; never regenerate it.
- [ ] **Step 4: Write the failing-proof test** `src/verses.test.js`:
  - "every previously shared slug still resolves": for each fixture entry, `findVerse(slug)` returns `{ ref: entry.ref, text: <non-empty string> }`.
  - "VERSES ids are unique integers".
  - "verseSlug('Psalm 23:1') === 'psalm-23-1'".
- [ ] **Step 5:** `npm test`. Expected: 3 passing tests. `npm run lint`: 0 problems.
- [ ] **Step 6:** Commit `test: add vitest and a shared-link safety net`.

### Task 2: Screenshot script

**Files:**
- Create: `scripts/screens.cjs`

**Interfaces:**
- Produces: `node scripts/screens.cjs <outDir>`; builds nothing itself (run `npm run build` first); writes PNGs named `NN-<screen>.png` to `<outDir>`.

- [ ] **Step 1:** Write `scripts/screens.cjs` (CommonJS: the preinstalled Playwright resolves only through `require`). Behaviour:
  - Spawns `npx vite preview --port 4173 --strictPort`, polls `http://localhost:4173/` until 200 (30 s timeout), kills it in a `finally`.
  - Chromium, viewport 390×844, `deviceScaleFactor: 1`, Android Chrome user agent.
  - Captures `00-login` with no session.
  - Seeds `localStorage['sb-kfoymqjekxxilqkyfavi-auth-token']` with a fake session (expires one year ahead, user id `00000000-0000-0000-0000-000000000001`), sets `verbum_notif_dismissed = "1"` and `verbum_install_dismissed = Date.now()`; routes `**/rest/v1/profiles*` → `{"name":"Test"}`, `**/rest/v1/user_progress*` → `[]`, `**/rest/v1/events*` → 201, `**/auth/v1/**` → the fake user JSON, `**/en.wikipedia.org/**` → 404.
  - Viewport screenshots (not full page): `01-home`, `02-home-scrolled` (scroll 900 px), `03-soul` (after tapping the "Hope" chip), `04-explore`, `05-explore-expanded` (first verse card tapped), `06-prayers`, `07-rosary`, `08-novenas`, `09-novena-day` (first novena), `10-three-oclock`, `11-mass`, `12-install` (`/install`), `13-share-dialog` (tap the first "Share this verse" button on Home, wait for the dialog).
  - Navigates by visible names: bottom-nav buttons "Home", "Soul", "Explore", "Prayers", "Mass"; then the texts "Rosary", "Novenas", the first novena title, "Three O'Clock Prayer". When a later phase changes any of these names, that task updates this script in the same commit.
  - Any failed step logs the screen name and continues; exit code 1 if any step failed.
- [ ] **Step 2:** `npm run build && node scripts/screens.cjs <scratchpad>/phase-1-before`. Expected: 14 PNGs, exit 0. Read `01-home.png` to confirm the session stub works (Home, not login).
- [ ] **Step 3:** Commit `chore: add local screenshot script`.

### Task 3: CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1:** Workflow `CI` on `push` and `pull_request`: `ubuntu-latest`, `actions/checkout@v4`, `actions/setup-node@v4` with `node-version: 22` and `cache: npm`, then `npm ci`, `npm run lint`, `npm test`, `npm run build`.
- [ ] **Step 2:** Commit `ci: lint, test and build on every push` and push. If the push is refused for workflow permissions, apply the fallback in the overview (move to `docs/ci.yml`) and note it for the owner.

### Task 4: Split `App.jsx` with no visible change

**Files:** every file in the target structure; delete `src/LoginPage.jsx` after moving it.

**Interfaces:**
- Produces (later phases rely on these exact exports):
  - `content/*.js`: named exports `SAINTS`, `ROSARY`, `NOVENAS`, `THREE_OCLOCK_PRAYER`, `CATEGORIES`, `HAPPENINGS`, `PRAYERS`, `STREAMS`.
  - `liturgy/legacy.js`: `getEaster(year: number): Date`, `getLiturgicalSeason(date: Date = new Date()): {name, bg, border, light, desc, cats}`, `getSaintOfDay(date: Date = new Date()): Saint`, `isThreeOClockHour(date: Date = new Date()): boolean`. Adding the `date` parameter is the only signature change; default keeps behaviour.
  - `dailyVerse.js`: `getDailyVerseStatic(date: Date = new Date()): DailyVerse`.
  - Each screen/component: default export with the same props as before.

- [ ] **Step 1: Write the failing test** `src/content/content.test.js`:
  - "rosary has 4 mystery sets of 5 decades", each decade has non-empty `name`, `ref`, `med`.
  - "every novena has 9 days numbered 1..9 with intention and prayer".
  - "saints have name, feast {m 1-12, d 1-31}, bio, quote".
  - "happenings have month, day, title, body".
  Run `npm test`. Expected: FAIL (modules not found).
- [ ] **Step 2: Write** `src/liturgy/legacy.test.js`: `getEaster(2026)` → 5 Apr 2026; `getEaster(2027)` → 28 Mar 2027; `getLiturgicalSeason(new Date(2026, 10, 13)).name === 'Ordinary Time'`; `getLiturgicalSeason(new Date(2026, 11, 1)).name === 'Advent'`; `isThreeOClockHour(new Date(2026, 0, 1, 15, 30)) === true`.
- [ ] **Step 3:** Move code into the files listed, one group at a time (content → legacy/dailyVerse → components → screens → shell). Replace `new Date()` inside the four helpers with the `date` parameter. Move the App `<style>` block text into `styles/globalCss.js` as `export const GLOBAL_CSS`. Keep every style object and string byte-identical.
- [ ] **Step 4:** `npm test` → all pass. `npm run lint` → 0. `npm run build` → succeeds.
- [ ] **Step 5:** `node scripts/screens.cjs <scratchpad>/phase-1-split` and compare each PNG with `phase-1-before` (e.g. `compare -metric AE a.png b.png null:` from ImageMagick). Expected: identical except the clock on Home. Investigate any other difference before going on.
- [ ] **Step 6:** Commit `refactor: split App.jsx into content, components and screens`.

### Task 5: Remove the starter CSS and files (B01)

**Files:**
- Modify: `src/index.css` (replace whole file), `README.md` (rewrite), `.claude/agents/ui-designer.md`
- Delete: `src/App.css`, `src/assets/hero.png`, `src/assets/react.svg`, `src/assets/vite.svg`, `public/icons.svg` (first confirm with `grep -r "icons.svg\|hero.png\|react.svg\|vite.svg\|App.css" src index.html public` that nothing references them)

- [ ] **Step 1:** New `src/index.css`, the whole file: `:root{color-scheme:light}` `*{box-sizing:border-box}` `html,body{margin:0}` `body{background:#F5F5F5}` (the current page colour; phase 2 changes it). Nothing else.
- [ ] **Step 2:** Build and run screens to `<scratchpad>/phase-1-after`. Expected differences, and only these: card text is now left-aligned where the component does not set `textAlign:"center"` (verse cards, saint bio, prayers, Mass notes); the page no longer has side borders. Read `01-home.png`, `04-explore.png`, `06-prayers.png` and confirm nothing overflows horizontally.
- [ ] **Step 3:** Rewrite `README.md`: what Verbum is (one paragraph), stack, `npm` scripts (`dev`, `build`, `preview`, `lint`, `test`, `screens`), folder map (the target structure above), Supabase SQL files and that they are run by hand in the SQL editor, Vercel functions in `api/`, and the env vars (filled in during phase 4).
- [ ] **Step 4:** In `.claude/agents/ui-designer.md`: replace "the repo already has 19 unrelated lint errors; you must not add any" with "lint must stay at 0 problems"; replace "Palette lives at the top of `src/App.jsx`" with "Palette lives in `src/theme.js`"; replace the Verification bullets with "run `npm test`, `npm run build`, then `node scripts/screens.cjs <scratchpad dir>`".
- [ ] **Step 5:** Per-phase checklist (overview). Commit `fix: remove leftover Vite starter CSS and files` and push.
