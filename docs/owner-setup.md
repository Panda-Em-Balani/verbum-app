# Owner setup: things only the project owner can do

Each item says where to click and what to type. Do them in order; tick them off as you go.

## 1. Supabase: tell it where email links should return (needed for sign-in links)

Why: confirmation, sign-in and password-reset emails contain a link back to the app.
Supabase only sends people to addresses on its allowed list.

1. Go to https://supabase.com/dashboard and open the Verbum project.
2. In the left sidebar click **Authentication**, then **URL Configuration**.
3. In **Site URL** enter exactly: `https://verbum-app-two.vercel.app` and click **Save**.
4. Under **Redirect URLs** click **Add URL**, enter exactly:
   `https://verbum-app-two.vercel.app/**` and click **Save**.

How to check it worked: on the live app, tap "Forgot your password?", open the email on
your phone, and tap the link. You should see "Choose a new password".

## 2. Supabase: decide whether new accounts must confirm their email (optional)

1. Same project, **Authentication** > **Sign In / Providers** > **Email**.
2. **Confirm email** on: new users must tap a link in an email before they can sign in.
   Off: they are signed in straight away. The app handles both.

## 3. Google sign-in (optional)

1. Supabase: **Authentication** > **Sign In / Providers** > **Google** > turn it on and
   follow Supabase's instructions there (it needs a Google Cloud client ID and secret).
2. Tell Claude it is on, or change `google: false` to `google: true` in `src/config.js`.
   The "Continue with Google" button then appears on the sign-in screen.

## 4. Vercel: check the preview of this branch (once per phase is enough)

1. Go to https://vercel.com/dashboard and open the Verbum project.
2. Click the **Deployments** tab. Find the newest row whose branch is
   `claude/relaxed-hopper-21uuww` and click it.
3. Click the **Visit** button. A browser tab opens with an address ending in `.vercel.app`.
4. In that tab's address bar, add each of these after `.vercel.app` and press Enter:
   - `/prayers/rosary` : you should see the app (the sign-in screen is fine).
   - `/sw.js` : you should see a page of code, not the app.
   - `/api/og?v=psalm-23-1` : you should see a brown image with Psalm 23:1.
   - `/install?v=psalm-23-1` : you should see the install page showing Psalm 23:1.

## 5. Separate database for previews (optional, later)

Create a second Supabase project, then in Vercel: Project > **Settings** >
**Environment Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for the
**Preview** environment only. Until then previews use the live database.
