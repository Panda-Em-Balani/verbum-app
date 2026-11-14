import { useEffect, useState } from "react";
import { buildMessage, shareLinks, copyText } from "./share.js";
import { track } from "./analytics.js";
import Dialog from "./components/Dialog.jsx";
import ShareIcon from "./components/ShareIcon.jsx";
import { GOLD, SURFACE, MUTED, R } from "./theme.js";
import { pillButton, primaryButton, secondaryButton } from "./styles/buttons.js";
import { body, secondary } from "./styles/text.js";

function fileShareSupported(file) {
  return typeof navigator !== "undefined" && typeof navigator.canShare === "function" && typeof navigator.share === "function" && navigator.canShare({ files: [file] });
}

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
      // The card renderer (and its QR library) loads only when someone shares.
      const { renderStoryCard } = await import("./storyCard.js");
      const b = await renderStoryCard({ text, ref: verseRef });
      setBlob(b);
      setPreviewUrl(URL.createObjectURL(b));
      setState("ready");
    } catch {
      setState("error");
    }
  };

  const fileName = `verbum-${String(verseRef || "verse").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;

  const save = () => {
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

  const shareImage = async () => {
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
    save();
  };

  const copy = async () => {
    if (await copyText(`${message.body} ${message.url}`)) {
      setCopied(true);
      track("share_complete", { source, via: "copy" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const canShareFiles = blob ? fileShareSupported(new File([blob], "x.png", { type: "image/png" })) : false;

  return (
    <>
      <button type="button" onClick={open} disabled={state === "loading"} aria-label="Share this verse" style={{ ...pillButton, opacity: state === "loading" ? 0.6 : 1, ...style }}>
        <ShareIcon />
        {state === "loading" ? "Creating…" : label}
      </button>
      <Dialog open={state === "ready" || state === "error"} onClose={reset} label="Share this verse">
        {state === "error" ? (
          <p style={{ ...body, textAlign: "center", margin: "12px 0 16px" }}>Couldn't create the image. Please try again.</p>
        ) : (
          <>
            <img src={previewUrl} alt={`Verse card for ${verseRef}`} style={{ display: "block", width: "auto", maxWidth: "100%", maxHeight: "34vh", margin: "0 auto 14px", borderRadius: R.sm, boxShadow: "0 2px 10px rgba(0,0,0,0.2)" }} />
            <button type="button" onClick={shareImage} style={{ ...primaryButton, marginBottom: 12 }}>
              {canShareFiles ? "Share image + link" : "Save image"}
            </button>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
              {shareLinks(message).map((l) => (
                <a key={l.id} href={l.href} target="_blank" rel="noopener noreferrer" onClick={() => track("share_complete", { source, via: l.id })} style={{ ...secondaryButton, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {l.label}
                </a>
              ))}
              <button type="button" onClick={copy} style={{ ...secondaryButton, border: `1px solid ${GOLD}`, background: SURFACE }}>{copied ? "Copied!" : "Copy link"}</button>
            </div>
            {canShareFiles && <button type="button" onClick={save} style={{ ...secondaryButton, marginBottom: 8 }}>Save image</button>}
            <p style={{ ...secondary, fontSize: 13, textAlign: "center", margin: "6px 0 10px" }}>
              {note || "Facebook shows this verse as a card. For Instagram, choose Stories in the share sheet."}
            </p>
          </>
        )}
        <button type="button" onClick={reset} style={{ ...secondaryButton, color: MUTED, fontWeight: 400 }}>Close</button>
      </Dialog>
    </>
  );
}
