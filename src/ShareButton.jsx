import { useState } from "react";
import { buildMessage, shareLinks, nativeShare, copyText, canNativeShare } from "./share.js";
import { track } from "./analytics.js";
import { GOLD, GOLD_BRIGHT, GOLD_TEXT, CARD, BORDER, MUTED, CINZEL, R, CARD_SHADOW_STRONG, WHITE } from "./theme.js";


function ShareIcon({ size = 16, color = GOLD_BRIGHT }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
      <path d="M16 6l-4-4-4 4" />
      <path d="M12 2v14" />
    </svg>
  );
}

// One-tap share. Uses the phone's share sheet when available, otherwise opens a small
// sheet with copy-link and direct links. Safe to place inside clickable cards.
export default function ShareButton({ text, verseRef, source = "share", label = "Share", style }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const message = buildMessage({ text, ref: verseRef, source });

  const onClick = async (e) => {
    e.stopPropagation();
    track("share_click", { source });
    if (canNativeShare()) {
      const result = await nativeShare(message, source);
      if (result !== "unsupported") return;
    }
    setOpen(true);
  };

  const onCopy = async (e) => {
    e.stopPropagation();
    const ok = await copyText(`${message.body} ${message.url}`);
    if (ok) {
      setCopied(true);
      track("share_complete", { source, via: "copy" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const close = (e) => { e.stopPropagation(); setOpen(false); setCopied(false); };

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: `1px solid ${GOLD}80`, borderRadius: 22, padding: "0 14px", minHeight: 44, cursor: "pointer", color: GOLD_TEXT, fontFamily: CINZEL, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", ...style }}
      >
        <ShareIcon />
        {label}
      </button>
      {open && (
        <div onClick={close} style={{ position: "fixed", inset: 0, zIndex: 1100, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)", cursor: "default" }}>
          <div onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Share Verbum" style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: R.lg, padding: 22, width: "calc(100% - 32px)", maxWidth: 414, margin: "0 0 24px", boxShadow: CARD_SHADOW_STRONG }}>
            <div style={{ fontFamily: CINZEL, fontSize: 17, fontWeight: 700, color: WHITE, letterSpacing: "0.06em", marginBottom: 14 }}>Share Verbum</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              {shareLinks(message).map((l) => (
                <a key={l.id} href={l.href} target="_blank" rel="noopener noreferrer" onClick={() => track("share_complete", { source, via: l.id })} style={{ textAlign: "center", textDecoration: "none", border: `1px solid ${BORDER}`, borderRadius: R.sm, padding: "12px 8px", color: WHITE, fontSize: 14, fontFamily: "'Lato',sans-serif", fontWeight: 700 }}>
                  {l.label}
                </a>
              ))}
              <button type="button" onClick={onCopy} style={{ border: `1px solid ${GOLD}`, background: `${GOLD}18`, borderRadius: R.sm, padding: "12px 8px", color: WHITE, fontSize: 14, fontFamily: "'Lato',sans-serif", fontWeight: 700, cursor: "pointer" }}>
                {copied ? "Copied!" : "Copy link"}
              </button>
            </div>
            <div style={{ fontSize: 12, color: MUTED, fontFamily: "'Lato',sans-serif", wordBreak: "break-all", marginBottom: 14 }}>{message.url}</div>
            <button type="button" onClick={close} style={{ width: "100%", background: "none", border: `1px solid ${BORDER}`, borderRadius: R.sm, padding: 12, color: MUTED, fontSize: 14, cursor: "pointer" }}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
