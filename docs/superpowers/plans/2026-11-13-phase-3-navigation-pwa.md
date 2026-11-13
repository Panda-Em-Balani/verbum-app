# Phase 3: Navigation and PWA

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Read `2026-11-13-verbum-rebuild.md` first, especially Review Focus 1, 2 and 4. Phase 2 must be complete.

**Goal:** Real URLs with a working Back button, old notification links still working, scroll handled, and an offline-capable app for every user with a safe update prompt.

**Scope items:** B06, O02, B07, B05, O03.

---

### Task 1: Router

**Files:**
- Create: `src/router.js`, `src/router.test.js`
- Modify: `src/main.jsx`

**Interfaces:**
- Produces `src/router.js`:
  - `ROUTES`: ordered list of `{ name, pattern }`: `home "/"`, `soul "/soul"`, `explore "/explore"`, `exploreSaved "/explore/saved"`, `prayers "/prayers"`, `rosary "/prayers/rosary"`, `novenas "/prayers/novenas"`, `novena "/prayers/novenas/:id"`, `threeOclock "/prayers/three-oclock"`, `mass "/mass"`, `install "/install"`, `resetPassword "/reset-password"`. (Phase 6 adds `intentions "/prayers/intentions"` before `novena`.)
  - `matchRoute(pathname: string): { name: string, params: Record<string,string>, notFound: boolean }`: trailing slashes ignored; unknown → `{ name: 'home', params: {}, notFound: true }`.
  - `tabOf(name: string): 'home'|'soul'|'explore'|'prayers'|'mass'|null`: explore* → explore; rosary, novenas, novena, threeOclock, intentions → prayers; install, resetPassword → null.
  - `resolveLegacy(href: string): string | null`: if the URL has `tab` or `section` query params, returns the canonical `path + remaining query` (other params such as `v` and `ref` kept, in order), else `null`. Tabs: `home→/`, `soul→/soul`, `explore→/explore`, `prayers→/prayers`, `mass→/mass`. Sections (win over tab): `rosary→/prayers/rosary`, `novenas→/prayers/novenas`, `three-oclock→/prayers/three-oclock`. Unknown values → `/`.
  - `initRouter(): void`: call once in `main.jsx` before render. Sets `history.scrollRestoration = 'manual'`; when `resolveLegacy(location.href)` is non-null, `history.replaceState({ idx: 0, scrollY: 0 }, '', canonical + location.hash)`; otherwise when `history.state?.idx` is undefined, `replaceState({ idx: 0, scrollY: 0 }, '', location.href)`. Never changes `location.hash`.
  - `navigate(to: string, opts?: { replace?: boolean }): void`: saves `window.scrollY` into the current entry's state, then pushes (or replaces) `{ idx: current + 1 (or same when replacing), scrollY: 0 }`, scrolls to top, notifies subscribers. `to` equal to the current path+search → only scrolls to top.
  - `goBack(fallback: string): void`: `history.back()` when `history.state.idx > 0`, else `navigate(fallback, { replace: true })`.
  - `useRoute(): { name, params, notFound, path: string, search: string }` via `useSyncExternalStore`, subscribed to `popstate` and the router's own notifications. On `popstate`, after notifying, `requestAnimationFrame(() => window.scrollTo(0, history.state?.scrollY ?? 0))`.

- [ ] **Step 1: Write the failing test** `src/router.test.js` (jsdom):
  - "matches every route" (one assertion per pattern, `novena` gives `params.id`).
  - "unknown path is home with notFound".
  - "maps every legacy tab/section pair": `/?tab=prayers&section=three-oclock → /prayers/three-oclock`, `/?tab=prayers&section=rosary → /prayers/rosary`, `/?tab=prayers&section=novenas → /prayers/novenas`, `/?tab=home → /`, `/?tab=soul → /soul`, `/?tab=explore → /explore`, `/?tab=mass → /mass`, `/?tab=bogus → /`, `/?section=rosary → /prayers/rosary`.
  - "keeps install query params": `resolveLegacy('https://x/install?v=psalm-23-1&ref=share')` → `null` (no legacy keys); `resolveLegacy('https://x/?tab=home&ref=push')` → `/?ref=push`.
  - "never touches the hash": with `location` = `/?tab=home#access_token=abc&type=recovery`, after `initRouter()`, `location.pathname + location.search + location.hash === '/#access_token=abc&type=recovery'`.
  - "navigate pushes and goBack returns": navigate `/prayers` then `/prayers/rosary`; `goBack('/prayers')` → after popstate, `matchRoute(location.pathname).name === 'prayers'`.
  - "goBack with no history uses the fallback with replace".
  Run. Expected: FAIL.
- [ ] **Step 2:** Implement `src/router.js`. Run tests. Expected: PASS.
- [ ] **Step 3:** Commit `feat: small history router with legacy link mapping`.

### Task 2: Wire screens to routes (B06, B07)

**Files:**
- Modify: `App.jsx`, `BottomNav.jsx`, `ExploreScreen.jsx`, `PrayersScreen.jsx`, `RosaryView.jsx`, `NovenaView.jsx`, `ThreeOClockView.jsx`, `public/sw.js` (comment only), `vercel.json`, `scripts/screens.cjs`

**Interfaces:**
- Consumes: Task 1 exports.

- [ ] **Step 1:** `App.jsx`: replace `tab` state with `useRoute()`. `route.name === 'install'` renders `InstallPage` (public, before the auth gate, as today). `notFound` → `navigate('/', { replace: true })` in an effect. Delete the `verbum_deep_section` code, the `verbum-navigate` custom event, the cold-start query parsing, and the `history.replaceState({}, "", pathname)` call. Keep `sharedSlug` read from `location.search` at first render.
- [ ] **Step 2:** Service-worker `NAVIGATE` messages: `navigate(resolveLegacy(new URL(url, location.origin).href) ?? url)`.
- [ ] **Step 3:** `BottomNav`: each tab button calls `navigate(tabRoot)`; `aria-current="page"` when `tabOf(route.name)` matches; tapping the active tab's root while on it scrolls to top. The "explore" new-favourites dot clears when `tabOf` becomes `explore`.
- [ ] **Step 4:** Sub-screens: Explore segments Browse/Saved → `navigate('/explore' | '/explore/saved', { replace: true })`. Prayers segments Prayers/Rosary → `navigate('/prayers' | '/prayers/rosary', { replace: true })`. Novenas list item → `navigate('/prayers/novenas/' + id)`; unknown id → `navigate('/prayers/novenas', { replace: true })`. All "Back to …" buttons → `goBack('/prayers')` (novena day → `goBack('/prayers/novenas')`). Three O'Clock card → `navigate('/prayers/three-oclock')`.
- [ ] **Step 5:** `vercel.json`: append to `rewrites`, after the two existing `/install` rules: `{ "source": "/((?!api/).*)", "destination": "/index.html" }`. Static files still win because Vercel serves the filesystem before rewrites.
- [ ] **Step 6:** `scripts/screens.cjs`: capture sub-screens by URL (`/prayers/rosary`, `/prayers/novenas`, `/prayers/novenas/divine-mercy`, `/prayers/three-oclock`, `/explore/saved`) and add `15-legacy-link` (open `/?tab=prayers&section=three-oclock`, expect the Three O'Clock screen).
- [ ] **Step 7:** Manual check in the screenshot browser (add to the script as assertions): open `/prayers/novenas/divine-mercy`, press Back (`page.goBack()`), expect `/prayers/novenas`; scroll Home 900 px, tap Prayers, expect `scrollY === 0`; go back, expect `scrollY` within 50 px of 900.
- [ ] **Step 8:** Lint, test, build, screens. Commit `feat: URL routes and a working back button` and push. After Vercel's preview deploy for the branch finishes (check with the Vercel MCP tools, latest deployment for this branch), fetch `<preview>/prayers/rosary` (expect HTML 200), `<preview>/sw.js` (expect JavaScript), `<preview>/api/og?v=psalm-23-1` (expect `image/png`), `<preview>/install?v=psalm-23-1` (expect `og:title` containing "Psalm 23:1"). If the preview needs Vercel login, report the URLs to the owner instead.

### Task 3: Service worker with a precached build (B05, O03)

**Files:**
- Create: `vite-plugins/precacheManifest.js`, `src/pwa/registerServiceWorker.js`
- Modify: `public/sw.js`, `vite.config.js`, `src/main.jsx`, `src/notifications.js`

**Interfaces:**
- Produces in `public/sw.js` two placeholders, written exactly: `const PRECACHE_MANIFEST = [] /*__PRECACHE_MANIFEST__*/;` and `const CACHE_VERSION = 'verbum-dev' /*__CACHE_VERSION__*/;`.
- Produces `precacheManifest(): import('vite').Plugin` with a `closeBundle` hook (build only): lists every file under `dist/` except `sw.js`, `*.map` and `og-image.jpg`, as root-relative URLs, plus `/`; replaces the two placeholder strings in `dist/sw.js` with the JSON list and `'verbum-' + <first 10 hex of sha1(list)>`; throws if either placeholder is missing.
- Produces `registerServiceWorker({ onUpdateReady: (apply: () => void) => void }): void`: no-op unless `import.meta.env.PROD` and `'serviceWorker' in navigator`; registers `/sw.js` (scope `/`) on `window` `load`; calls `onUpdateReady(apply)` when a worker is waiting at registration time or a new one reaches `installed` while a controller exists. `apply()` posts `{ type: 'SKIP_WAITING' }` to the waiting worker and reloads once on `controllerchange` (guarded so it reloads only once).

- [ ] **Step 1:** Rewrite the cache parts of `public/sw.js`; keep the `push` and `notificationclick` handlers unchanged:
  - `install`: `caches.open(CACHE_VERSION).then(c => c.addAll(PRECACHE_MANIFEST))`. No `skipWaiting()` here, and no `.catch` (a failed precache must fail the install so the old worker keeps serving).
  - `message`: `{ type: 'SKIP_WAITING' }` → `self.skipWaiting()`.
  - `activate`: delete caches whose name starts with `verbum-` and isn't `CACHE_VERSION`; `clients.claim()`.
  - `fetch`: ignore non-GET, cross-origin and `/api/` requests. Navigations: network first; on failure `caches.match('/index.html')`. Other same-origin GETs: cache first, else network, and cache successful (200) responses in `CACHE_VERSION`.
- [ ] **Step 2:** Add `precacheManifest()` to `vite.config.js` plugins. `npm run build`, then check: `grep -c "PRECACHE_MANIFEST = \[\"" dist/sw.js` → 1; `dist/sw.js` contains the entry chunk name from `dist/index.html`, at least one `.woff2` font file and `/index.html`; `grep -c "__CACHE_VERSION__" dist/sw.js` → 0 placeholders left unreplaced (the comment stays, the value changes: check that `'verbum-dev'` is absent).
- [ ] **Step 3:** `main.jsx` calls `registerServiceWorker(...)` (wired to the banner in Task 4). `notifications.js` keeps `navigator.serviceWorker.register('/sw.js')` (same URL, idempotent) so push still works in browsers that skipped the load handler.
- [ ] **Step 4:** Offline check with Playwright (add to `scripts/screens.cjs` as `16-offline`; every other capture in the script uses a context with `serviceWorkers: 'block'`, this one uses `'allow'`): load `/`, wait for `navigator.serviceWorker.ready`, reload once (now controlled), **stop the preview server process** (do not rely on `context.setOffline`, which does not reliably cut off service-worker fetches), reload, then expect the Home screen to render and `document.fonts.check('600 17px Cinzel')` to be true. Save the screenshot. Restart the server only if later captures need it (make this the last capture).
- [ ] **Step 4b:** Add `'vite-plugins/**/*.js'` to the Node-globals block in `eslint.config.js`.
- [ ] **Step 5:** Lint, test, build. Commit `feat: precached service worker for every visitor`.

### Task 4: Update and offline banners

**Files:**
- Create: `src/components/UpdateBanner.jsx`, `src/components/UpdateBanner.test.jsx`, `src/components/OfflineBanner.jsx`, `src/hooks/useOnlineStatus.js`, `src/hooks/useOnlineStatus.test.js`
- Modify: `src/main.jsx`, `src/App.jsx`

**Interfaces:**
- Produces `UpdateBanner({ apply: () => void, onDismiss: () => void })`: fixed above the bottom nav, `CARD` with `BORDER`, text "A new version of Verbum is ready.", buttons "Refresh" (calls `apply`) and "Later" (calls `onDismiss`), `role="status"`.
- Produces `useOnlineStatus(): boolean` from `navigator.onLine` and `online`/`offline` events.
- Produces `OfflineBanner()`: when offline, a 36 px strip under the header: "You're offline. Your saved prayers still work." (`SURFACE`, `MUTED`, `role="status"`).
- State hand-off: `main.jsx` keeps a tiny module store `src/pwa/updateStore.js` exporting `setUpdate(apply)`, `useUpdate(): (() => void) | null`, `clearUpdate()`; `registerServiceWorker({ onUpdateReady: setUpdate })`. `App.jsx` renders `UpdateBanner` when `useUpdate()` is non-null.

- [ ] **Step 1: Write the failing tests**: `UpdateBanner.test.jsx` › "does not reload until Refresh is tapped" (`apply` mock not called on render; called once on Refresh; "Later" calls `onDismiss` only). `useOnlineStatus.test.js` › "follows offline and online events".
- [ ] **Step 2:** Implement. Tests pass.
- [ ] **Step 3:** Per-phase checklist. Screens to `<scratchpad>/phase-3-after`. Commit `feat: update prompt and offline notice` and push.
