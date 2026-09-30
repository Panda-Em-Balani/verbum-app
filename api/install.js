import { readFile } from "node:fs/promises";
import path from "node:path";
import { findVerse } from "../src/verses.js";

// Serves the app shell for /install?v=<verse-slug> with that verse's preview tags,
// so Facebook, WhatsApp and X show the verse image. Plain /install stays fully static.
// Reads the built dist/index.html (bundled via "includeFiles" in vercel.json), so it never
// depends on fetching the site from itself.

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function setMeta(html, attr, name, value) {
  const re = new RegExp(`(<meta\\s+${attr}="${name}"\\s+content=")[^"]*(")`);
  return html.replace(re, (_, a, b) => `${a}${esc(value)}${b}`);
}

export default async function handler(req, res) {
  const url = new URL(req.url, "http://localhost");
  const slug = url.searchParams.get("v");
  const verse = findVerse(slug);
  const proto = (req.headers["x-forwarded-proto"] || "https").split(",")[0];
  const host = req.headers["x-forwarded-host"] || req.headers.host || "verbum-app-two.vercel.app";
  const origin = `${proto}://${host}`;

  let html;
  try {
    html = await readFile(path.join(process.cwd(), "dist", "index.html"), "utf8");
  } catch {
    // Never leave a shared link broken: fall back to the plain, static install page.
    res.statusCode = 302;
    res.setHeader("location", "/install?ref=fallback");
    res.end();
    return;
  }

  if (verse) {
    const title = `${verse.ref} · Verbum`;
    const desc = `“${verse.text}” Read a verse a day on Verbum.`;
    const image = `${origin}/api/og?v=${encodeURIComponent(slug)}`;
    const page = `${origin}/install?v=${encodeURIComponent(slug)}`;
    html = setMeta(html, "property", "og:title", title);
    html = setMeta(html, "property", "og:description", desc);
    html = setMeta(html, "property", "og:url", page);
    html = setMeta(html, "property", "og:image", image);
    html = setMeta(html, "name", "twitter:title", title);
    html = setMeta(html, "name", "twitter:description", desc);
    html = setMeta(html, "name", "twitter:image", image);
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  }

  res.statusCode = 200;
  res.setHeader("content-type", "text/html; charset=utf-8");
  res.setHeader("cache-control", "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400");
  res.end(html);
}
