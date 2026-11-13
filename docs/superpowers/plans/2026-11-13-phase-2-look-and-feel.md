# Phase 2: Look and Feel

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Read `2026-11-13-verbum-rebuild.md` first. Phase 1 must be complete.

**Goal:** One warm, readable, contrast-safe visual system; accessible dialogs; no dead ends; a light login screen and a smaller first download.

**Scope items:** B02, B03, B04, V03, V01, B10, B13, B16, B18 (dialogs), V07 (icons).

---

### Task 1: Tokens, contrast test and renaming

**Files:**
- Create: `src/utils/contrast.js`, `src/theme.test.js`
- Modify: `src/theme.js` (rewrite), every file that imports from it, `src/index.css`, `src/styles/globalCss.js`, `index.html` (no change to theme-color), `public/manifest.json`

**Interfaces:**
- Produces `src/utils/contrast.js`: `contrastRatio(hexA: string, hexB: string): number` (WCAG 2.1 relative luminance; `#RRGGBB` only).
- Produces `src/theme.js` exports, exactly:

| Name | Value | Use |
|---|---|---|
| `PAGE_BG` | `#F6F1E7` | page background |
| `SURFACE` | `#EFE6D6` | sunk areas, segmented controls, note blocks |
| `CARD` | `#FFFDF8` | cards, sheets |
| `BORDER` | `#DCCFB8` | all 1 px borders |
| `TEXT` | `#2E1F0E` | headings, primary text |
| `TEXT_BODY` | `#4A2F14` | paragraphs |
| `MUTED` | `#6E5A3C` | secondary text, inactive nav |
| `GOLD` | `#DAA520` | fills, icons, selected chips, primary buttons |
| `GOLD_DEEP` | `#B8860B` | icon strokes, active borders |
| `GOLD_TEXT` | `#7A5A06` | gold-coloured text |
| `ON_GOLD` | `#2E1F0E` | text on `GOLD` fills |
| `HEADER_BG` | `#8B4513` | default header (phase 5 makes it seasonal) |
| `HEADER_TEXT` | `#F5E6C8` | text on the header |
| `SUCCESS` | `#2E6B36` | prayed/done text |
| `SUCCESS_BG` | `#EAF6EC` | prayed/done fills |
| `DANGER` | `#A33A2A` | errors, destructive buttons |
| `MERCY` | `{ bg: "#F5EEF8", border: "#9B59C0", text: "#4A2070", accent: "#6A3A98" }` | Three O'Clock / Divine Mercy blocks |
| `FONT_DISPLAY` | `"'Cinzel', Georgia, serif"` | |
| `FONT_SCRIPTURE` | `"'EB Garamond', Georgia, serif"` | |
| `FONT_UI` | `"'Lato', system-ui, -apple-system, sans-serif"` | |
| `R` | `{ sm: 12, md: 16, lg: 20 }` | unchanged |
| `CARD_SHADOW`, `CARD_SHADOW_STRONG`, `HEADER_SHADOW`, `NAV_SHADOW`, `HEADER_H` | unchanged values | |

  Removed names (must not appear anywhere in `src` afterwards): `DARK`, `WHITE`, `CREAM`, `GOLD_BRIGHT`, `CINZEL`, `LATO`, `EMBOSS`. Mapping: `WHITE→TEXT`, `CREAM→TEXT_BODY`, `DARK→PAGE_BG`, `GOLD_BRIGHT→GOLD_DEEP`, `CINZEL→FONT_DISPLAY`, `LATO`/`"'Lato',sans-serif"` literals→`FONT_UI`. `textShadow: EMBOSS` is deleted, not replaced.

- [ ] **Step 1: Write the failing test** `src/theme.test.js`:
  - "text tokens meet AA on every background": each of `TEXT, TEXT_BODY, MUTED, GOLD_TEXT, SUCCESS, DANGER` against each of `PAGE_BG, SURFACE, CARD` is `>= 4.5`.
  - "button and header pairs meet AA": `ON_GOLD` on `GOLD`, `HEADER_TEXT` on `HEADER_BG`, `SUCCESS` on `SUCCESS_BG`, `MERCY.text` and `MERCY.accent` on `MERCY.bg` are each `>= 4.5`.
  - "contrastRatio('#000000', '#FFFFFF') rounds to 21".
  Run `npm test`. Expected: FAIL (exports missing).
- [ ] **Step 2:** Implement `contrast.js` and the new `theme.js`. Run `npm test`. Expected: PASS.
- [ ] **Step 3:** Update every importer to the new names. Replace hard-coded colours that duplicate a token with the token (e.g. `"#F5F5F5"`, `"#FFFFFF"` on cards, `"#C0C0C0"`, the purple literals → `MERCY.*`, `"#EAF6EC"`/`"#4A9A5A"`/`"#2E6B36"` → `SUCCESS_BG`/`SUCCESS`). Novena and rosary colours in `content/*.js` stay as data.
- [ ] **Step 4:** Lato weights: every `fontWeight` 500 with a Lato/`FONT_UI` font becomes 400; 600 and 800 become 700. Cinzel keeps 600/700.
- [ ] **Step 5:** Page background `PAGE_BG` in `src/index.css`, `GLOBAL_CSS`, the loading screen, `NamePrompt`, `InstallPage`; `manifest.json` `background_color` → `#F6F1E7`.
- [ ] **Step 6:** `grep -rnE "\b(DARK|WHITE|CREAM|GOLD_BRIGHT|CINZEL|LATO|EMBOSS)\b" src` → no output. `grep -rn "#C0C0C0\|#F5F5F5" src` → no output. Lint, test, build pass.
- [ ] **Step 7:** Commit `style: warm palette with contrast-checked tokens`.

### Task 2: Self-hosted fonts and type rules (B02, B03, V01)

**Files:**
- Create: `src/fonts.js`, `src/styles/buttons.js`
- Modify: `src/main.jsx`, `package.json`, all screens/components with text styles, `src/screens/auth/LoginPage.jsx`, `src/InstallPage.jsx`, `src/screens/auth/NamePrompt.jsx`, `src/App.jsx`

**Interfaces:**
- Produces `src/styles/buttons.js`: `primaryButton` (background `GOLD`, colour `ON_GOLD`, `FONT_DISPLAY` 700 15 px, letter-spacing `0.06em`, radius `R.sm`, min-height 48, width 100%), `secondaryButton` (transparent, 1 px `BORDER`, colour `TEXT`, `FONT_UI` 700 15 px, min-height 44), `chip(on: boolean)` (pill, `FONT_UI` 14 px; on = `GOLD` fill + `ON_GOLD` text 700; off = `CARD` + `BORDER` + `MUTED` 400; min-height 44), `segment(on: boolean)` (the two/three-way switch buttons). Style objects; spread and override where needed.

- [ ] **Step 1:** `npm i -E @fontsource/cinzel@5.3.0 @fontsource/eb-garamond@5.3.0 @fontsource/lato@5.3.0` (moves Cinzel to dependencies; remove it from devDependencies). Confirm the files exist: `ls node_modules/@fontsource/eb-garamond/500.css node_modules/@fontsource/eb-garamond/500-italic.css node_modules/@fontsource/cinzel/600.css node_modules/@fontsource/cinzel/700.css node_modules/@fontsource/lato/400.css node_modules/@fontsource/lato/700.css`. If an EB Garamond 500 file is missing, use 400 and change every `FONT_SCRIPTURE` weight to 400.
- [ ] **Step 2:** `src/fonts.js` imports exactly those six CSS files; `main.jsx` imports `./fonts.js` before `./index.css`.
- [ ] **Step 3:** Delete every Google Fonts `@import` (`grep -rn "fonts.googleapis" src` → no output afterwards).
- [ ] **Step 4:** Apply the type rules:
  - `FONT_DISPLAY` only for: the VERBUM wordmark, screen titles, card titles, uppercase eyebrow labels, verse references, primary buttons, the rosary bead numbers.
  - `FONT_SCRIPTURE` (weight 500, sentence case, no letter-spacing, no uppercase) for: verse text (`VerseCard` 19 px / 1.55; `DailyVerseCard` 21 px / 1.5; favourites list 19 px), saint quote (18 px, italic), novena prayer, the PRAYERS texts, Three O'Clock instruction/short prayer/chaplet, the "Glory be" line, the closing prayer on Soul, the InstallPage verse (19 px). Prayer texts 18 px / 1.7.
  - `FONT_UI` for everything else: explanations, bios, meditations, notes, buttons other than primary, chips, inputs. Body 16 px / 1.65, secondary 14–15 px.
  - Replace the repeated inline button/chip/segment styles with `styles/buttons.js` objects.
- [ ] **Step 5:** Build, `node scripts/screens.cjs <scratchpad>/phase-2-type`, Read `01-home`, `05-explore-expanded`, `09-novena-day`, `10-three-oclock`. Expected: Scripture and prayers in a book serif, sentence case; no paragraph in capitals; primary buttons gold with dark text.
- [ ] **Step 6:** Commit `style: self-hosted fonts and a readable type system`.

### Task 3: Accessible dialogs (B18, part of B10)

**Files:**
- Create: `src/components/Dialog.jsx`, `src/components/ConfirmDialog.jsx`, `src/components/Dialog.test.jsx`
- Modify: `NotificationBanner.jsx`, `InstallBanner.jsx`, `src/ShareButton.jsx`, `src/VerseShareButton.jsx`

**Interfaces:**
- Produces `Dialog({ open: boolean, onClose: () => void, label: string, placement?: 'center' | 'bottom', children })`: renders nothing when closed; overlay `rgba(30,20,10,0.5)` with blur; `role="dialog"` `aria-modal="true"` `aria-label={label}`; Escape and overlay click call `onClose`; focus moves to the first focusable element on open, Tab/Shift+Tab cycle inside, focus returns to the previously focused element on close; `document.body.style.overflow = 'hidden'` while open; bottom placement respects `env(safe-area-inset-bottom)`; panel `CARD`, radius `R.lg`, max-width 414; z-index 1000.
- Produces `ConfirmDialog({ open, title, message, confirmLabel, cancelLabel = 'Cancel', destructive = false, onConfirm, onCancel })` built on `Dialog`; confirm button `primaryButton`, or `DANGER` background with white text when `destructive`.

- [ ] **Step 1: Write the failing test** `Dialog.test.jsx` (jsdom):
  - "Escape calls onClose".
  - "Tab from the last button moves focus to the first".
  - "focus returns to the opener after close" (render a button that opens the dialog; close; `document.activeElement` is that button).
  - "ConfirmDialog calls onConfirm and onCancel from its buttons".
  Run. Expected: FAIL.
- [ ] **Step 2:** Implement both components. Run tests. Expected: PASS.
- [ ] **Step 3:** Rebuild the four existing dialogs on `Dialog` (remove their own overlay, Escape and `stopPropagation` plumbing, keeping their contents and actions). The share dialogs keep `onClick={e => e.stopPropagation()}` on their trigger buttons because they live inside clickable cards until phase 6.
- [ ] **Step 4:** Lint, test, build. Commit `feat: accessible dialog and confirm components`.

### Task 4: Header account menu, dead ends and icons (B10, B13, V07 icons)

**Files:**
- Create: `src/components/AccountSheet.jsx`
- Modify: `AppHeader.jsx`, `App.jsx`, `ExploreScreen.jsx`, `SoulScreen.jsx`, `MassScreen.jsx`, `PrayersScreen.jsx`, `ThreeOClockBanner.jsx`, `ThreeOClockView.jsx`, `Icons.jsx`, `content/streams.js`, `screens/auth/LoginPage.jsx`, `scripts/screens.cjs`

**Interfaces:**
- Consumes: `Dialog`, `ConfirmDialog` (Task 3).
- Produces `AccountSheet({ open, onClose, user: {name, email}, onSignOut: () => void })` (bottom Dialog, label "Account"): name in `FONT_DISPLAY`, email in `MUTED`, an "About Verbum" row that expands to one paragraph ("Verbum is a Catholic companion for daily Scripture and prayer." plus the app version from `package.json` via `import.meta.env.VITE_APP_VERSION`, set in `vite.config.js` `define`), a "Sign out" `secondaryButton` that opens a `ConfirmDialog` (title "Sign out of Verbum?", confirm "Sign out", destructive), Close button.
- Produces icons in `Icons.jsx`: `ClockIco`, `BeadsIco`, `BroadcastIco` (22×22, stroke `GOLD_DEEP` 1.5, same style as existing icons, `aria-hidden="true"`).

- [ ] **Step 1:** `AppHeader`: left slot empty (keeps the 105 px spacer so the wordmark stays centred); right slot on every tab: one button, `aria-label="Account"`, showing `UserIco` + first name (or "Account" when no name), opening `AccountSheet`. Delete the Premium button and modal. `App.jsx`: `handleSignOut` no longer calls `window.confirm`; it signs out directly (the sheet confirms).
- [ ] **Step 2:** Remove the dead ends: Explore "Bible" segment and `BibleSearchView` (segments become Browse | Saved); Soul "Guided Soul Check" card and `LockIco` if unused; Mass "Parish Stream — Coming Soon" card. `grep -rni "coming soon\|premium" src` → no output.
- [ ] **Step 3:** Emoji to icons: 🕒 → `ClockIco`, 📿 → `BeadsIco`, stream icons ✝️ 📡 💡 → `Cross`, `BroadcastIco`, `BroadcastIco` (store an icon key in `streams.js`: `icon: 'cross' | 'broadcast'`). Remove "✝" from the LoginPage button labels. `grep -rnP "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]" src` → no output (the ✓ check mark U+2713 in prayed states is allowed; exclude it if grep matches it).
- [ ] **Step 4:** LoginPage: replace `alert("Password reset email sent…")` with an inline `role="status"` line under the form: "We sent a reset link to {email}." (phase 4 rewrites the flow; this only removes the alert). `grep -rn "alert(\|confirm(" src` → no output.
- [ ] **Step 5:** Update `scripts/screens.cjs` for the removed "Bible" segment if referenced; add `14-account` (tap "Account").
- [ ] **Step 6:** Lint, test, build, screens. Commit `feat: account menu; remove dead ends and emoji icons`.

### Task 5: Light login and a smaller first download (B16)

**Files:**
- Create: `public/verbum-logo-256.webp`, `public/verbum-logo-256.png`
- Delete: `public/verbum-logo-clean.png` (after `grep -rn "verbum-logo-clean" . --exclude-dir=node_modules --exclude-dir=dist` shows only LoginPage)
- Modify: `screens/auth/LoginPage.jsx`, `App.jsx`, `src/VerseShareButton.jsx`

- [ ] **Step 1:** `convert public/verbum-logo-clean.png -resize 256x256 -strip public/verbum-logo-256.png` and `convert public/verbum-logo-clean.png -resize 256x256 -strip -quality 82 public/verbum-logo-256.webp`. Expected: webp ≤ 40 KB, png ≤ 150 KB (`ls -l`). If the png is larger, quantise with Python PIL (`img.quantize(colors=256)`) and save with `optimize=True`.
- [ ] **Step 2:** LoginPage uses `<picture><source srcSet="/verbum-logo-256.webp" type="image/webp"/><img src="/verbum-logo-256.png" width="110" height="110" alt="Verbum"/></picture>`.
- [ ] **Step 3:** Code split: `React.lazy` for `InstallPage`, `SoulScreen`, `ExploreScreen`, `PrayersScreen`, `MassScreen`, wrapped in one `<Suspense>` whose fallback is a centred `Cross` (size 28) with the same top margin as screen headers, so the layout doesn't jump. `HomeScreen` stays eager. In `VerseShareButton`, load `renderStoryCard` with `await import('./storyCard.js')` inside `open`.
- [ ] **Step 4:** `npm run build`. Expected: the entry chunk (`dist/assets/index-*.js`) is ≤ 500 kB minified and `qrcode` is no longer in it (`grep -c qrcode dist/assets/index-*.js` → 0). Record the before/after sizes in the commit message.
- [ ] **Step 5:** Per-phase checklist (overview). Screens to `<scratchpad>/phase-2-after`; compare with `phase-1-after`. Commit `perf: lighter login logo and lazy-loaded screens` and push.
