import { CARD, BORDER, TEXT, CARD_SHADOW_STRONG, FONT_UI, R } from "../theme.js";
import { primaryButton, secondaryButton } from "../styles/buttons.js";

// Offers a downloaded update. Nothing reloads until "Refresh" is tapped.
export default function UpdateBanner({ apply, onDismiss }) {
  return (
    <div role="status" style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: "calc(84px + env(safe-area-inset-bottom))", width: "calc(100% - 24px)", maxWidth: 406, zIndex: 160, background: CARD, border: `1px solid ${BORDER}`, borderRadius: R.md, boxShadow: CARD_SHADOW_STRONG, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, minWidth: 0, fontFamily: FONT_UI, fontSize: 15, lineHeight: 1.4, color: TEXT }}>A new version of Verbum is ready.</div>
      <button type="button" onClick={onDismiss} style={{ ...secondaryButton, width: "auto", padding: "0 12px" }}>Later</button>
      <button type="button" onClick={apply} style={{ ...primaryButton, width: "auto", minHeight: 44, padding: "0 14px" }}>Refresh</button>
    </div>
  );
}
