import { findVerse } from "../src/verses.js";

// Serves the app shell for /install?v=<verse-slug> with that verse's preview tags,
// so Facebook, WhatsApp and X show the verse image. Plain /install stays fully static.
export const config = { runtime: "edge" };

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function setMeta(html, attr, name, value) {
  const re = new RegExp(`(<meta\\s+${attr}="${name}"\\s+content=")[^"]*(")`);
  return html.replace(re, (_, a, b) => `${a}${esc(value)}${b}`);
}

export default async function handler(request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("v");
  const verse = findVerse(slug);

  const shell = await fetch(new URL("/index.html", url.origin));
  let html = await shell.text();

  if (verse) {
    const title = `${verse.ref} · Verbum`;
    const desc = `“${verse.text}” Read a verse a day on Verbum.`;
    const image = `${url.origin}/api/og?v=${encodeURIComponent(slug)}`;
    const page = `${url.origin}/install?v=${encodeURIComponent(slug)}`;
    html = setMeta(html, "property", "og:title", title);
    html = setMeta(html, "property", "og:description", desc);
    html = setMeta(html, "property", "og:url", page);
    html = setMeta(html, "property", "og:image", image);
    html = setMeta(html, "name", "twitter:title", title);
    html = setMeta(html, "name", "twitter:description", desc);
    html = setMeta(html, "name", "twitter:image", image);
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  }

  return new Response(html, {
    status: shell.status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
