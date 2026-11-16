import { useState } from "react";
import { buildMessage, shareLinks, nativeShare, copyText, canNativeShare } from "./share.js";
import { track } from "./analytics.js";
import Dialog from "./components/Dialog.jsx";
import ShareIcon from "./components/ShareIcon.jsx";
import { GOLD, SURFACE, MUTED, FONT_UI } from "./theme.js";
import { pillButton, secondaryButton } from "./styles/buttons.js";
import { cardTitle } from "./styles/text.js";

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

  const onCopy = async () => {
    const ok = await copyText(`${message.body} ${message.url}`);
    if (ok) {
      setCopied(true);
      track("share_complete", { source, via: "copy" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const close = () => { setOpen(false); setCopied(false); };

  return (
    <>
      <button type="button" onClick={onClick} aria-label={label} style={{ ...pillButton, ...style }}>
        <ShareIcon />
        {label}
      </button>
      <Dialog open={open} onClose={close} label="Share Verbum" placement="bottom">
        <div style={{ ...cardTitle, marginBottom: 14 }}>Share Verbum</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          {shareLinks(message).map((l) => (
            <a key={l.id} href={l.href} target="_blank" rel="noopener noreferrer" onClick={() => track("share_complete", { source, via: l.id })} style={{ ...secondaryButton, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {l.label}
            </a>
          ))}
          <button type="button" onClick={onCopy} style={{ ...secondaryButton, border: `1px solid ${GOLD}`, background: SURFACE }}>
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
        <div style={{ fontFamily: FONT_UI, fontSize: 12, color: MUTED, wordBreak: "break-all", marginBottom: 14 }}>{message.url}</div>
        <button type="button" onClick={close} style={{ ...secondaryButton, color: MUTED, fontWeight: 400 }}>Close</button>
      </Dialog>
    </>
  );
}
