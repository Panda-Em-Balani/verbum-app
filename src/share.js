import { SITE_URL, INSTALL_PATH } from "./config.js";
import { track } from "./analytics.js";
import { verseSlug } from "./verses.js";

// The link every share carries: the public install page, tagged so shares can be counted.
// With a verse reference the link opens that verse and its preview card (see /api/install).
export function shareUrl(source = "share", verseRef) {
  const v = verseRef ? `&v=${verseSlug(verseRef)}` : "";
  return `${SITE_URL}${INSTALL_PATH}?ref=${encodeURIComponent(source)}${v}`;
}

export function canNativeShare() {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export function buildMessage({ text, ref, source, withVerseLink = false }) {
  const quote = text ? `"${text}"${ref ? ` (${ref})` : ""}` : "";
  const invite = text ? "Read a verse a day on Verbum:" : "Join me on Verbum, a Catholic companion for daily Scripture and prayer:";
  return { title: "Verbum", body: quote ? `${quote}\n\n${invite}` : invite, url: shareUrl(source, withVerseLink ? ref : undefined) };
}

// Direct links for desktop / browsers without the native share sheet.
export function shareLinks({ body, url }) {
  const full = `${body} ${url}`;
  const u = encodeURIComponent(url);
  return [
    { id: "facebook", label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { id: "whatsapp", label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(full)}` },
    { id: "telegram", label: "Telegram", href: `https://t.me/share/url?url=${u}&text=${encodeURIComponent(body)}` },
    { id: "x", label: "X", href: `https://twitter.com/intent/tweet?url=${u}&text=${encodeURIComponent(body)}` },
    { id: "email", label: "Email", href: `mailto:?subject=${encodeURIComponent("Verbum")}&body=${encodeURIComponent(full)}` },
  ];
}

export async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    try {
      const el = document.createElement("textarea");
      el.value = value;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  }
}

// Returns "shared" | "cancelled" | "unsupported".
export async function nativeShare(message, source) {
  if (!canNativeShare()) return "unsupported";
  try {
    await navigator.share({ title: message.title, text: message.body, url: message.url });
    track("share_complete", { source, via: "native" });
    return "shared";
  } catch (e) {
    return e && e.name === "AbortError" ? "cancelled" : "unsupported";
  }
}
