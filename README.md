# Verbum

Verbum ("The Word") is a Catholic companion app: a daily verse, the saint of the day, the
Rosary, novenas, the Three O'Clock Prayer, a verse library and live Mass streams. It is a
mobile-first web app that installs to the home screen (PWA), works offline after the first
visit, and can send daily push notifications.

Live site: https://verbum-app-two.vercel.app

## Stack

- React 19 + Vite 8, inline styles with shared tokens in `src/theme.js` (no CSS framework)
- Supabase: sign-in, profiles, saved progress, push subscriptions, anonymous event counts
- Vercel: hosting, plus two serverless functions in `api/` for shared-verse previews
- Vitest for tests; Playwright (local only) for screenshots

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint; must stay at 0 problems |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run screens -- <outDir>` | Screenshot every main screen at phone size (run `npm run build` first; needs Playwright and Chromium installed) |

## Folder map

```
api/                    Vercel functions: install.js (shared-verse page), og.js (preview image)
public/                 Icons, manifest, service worker (sw.js), fonts for the preview image
scripts/                screens.cjs (screenshots), snapshot-verse-slugs.mjs (one-off fixture)
supabase/               SQL for the database tables (run by hand in the Supabase SQL editor)
docs/superpowers/       Scope and phased implementation plans for the rebuild
src/
  main.jsx              Entry
  App.jsx               Shell: session gate, banners, tab switch, layout
  theme.js              Colours, radii, shadows, fonts
  verses.js             Verse data (also used by api/)
  content/              Saints, rosary, novenas, prayers, feasts, streams, categories
  liturgy/              Liturgical season and saint-of-the-day helpers
  components/           Shared UI: header, bottom nav, verse card, icons, banners
  screens/              One folder or file per screen (auth, home, prayers, explore, soul, mass)
  styles/               Global CSS string
  progress.js           Saved favourites, novena days and rosary position (offline-first sync)
  notifications.js      Push subscription
  share.js, storyCard.js, ShareButton.jsx, VerseShareButton.jsx   Sharing
  InstallPage.jsx       Public install / landing page (/install)
```

## Database

The SQL in `supabase/` is applied by hand in the Supabase SQL editor; nothing runs it
automatically. `events.sql` holds anonymous share and install counts; `user_progress.sql`
holds each user's saved progress.

## Environment

The Supabase project is currently set in `src/supabase.js`. Environment variables for
choosing a different project per environment are added in a later phase of the rebuild and
will be documented here.

## Links that must keep working

- Shared verses: `/install?v=<verse-slug>&ref=<source>`. Verse references and slugs never
  change; `src/verses.test.js` guards this.
- Notification deep links: `/?tab=<tab>&section=<section>`.
