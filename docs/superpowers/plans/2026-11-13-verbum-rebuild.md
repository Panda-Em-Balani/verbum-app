# Verbum Rebuild Implementation Plan (overview)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan phase by phase, task by task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the gaps found in the 13 Nov 2026 review and make Verbum look and run better, without losing any existing user's data, links or push subscriptions.

**Architecture:** Stay on React 19 + Vite 8, inline styles with shared tokens, Supabase, Vercel. Phase 1 splits `src/App.jsx` into content, components and screens with no visible change; later phases change one concern each. Every phase ends green on lint, tests and build, with before/after screenshots.

**Tech Stack:** React 19, Vite 8, Vitest 5 (+ jsdom, @testing-library/react), Supabase JS 2.117, `@fontsource/*` 5.3, romcal 1.3.0 (dev only), Playwright (preinstalled, used by a local screenshot script only).

**Spec:** `docs/superpowers/specs/2026-11-13-verbum-rebuild-scope.md`

## Phases (run in order; each is its own file)

1. `2026-11-13-phase-1-foundation.md`: test harness, screenshot script, CI, split `App.jsx`, remove starter CSS, README.
2. `2026-11-13-phase-2-look-and-feel.md`: tokens, fonts, type rules, contrast, dialogs, header menu, dead ends removed, logo and bundle.
3. `2026-11-13-phase-3-navigation-pwa.md`: router, legacy deep links, scroll, Vercel rewrite, service worker precache, offline and update banners.
4. `2026-11-13-phase-4-auth.md`: auth hook, sign-up with confirmation, reset password, magic link, Google flag, env-driven Supabase config.
5. `2026-11-13-phase-5-calendar-content.md`: liturgical data, saint and feast matching, seasonal colours, rosary/greeting fixes, verses, content review, Mass.
6. `2026-11-13-phase-6-progress-polish.md`: sync-queue fix, streaks, intentions, dated novenas, SQL, motion, keyboard access.

## Global Constraints

- Branch: commit and push only to `claude/relaxed-hopper-21uuww`. Push after each phase: `git push -u origin claude/relaxed-hopper-21uuww` (retry network errors up to 4 times, waiting 2, 4, 8, 16 s). No PR unless the owner asks.
- Commit messages end with the attribution lines given in the session's system reminder. Never put a model name in commits, code or docs.
- Every phase ends with all of: `npm run lint` (0 errors), `npm test` (all pass), `npm run build` (succeeds), `node scripts/screens.cjs <scratchpad>/phase-N-after` (no crash), and the phase's own checks.
- Mobile first: 360–430 px wide column, no horizontal scroll, tap targets ≥ 44 px, body text ≥ 15 px, WCAG AA contrast (≥ 4.5:1 for text under 18.66 px bold / 24 px regular).
- Styling stays inline `style={{}}` objects plus small `<style>` blocks. No CSS framework, no UI component library.
- Allowed new dependencies, exactly: runtime `@fontsource/cinzel@5.3.0`, `@fontsource/eb-garamond@5.3.0`, `@fontsource/lato@5.3.0`; dev `vitest@5.1.0`, `jsdom@31.0.1`, `@testing-library/react@16.3.3`, `romcal@1.3.0`. Install with exact versions (`npm i -E`). Remove `@fontsource/cinzel` from devDependencies when it moves to dependencies.
- Never change: any verse `ref`, `findVerse`/`verseSlug` behaviour, VERSES numeric ids, the localStorage key `verbum_progress_v1_<uid>` and its shape (fields may be added), the Supabase table `user_progress` columns, the service worker URL `/sw.js`, `api/og.js`, `api/install.js` behaviour, `public/fonts/Cinzel-Bold.woff`.
- Screenshots go to the session scratchpad, never into the repo.
- User-facing copy: plain, short, active voice. No "coming soon" anywhere.
- Prayer texts, novena texts and the chaplet are not reworded. Suspected errors go into `docs/content-review.md`.
- If a step's expected result does not happen, stop and fix the cause before moving on (superpowers:systematic-debugging). Never skip or delete a test to get green.

## Review Focus

1. **Links already in the wild.** Push notifications already sent use `/?tab=<tab>&section=<section>`; shared links use `/install?v=<slug>&ref=<src>`. After phase 3 both must still open the right screen. Tests: `router.test.js` › "maps every legacy tab/section pair" and "keeps install query params" (phase 3, Task 1).
2. **Auth links carry tokens in the URL hash.** Magic-link, confirmation and recovery links arrive as `/#access_token=…&type=…`. The router must never strip or rewrite `location.hash`, and must not redirect before Supabase reads it. Tests: `router.test.js` › "never touches the hash" (phase 3, Task 1); `useAuth.test.jsx` › "PASSWORD_RECOVERY shows the reset screen" (phase 4, Task 2).
3. **Existing users' saved progress.** A device holding an old local cache (favourites as `id:N` / `ref:…`, queued ops) must load unchanged, and one permanently rejected op (e.g. a `kind` the server does not yet allow) must not block every later sync. Tests: `progress.test.js` › "loads a v1 cache unchanged" and "drops an op the server rejects with 4xx and continues" (phase 6, Task 1).
4. **Offline and updates mid-prayer.** A user offline after the first load must get the app shell and fonts; a new deploy must never reload the page by itself while someone is mid-rosary. Tests: build check that `dist/sw.js` lists the entry chunk and font files (phase 3, Task 3); `UpdateBanner.test.jsx` › "does not reload until Refresh is tapped" (phase 3, Task 4).
5. **Dates.** Calendar lookups use the device's local date, not UTC; a year outside the generated data falls back to computed seasons; the Home screen rolls over at local midnight. Tests: `calendar.test.js` › "uses local date near midnight", "falls back outside generated years" (phase 5, Task 2).

## Owner actions (Claude tells the owner at the phase where each is needed)

| When | Action |
|------|--------|
| Before merging phase 4 | Supabase → Authentication → URL Configuration: Site URL `https://verbum-app-two.vercel.app`; add redirect URLs `https://verbum-app-two.vercel.app/**` and the project's preview-deployment pattern (look up the real preview domain with the Vercel MCP tools and give the owner the exact `https://<pattern>.vercel.app/**` line). |
| Optional, phase 4 | Enable Google in Supabase Auth providers, then set `AUTH_PROVIDERS.google = true` in `src/config.js`. |
| Optional, phase 4 | Create a second Supabase project for previews and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for the Preview environment in Vercel. |
| Before deploying phase 6 | Run `supabase/migrations/20261113_progress_kinds.sql` and `supabase/migrations/20261113_events_limits.sql` in the Supabase SQL editor. |
| Any time | Send the push-sender code (Supabase Edge Function) so it can be added to the repo; compare the reconstructed `supabase/profiles.sql` and `supabase/push_subscriptions.sql` with production. |
| Before release | A trusted person reviews `docs/content-review.md`. |

## Known risk with a fixed fallback

If pushing `.github/workflows/ci.yml` is refused (token without `workflow` scope), move the file to `docs/ci.yml`, commit that instead, and tell the owner to add it at `.github/workflows/ci.yml` through GitHub's web editor.

## Per-phase checklist (repeat at the end of each phase file)

- [ ] `npm run lint` → 0 problems
- [ ] `npm test` → all pass
- [ ] `npm run build` → succeeds; note entry chunk size
- [ ] `node scripts/screens.cjs <scratchpad>/phase-N-after`, then Read and compare each screenshot against `phase-N-before`
- [ ] Commit, push, and post a short summary to the owner: what changed, screenshots worth looking at, any owner action now due
