import { readFile } from "node:fs/promises";
import path from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { findVerse } from "../src/verses.js";

// Draws the 1200x630 link-preview image for a shared verse: /api/og?v=<verse-slug>
// Runs on the Node runtime; the font and logo are bundled via "includeFiles" in vercel.json.

const h = (type, style, children) => ({ type, props: { style: { display: "flex", ...style }, children } });

function fontSizeFor(len) {
  if (len < 90) return 58;
  if (len < 160) return 48;
  if (len < 240) return 40;
  return 33;
}

const publicFile = (...parts) => readFile(path.join(process.cwd(), "public", ...parts));

export default async function handler(req, res) {
  const url = new URL(req.url, "http://localhost");
  const verse = findVerse(url.searchParams.get("v"));
  if (!verse) {
    res.statusCode = 302;
    res.setHeader("location", "/og-image.jpg");
    res.end();
    return;
  }

  try {
    const [font, icon] = await Promise.all([
      publicFile("fonts", "Cinzel-Bold.woff"),
      publicFile("icon-192.png").catch(() => null),
    ]);
    const logo = icon ? `data:image/png;base64,${icon.toString("base64")}` : null;
    const host = req.headers["x-forwarded-host"] || req.headers.host || "verbum-app-two.vercel.app";

    const tree = h(
      "div",
      {
        width: "100%", height: "100%", flexDirection: "column", justifyContent: "space-between", padding: "56px 72px",
        background: "linear-gradient(135deg,#8B4513,#4A2508)", color: "#FFF8E7", fontFamily: "Cinzel",
      },
      [
        h("div", { alignItems: "center" }, [
          ...(logo ? [{ type: "img", props: { src: logo, width: 64, height: 64, style: { borderRadius: 16, marginRight: 20 } } }] : []),
          h("div", { fontSize: 34, letterSpacing: 10, color: "#F5E6C8" }, "VERBUM"),
        ]),
        h("div", { flexDirection: "column" }, [
          h("div", { fontSize: fontSizeFor(verse.text.length), lineHeight: 1.4, fontWeight: 700 }, `“${verse.text}”`),
          h("div", { fontSize: 32, letterSpacing: 4, color: "#DAA520", marginTop: 24 }, verse.ref.toUpperCase()),
        ]),
        h("div", { fontSize: 26, color: "#F5E6C8" }, `Get Verbum free · ${host}/install`),
      ],
    );

    const svg = await satori(tree, {
      width: 1200,
      height: 630,
      fonts: [{ name: "Cinzel", data: font, weight: 700, style: "normal" }],
    });
    const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();

    res.statusCode = 200;
    res.setHeader("content-type", "image/png");
    res.setHeader("cache-control", "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400");
    res.end(png);
  } catch {
    // Never leave a crawler without an image: fall back to the default preview.
    res.statusCode = 302;
    res.setHeader("location", "/og-image.jpg");
    res.end();
  }
}
