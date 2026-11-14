import { TEXT, FONT_DISPLAY, FONT_UI, R, CARD_SHADOW_STRONG } from "../../theme.js";
import { card, eyebrow, secondary } from "../../styles/text.js";

// Shared frame for signed-out screens: logo, wordmark and one card.
export default function AuthShell({ children }) {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #EDE5D6 0%, #F6F1E7 50%, #E8DFC8 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "calc(24px + env(safe-area-inset-top)) 24px calc(40px + env(safe-area-inset-bottom))", fontFamily: FONT_UI }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <picture>
          <source srcSet="/verbum-logo-256.webp" type="image/webp" />
          <img src="/verbum-logo-256.png" alt="" width="110" height="110" style={{ borderRadius: R.lg, marginBottom: 16, boxShadow: "0 4px 24px rgba(122,90,6,0.18)" }} />
        </picture>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 26, color: TEXT, fontWeight: 600, letterSpacing: "0.12em", marginBottom: 4 }}>VERBUM</h1>
        <div style={{ ...eyebrow, fontSize: 13, letterSpacing: "0.22em", fontWeight: 600 }}>The Word</div>
      </div>
      <div style={{ ...card, borderRadius: R.lg, padding: "28px 24px", width: "100%", maxWidth: 380, boxShadow: CARD_SHADOW_STRONG }}>
        {children}
      </div>
      <p style={{ ...secondary, fontSize: 14, textAlign: "center", marginTop: 20 }}>A Catholic companion for daily prayer and Scripture.</p>
    </div>
  );
}
