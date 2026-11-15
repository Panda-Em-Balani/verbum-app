// Local screenshot script: node scripts/screens.cjs <outDir>
// Serves the existing build (run `npm run build` first) and captures every main screen at
// phone size with a stubbed signed-in session. Screenshots are for review only; never commit them.
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const PORT = 4173;
const BASE = `http://localhost:${PORT}`;
const USER_ID = "00000000-0000-0000-0000-000000000001";
const UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36";

const outDir = process.argv[2];
if (!outDir) {
  console.error("usage: node scripts/screens.cjs <outDir>");
  process.exit(2);
}

async function waitForServer(timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(BASE + "/");
      if (res.ok) return;
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error("preview server did not start");
}

const user = { id: USER_ID, email: "test@example.com", aud: "authenticated", role: "authenticated" };
const session = { access_token: "x", token_type: "bearer", expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 365 * 86400, refresh_token: "r", user };

// Answers the app's Supabase and Wikipedia requests so no real network is needed.
async function stubSession(ctx) {
  const json = (body, status = 200) => (route) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
  await ctx.route("**/rest/v1/profiles*", json({ name: "Test" }));
  await ctx.route("**/rest/v1/user_progress*", json([]));
  await ctx.route("**/rest/v1/events*", json({}, 201));
  await ctx.route("**/auth/v1/**", json(user));
  await ctx.route("**/en.wikipedia.org/**", (route) => route.fulfill({ status: 404, body: "" }));
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const server = spawn("npx", ["vite", "preview", "--port", String(PORT), "--strictPort"], { stdio: "ignore", detached: true });
  let browser;
  const failed = [];
  try {
    await waitForServer();
    browser = await chromium.launch();
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, userAgent: UA, serviceWorkers: "block" });
    const page = await ctx.newPage();
    page.setDefaultTimeout(8000);
    const shot = (name) => page.screenshot({ path: path.join(outDir, `${name}.png`) });
    const step = async (name, fn) => {
      try {
        await fn();
        await page.waitForTimeout(500);
        await shot(name);
      } catch (e) {
        failed.push(name);
        console.error(`FAILED ${name}: ${String(e.message).split("\n")[0]}`);
      }
    };
    // A behaviour check with no screenshot.
    const check = async (name, fn) => {
      try {
        if ((await fn()) !== true) throw new Error("check returned false");
      } catch (e) {
        failed.push(name);
        console.error(`FAILED check "${name}": ${String(e.message).split("\n")[0]}`);
      }
    };
    const nav = (label) => page.getByRole("button", { name: label, exact: true }).last().click();

    await step("00-login", async () => {
      await page.goto(BASE + "/");
      await page.getByText("Sign In").first().waitFor();
    });
    await step("19-signup", async () => {
      await page.getByRole("button", { name: "Create account" }).first().click();
      await page.getByLabel("Your name").waitFor();
    });
    await step("20-magic-link", async () => {
      await page.getByRole("button", { name: "Sign in", exact: true }).first().click();
      await page.getByRole("button", { name: "Email me a sign-in link instead" }).click();
      await page.getByRole("button", { name: "Send sign-in link" }).waitFor();
    });
    await step("21-reset-expired", async () => {
      await page.goto(BASE + "/reset-password");
      await page.getByText("This link can't be used").waitFor();
    });
    await step("22-link-expired", async () => {
      await page.goto(BASE + "/#error=access_denied&error_code=otp_expired&error_description=expired");
      await page.getByText("This link has expired. Request a new one.").waitFor();
    });

    // Signed-in session stub
    await page.evaluate((s) => {
      localStorage.setItem("sb-kfoymqjekxxilqkyfavi-auth-token", JSON.stringify(s));
      localStorage.setItem("verbum_notif_dismissed", "1");
      localStorage.setItem("verbum_install_dismissed", String(Date.now()));
    }, session);
    await stubSession(ctx);

    await step("01-home", async () => {
      await page.goto(BASE + "/");
      await page.getByText("Daily Verse").first().waitFor();
    });
    await step("02-home-scrolled", () => page.evaluate(() => window.scrollTo(0, 900)));
    await step("03-soul", async () => {
      await page.evaluate(() => window.scrollTo(0, 0));
      await nav("Soul");
      await page.getByRole("button", { name: "Hope" }).click();
    });
    await step("04-explore", async () => {
      await page.evaluate(() => window.scrollTo(0, 0));
      await nav("Explore");
      await page.getByText("Verse Library").waitFor();
    });
    await step("05-explore-expanded", () => page.getByText("The Lord is my shepherd").first().click());
    await step("06-prayers", async () => {
      await page.evaluate(() => window.scrollTo(0, 0));
      await nav("Prayers");
      await page.getByText("Catholic Prayers").waitFor();
    });
    await step("07-rosary", async () => {
      await page.getByRole("button", { name: "Rosary", exact: true }).click();
      await page.waitForURL("**/prayers/rosary");
    });
    await step("08-novenas", async () => {
      await page.goto(BASE + "/prayers/novenas");
      await page.getByText("Back to Prayers").waitFor();
    });
    await step("09-novena-day", async () => {
      await page.getByText("Divine Mercy Novena").first().click();
      await page.waitForURL("**/prayers/novenas/divine-mercy");
      await page.getByText("Back to Novenas").waitFor();
    });
    await check("back from a novena returns to the list", async () => {
      await page.goBack();
      await page.getByText("Back to Prayers").waitFor();
      return page.url().endsWith("/prayers/novenas");
    });
    await step("10-three-oclock", async () => {
      await page.goto(BASE + "/prayers/three-oclock");
      await page.getByText("Prayer for the Hour of Mercy").waitFor();
    });
    await step("11-mass", async () => {
      await page.evaluate(() => window.scrollTo(0, 0));
      await nav("Mass");
      await page.getByText("Virtual Mass").first().waitFor();
    });
    await step("12-install", async () => {
      await page.goto(BASE + "/install");
      await page.getByText("VERBUM").first().waitFor();
    });
    await step("13-share-dialog", async () => {
      await page.goto(BASE + "/");
      await page.getByText("Daily Verse").first().waitFor();
      await page.getByRole("button", { name: "Share this verse" }).first().click();
      await page.getByRole("dialog", { name: "Share this verse" }).waitFor();
    });
    await step("15-explore-saved", async () => {
      await page.getByRole("dialog").getByRole("button", { name: "Close" }).click();
      await page.goto(BASE + "/explore/saved");
      await page.getByRole("heading", { name: "Saved Verses" }).waitFor();
    });
    await step("16-legacy-link", async () => {
      await page.goto(BASE + "/?tab=prayers&section=three-oclock");
      await page.getByText("Prayer for the Hour of Mercy").waitFor();
      if (!page.url().endsWith("/prayers/three-oclock")) throw new Error("legacy link was not rewritten: " + page.url());
    });
    await check("a new screen starts at the top and Back restores the scroll position", async () => {
      await page.goto(BASE + "/");
      await page.getByText("Daily Verse").first().waitFor();
      const before = await page.evaluate(() => { window.scrollTo(0, 500); return window.scrollY; });
      await nav("Prayers");
      await page.getByText("Catholic Prayers").waitFor();
      const top = await page.evaluate(() => window.scrollY);
      await page.goBack();
      await page.getByText("Daily Verse").first().waitFor();
      await page.waitForTimeout(300);
      const restored = await page.evaluate(() => window.scrollY);
      if (before < 50 || top !== 0 || Math.abs(restored - before) > 50) throw new Error(`before=${before} top=${top} restored=${restored}`);
      return true;
    });
    await check("an unknown address goes Home", async () => {
      await page.goto(BASE + "/does-not-exist");
      await page.getByText("Daily Verse").first().waitFor();
      return new URL(page.url()).pathname === "/";
    });
    await step("14-account", async () => {
      await page.getByRole("button", { name: "Account" }).click();
      await page.getByRole("dialog", { name: "Account" }).waitFor();
    });

    // Offline: with the service worker allowed, the app must load with the server stopped.
    // Keep this last, because it stops the preview server.
    const offlineCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, userAgent: UA, serviceWorkers: "allow" });
    await stubSession(offlineCtx);
    const offlinePage = await offlineCtx.newPage();
    offlinePage.setDefaultTimeout(15000);
    let stage = "start";
    const problems = [];
    offlinePage.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
    offlinePage.on("requestfailed", (r) => problems.push(`requestfailed: ${r.url()}`));
    try {
      await offlinePage.goto(BASE + "/");
      await offlinePage.evaluate((s) => {
        localStorage.setItem("sb-kfoymqjekxxilqkyfavi-auth-token", JSON.stringify(s));
        localStorage.setItem("verbum_notif_dismissed", "1");
        localStorage.setItem("verbum_install_dismissed", String(Date.now()));
      }, session);
      await offlinePage.evaluate(() => navigator.serviceWorker.ready.then(() => true));
      stage = "controlled reload";
      await offlinePage.reload();
      await offlinePage.getByText("Daily Verse").first().waitFor();
      const controlled = await offlinePage.evaluate(() => !!navigator.serviceWorker.controller);
      if (!controlled) throw new Error("page is not controlled by the service worker");
      process.kill(-server.pid);
      await new Promise((r) => setTimeout(r, 800));
      stage = "offline reload";
      problems.length = 0;
      await offlinePage.reload();
      await offlinePage.getByText("Daily Verse").first().waitFor();
      const fontsOk = await offlinePage.evaluate(() => document.fonts.ready.then(() => document.fonts.check("600 17px Cinzel") && document.fonts.check("500 21px 'EB Garamond'") && document.fonts.check("400 16px Lato")));
      if (!fontsOk) throw new Error("fonts did not load offline");
      // A screen whose code loads on demand must also work offline.
      await offlinePage.getByRole("button", { name: "Prayers", exact: true }).last().click();
      await offlinePage.getByText("Catholic Prayers").waitFor();
      await offlinePage.screenshot({ path: path.join(outDir, "17-offline.png") });
    } catch (e) {
      failed.push("17-offline");
      console.error(`FAILED 17-offline at "${stage}": ${String(e.message).split("\n")[0]}`);
      problems.slice(0, 8).forEach((p) => console.error("  " + p));
      await offlinePage.screenshot({ path: path.join(outDir, "17-offline-FAILED.png") }).catch(() => {});
    }
  } finally {
    if (browser) await browser.close();
    try { process.kill(-server.pid); } catch { /* already gone */ }
  }
  if (failed.length) {
    console.error(`${failed.length} screen(s) failed: ${failed.join(", ")}`);
    process.exit(1);
  }
  console.log(`Screens written to ${outDir}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
