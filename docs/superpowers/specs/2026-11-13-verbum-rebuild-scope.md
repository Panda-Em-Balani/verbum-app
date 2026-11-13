# Verbum rebuild: scope

Source: the build review published at https://claude.ai/artifact/TXkn2kV7RkrBwXnoU82Zcr
(review of commit `aa3cc9c`). The owner ticked the items below on 13 Nov 2026; B13 and
B14 were added on Claude's recommendation and the owner's go-ahead.

## In scope

| ID | Item | Plan phase |
|----|------|-----------|
| B01 | Remove leftover Vite starter CSS (centers everything) and starter files | 1 |
| O10 | Split `App.jsx`; tests; CI; README; separate preview database (env-driven Supabase config) | 1, 4 |
| B18 | Tests, CI, keyboard access for clickable cards, dialog Escape/focus, stale agent note | 1, 2, 6 |
| B02 | Long passages out of Cinzel | 2 |
| B03 | Self-hosted fonts, no `@import`, no faux Lato 500 | 2 |
| B04, V03 | One warm palette, honest token names, contrast-safe buttons | 2 |
| V01 | Type system: Cinzel display, EB Garamond Scripture, Lato UI | 2 |
| B10 | No `window.confirm`/`alert`; header name button no longer signs out | 2 |
| B13 | Remove the four "Coming soon" dead ends | 2 |
| B16 | Compress the 1.5 MB login logo; split the JS bundle | 2 |
| B05, O03 | Service worker for everyone, precached build, offline banner, update prompt | 3 |
| B06, O02 | URL routes, working back button, legacy deep links | 3 |
| B07 | Scroll resets on navigation, restores on Back | 3 |
| B08 | Password reset sets a new password | 4 |
| B09 | Sign-up works with or without email confirmation | 4 |
| O05 | Magic link and Google sign-in (Google behind a flag) | 4 |
| B17 | Supabase config from env; reconstructed schema SQL; `events` size limit | 4, 6 |
| O01 | Accurate liturgical calendar (romcal, pre-built per year) | 5 |
| B11 | Saint and "Today in the Church" correct every day | 5 |
| V02 | Liturgical colour theming | 5 |
| B15 | Rosary opens on the day's mystery; same-day resume; greeting name; novena label | 5, 6 |
| B12, O08 | At least 60 library verses, every theme at least 4 verses, daily verses browsable | 5 |
| B19 | Content review list for a human proofreader (no prayer text rewritten) | 5 |
| B14, O09 | Reliable Mass streams with link-outs; "Find Mass times" | 5 |
| O07 | Prayer streak, week strip, intentions journal, dated novena days | 6 |
| V07 | Motion and polish; SVG icons instead of emoji | 2, 6 |

## Out of scope this round

V04 night mode, V05 Home redesign, V06 rosary redesign, O04 guest mode, O06 notification
settings, a full Bible (Douay-Rheims), Apple sign-in (needs an Apple developer account),
iOS splash screens, Premium.

## Decisions fixed by Claude (do not reopen during execution)

- Scripture translation stays NABRE (what the app already quotes). Total quoted Scripture
  stays under 4,500 words, and the NABRE notice is shown (USCCB permits up to 5,000 words
  with the notice).
- Existing verse refs and slugs never change (favourites and shared links depend on them).
  Numbering problems are reported in the content review, not fixed in data.
- The service worker keeps the URL `/sw.js` and scope `/` so existing push subscriptions survive.
- Calendar: romcal 1.3.0 `general` calendar, English, defaults. romcal is a dev dependency
  only; the app ships generated JSON per year.
- No new runtime UI libraries. New runtime deps: the three `@fontsource/*` packages only.
