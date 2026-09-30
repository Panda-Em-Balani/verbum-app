import { useEffect, useState } from "react";
import { renderStoryCard } from "./storyCard.js";
import { buildMessage, shareLinks, copyText } from "./share.js";
import { track } from "./analytics.js";
import { GOLD, GOLD_BRIGHT, GOLD_TEXT, CARD, BORDER, MUTED, CINZEL, R, WHITE } from "./theme.js";

function ShareIcon({ size = 16, color = GOLD_BRIGHT }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
      <path d="M16 6l-4-4-4 4" />
      <path d="M12 2v14" />
    </svg>
  );
}

function fileShareSupported(file) {
  return typeof navigator !== "undefined" && typeof navigator.canShare === "function" && typeof navigator.share === "function" && navigator.canShare({ files: [file] });
}

const secondaryBtn = { display: "block", width: "100%", background: "none", border: `1px solid ${BORDER}`, borderRadius: R.sm, padding: 12, minHeight: 44, color: WHITE, fontSize: 14, fontFamily: "'Lato',sans-serif", fontWeight: 700, cursor: "pointer" };

// One Share button for a verse. Draws a 9:16 verse image (with QR + install link), then offers:
//  - the phone's share sheet with the image AND the link together (Stories, WhatsApp, Messages...)
//  - a Facebook post: a link whose preview card is the verse image (see /api/og)
//  - Telegram, X, email, copy link, and saving the image.
export default function VerseShareButton({ text, verseRef, source = "verse", label = "Share", style }) {
  const [state, setState] = useState("idle"); // idle | loading | ready | error
  const [blob, setBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);

  const message = buildMessage({ text, ref: verseRef, source, withVerseLink: true });

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const reset = () => { setState("idle"); setBlob(null); setPreviewUrl(null); setNote(""); setCopied(false); };

  const open = async (e) => {
    e.stopPropagation();
    track("share_click", { source });
    setState("loading");
    setNote("");
    try {
      const b = await renderStoryCard({ text, ref: verseRef });
      setBlob(b);
      setPreviewUrl(URL.createObjectURL(b));
      setState("ready");
    } catch {
      setState("error");
    }
  };

  const close = (e) => { e.stopPropagation(); reset(); };

  const dialogOpen = state === "ready" || state === "error";
  useEffect(() => {
    if (!dialogOpen) return;
    const onKey = (ev) => { if (ev.key === "Escape") reset(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dialogOpen]);

  const fileName = `verbum-${String(verseRef || "verse").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;

  const save = (e) => {
    e.stopPropagation();
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    track("story_saved", { source });
    setNote("Image saved. Post it to your Story or feed. It links friends to Verbum.");
  };

  const shareImage = async (e) => {
    e.stopPropagation();
    if (!blob) return;
    const file = new File([blob], fileName, { type: "image/png" });
    if (fileShareSupported(file)) {
      try {
        await navigator.share({ files: [file], title: message.title, text: `${message.body} ${message.url}` });
        track("share_complete", { source, via: "image" });
        return;
      } catch (err) {
        if (err && err.name === "AbortError") return;
      }
    }
    save(e);
  };

  const copy = async (e) => {
    e.stopPropagation();
    if (await copyText(`${message.body} ${message.url}`)) {
      setCopied(true);
      track("share_complete", { source, via: "copy" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const canShareFiles = blob ? fileShareSupported(new File([blob], "x.png", { type: "image/png" })) : false;

  return (
    <>
      <button
        type="button"
        onClick={open}
        disabled={state === "loading"}
        aria-label="Share this verse"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: `1px solid ${GOLD}80`, borderRadius: 22, padding: "0 14px", minHeight: 44, cursor: "pointer", color: GOLD_TEXT, fontFamily: CINZEL, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", opacity: state === "loading" ? 0.6 : 1, ...style }}
      >
        <ShareIcon />
        {state === "loading" ? "Creating…" : label}
      </button>
      {dialogOpen && (
        <div onClick={close} style={{ position: "fixed", inset: 0, zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", cursor: "default" }}>
          <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Share this verse" style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: R.lg, padding: 18, width: "100%", maxWidth: 380, maxHeight: "calc(100vh - 32px)", overflowY: "auto", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
            {state === "error" ? (
              <p style={{ color: WHITE, fontSize: 15, textAlign: "center", margin: "12px 0 16px" }}>Couldn't create the image. Please try again.</p>
            ) : (
              <>
                <img src={previewUrl} alt={`Verse card for ${verseRef}`} style={{ display: "block", width: "auto", maxWidth: "100%", maxHeight: "34vh", margin: "0 auto 14px", borderRadius: R.sm, boxShadow: "0 2px 10px rgba(0,0,0,0.2)" }} />
                <button type="button" onClick={shareImage} style={{ display: "block", width: "100%", background: `linear-gradient(135deg,${GOLD},${GOLD_BRIGHT})`, border: "none", borderRadius: R.sm, padding: 14, minHeight: 48, color: "#fff", fontSize: 16, fontFamily: CINZEL, fontWeight: 700, letterSpacing: "0.06em", cursor: "pointer", marginBottom: 12 }}>
                  {canShareFiles ? "Share image + link" : "Save image"}
                </button>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                  {shareLinks(message).map((l) => (
                    <a key={l.id} href={l.href} target="_blank" rel="noopener noreferrer" onClick={() => track("share_complete", { source, via: l.id })} style={{ ...secondaryBtn, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", padding: "0 8px" }}>
                      {l.label}
                    </a>
                  ))}
                  <button type="button" onClick={copy} style={{ ...secondaryBtn, border: `1px solid ${GOLD}`, background: `${GOLD}18` }}>{copied ? "Copied!" : "Copy link"}</button>
                </div>
                {canShareFiles && <button type="button" onClick={save} style={{ ...secondaryBtn, marginBottom: 8 }}>Save image</button>}
                <p style={{ fontSize: 12, color: MUTED, textAlign: "center", lineHeight: 1.6, margin: "6px 0 10px" }}>
                  {note || "Facebook shows this verse as a card. For Instagram, choose Stories in the share sheet."}
                </p>
              </>
            )}
            <button type="button" onClick={close} style={{ ...secondaryBtn, color: MUTED, fontWeight: 400 }}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
