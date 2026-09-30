import { ImageResponse } from "@vercel/og";
import { findVerse } from "../src/verses.js";

// Draws the 1200x630 link-preview image for a shared verse: /api/og?v=<verse-slug>
export const config = { runtime: "edge" };

const h = (type, style, children) => ({ type, props: { style: { display: "flex", ...style }, children } });

function fontSizeFor(len) {
  if (len < 90) return 58;
  if (len < 160) return 48;
  if (len < 240) return 40;
  return 33;
}

export default async function handler(request) {
  const url = new URL(request.url);
  const verse = findVerse(url.searchParams.get("v"));
  if (!verse) return Response.redirect(new URL("/og-image.jpg", url.origin), 302);

  let fonts = [];
  try {
    const res = await fetch(new URL("/fonts/Cinzel-Bold.woff", url.origin));
    if (res.ok) fonts = [{ name: "Cinzel", data: await res.arrayBuffer(), weight: 700, style: "normal" }];
  } catch {
    // falls back to the default font
  }

  // Inline the logo as a data URI (no extra network hop while drawing; omitted if it can't load).
  let logo = null;
  try {
    const res = await fetch(new URL("/icon-192.png", url.origin));
    if (res.ok) {
      const bytes = new Uint8Array(await res.arrayBuffer());
      let bin = "";
      for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      logo = `data:image/png;base64,${btoa(bin)}`;
    }
  } catch {
    // no logo
  }

  const size = fontSizeFor(verse.text.length);
  const tree = h(
    "div",
    {
      width: "100%", height: "100%", flexDirection: "column", justifyContent: "space-between", padding: "56px 72px",
      background: "linear-gradient(135deg,#8B4513,#4A2508)", color: "#FFF8E7", fontFamily: fonts.length ? "Cinzel" : "sans-serif",
    },
    [
      h("div", { alignItems: "center" }, [
        ...(logo ? [{ type: "img", props: { src: logo, width: 64, height: 64, style: { borderRadius: 16, marginRight: 20 } } }] : []),
        h("div", { fontSize: 34, letterSpacing: 10, color: "#F5E6C8" }, "VERBUM"),
      ]),
      h("div", { flexDirection: "column" }, [
        h("div", { fontSize: size, lineHeight: 1.4, fontWeight: 700 }, `“${verse.text}”`),
        h("div", { fontSize: 32, letterSpacing: 4, color: "#DAA520", marginTop: 24 }, verse.ref.toUpperCase()),
      ]),
      h("div", { fontSize: 26, color: "#F5E6C8" }, `Get Verbum free · ${url.host}/install`),
    ],
  );

  return new ImageResponse(tree, {
    width: 1200,
    height: 630,
    fonts,
    headers: { "cache-control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400" },
  });
}
