import { CARD, BORDER, TEXT, MUTED, GOLD, GOLD_DEEP, FONT_DISPLAY, FONT_UI, R, CARD_SHADOW_STRONG } from "../theme.js";

export default function InstallBanner({ onInstall, onDismiss }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 900, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 0 24px", background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}>
      <div role="dialog" aria-modal="true" aria-label="Add Verbum to Home Screen" style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: R.lg, padding: 24, width: "calc(100% - 32px)", maxWidth: 414, boxShadow: CARD_SHADOW_STRONG }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <img src="/icon-192.png" alt="Verbum" style={{ width: 56, height: 56, borderRadius: R.sm, flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color: TEXT, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 3 }}>Add Verbum to Home Screen</div>
            <p style={{ fontSize: 13, color: MUTED, fontFamily:FONT_UI, fontWeight: 500, lineHeight: 1.5 }}>Quick access, offline support, and push notifications.</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onInstall} style={{ flex: 1, background: `linear-gradient(135deg,${GOLD},${GOLD_DEEP})`, border: "none", borderRadius: R.sm, padding: "13px", color: "#FFFFFF", fontSize: 15, fontFamily: FONT_DISPLAY, fontWeight: 600, letterSpacing: "0.07em", cursor: "pointer" }}>
            Add to Home Screen
          </button>
          <button onClick={onDismiss} style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: R.sm, padding: "13px 16px", color: MUTED, fontSize: 14, cursor: "pointer", fontFamily:FONT_UI }}>
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
