import { useEffect, useState } from "react";
import { renderStoryCard } from "./storyCard.js";
import { buildMessage } from "./share.js";
import { track } from "./analytics.js";
import { GOLD, GOLD_BRIGHT, GOLD_TEXT, CARD, BORDER, MUTED, CINZEL, R, WHITE } from "./theme.js";


function StoryIcon({ size = 16, color = GOLD_BRIGHT }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="6" y="2" width="12" height="20" rx="3" />
      <circle cx="12" cy="10" r="2.5" />
      <path d="M8.5 17c1-2 2.2-3 3.5-3s2.5 1 3.5 3" />
    </svg>
  );
}

function fileShareSupported(file) {
  return typeof navigator !== "undefined" && typeof navigator.canShare === "function" && typeof navigator.share === "function" && navigator.canShare({ files: [file] });
}

// Renders the verse as a 9:16 image with an install QR, then shares it as a Story
// (native share sheet with the image attached) or lets the user save it.
export default function StoryShareButton({ text, verseRef, source = "story", label = "Story", style }) {
  const [state, setState] = useState("idle"); // idle | loading | ready | error
  const [blob, setBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [note, setNote] = useState("");

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const open = async (e) => {
    e.stopPropagation();
    track("story_click", { source });
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

  const close = (e) => { e.stopPropagation(); setState("idle"); setBlob(null); setPreviewUrl(null); setNote(""); };

  const dialogOpen = state === "ready" || state === "error";
  useEffect(() => {
    if (!dialogOpen) return;
    const onKey = (ev) => { if (ev.key === "Escape") { setState("idle"); setBlob(null); setPreviewUrl(null); setNote(""); } };
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
    setNote("Image saved. Add it to your Story and it will link friends to Verbum.");
  };

  const share = async (e) => {
    e.stopPropagation();
    if (!blob) return;
    const file = new File([blob], fileName, { type: "image/png" });
    const msg = buildMessage({ text, ref: verseRef, source: "story" });
    if (fileShareSupported(file)) {
      try {
        await navigator.share({ files: [file], title: msg.title, text: `${msg.body} ${msg.url}` });
        track("story_shared", { source });
        return;
      } catch (err) {
        if (err && err.name === "AbortError") return;
      }
    }
    save(e);
  };

  const canShareFiles = blob ? fileShareSupported(new File([blob], "x.png", { type: "image/png" })) : false;

  return (
    <>
      <button
        type="button"
        onClick={open}
        disabled={state === "loading"}
        aria-label="Share as Story image"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: `1px solid ${GOLD}80`, borderRadius: 22, padding: "0 14px", minHeight: 44, cursor: "pointer", color: GOLD_TEXT, fontFamily: CINZEL, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", opacity: state === "loading" ? 0.6 : 1, ...style }}
      >
        <StoryIcon />
        {state === "loading" ? "Creating…" : label}
      </button>
      {(state === "ready" || state === "error") && (
        <div onClick={close} style={{ position: "fixed", inset: 0, zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", cursor: "default" }}>
          <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Share as Story" style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: R.lg, padding: 18, width: "100%", maxWidth: 380, maxHeight: "calc(100vh - 32px)", overflowY: "auto", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
            {state === "error" ? (
              <p style={{ color: WHITE, fontSize: 15, textAlign: "center", margin: "12px 0 16px" }}>Couldn't create the image. Please try again.</p>
            ) : (
              <>
                <img src={previewUrl} alt={`Story card for ${verseRef}`} style={{ display: "block", width: "auto", maxWidth: "100%", maxHeight: "52vh", margin: "0 auto 14px", borderRadius: R.sm, boxShadow: "0 2px 10px rgba(0,0,0,0.2)" }} />
                <button type="button" onClick={share} style={{ display: "block", width: "100%", background: `linear-gradient(135deg,${GOLD},${GOLD_BRIGHT})`, border: "none", borderRadius: R.sm, padding: 14, color: "#fff", fontSize: 16, fontFamily: CINZEL, fontWeight: 700, letterSpacing: "0.06em", cursor: "pointer", marginBottom: 8 }}>
                  {canShareFiles ? "Share to Story" : "Save image"}
                </button>
                {canShareFiles && (
                  <button type="button" onClick={save} style={{ display: "block", width: "100%", background: "none", border: `1px solid ${BORDER}`, borderRadius: R.sm, padding: 12, color: WHITE, fontSize: 14, cursor: "pointer", marginBottom: 8 }}>Save image</button>
                )}
                <p style={{ fontSize: 12, color: MUTED, textAlign: "center", lineHeight: 1.6, margin: "6px 0 10px" }}>
                  {note || "The card includes a QR code and link so friends can install Verbum."}
                </p>
              </>
            )}
            <button type="button" onClick={close} style={{ display: "block", width: "100%", background: "none", border: `1px solid ${BORDER}`, borderRadius: R.sm, padding: 12, minHeight: 44, color: MUTED, fontSize: 14, cursor: "pointer" }}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
