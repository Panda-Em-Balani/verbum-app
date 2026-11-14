import { CalendarIco } from "../../components/Icons.jsx";
import { HAPPENINGS } from "../../content/happenings.js";
import { SURFACE, TEXT, TEXT_BODY, MUTED, GOLD, GOLD_TEXT, FONT_DISPLAY, FONT_UI, R, CARD_SHADOW_STRONG } from "../../theme.js";

export default function DailyCatholicHappening() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  // Only show a card if today actually has a feast/happening in the calendar.
  // On ordinary days with no matching entry, render nothing.
  const happening = HAPPENINGS.find(h => h.month === month && h.day === day);

  if (!happening) return null;

  return (
    <div style={{ background: "linear-gradient(135deg,#FFFCF5,#FFF5DC)", border: `1px solid ${GOLD}50`, borderRadius: R.md, padding: 20, marginBottom: 16, position: "relative", overflow: "hidden", boxShadow: CARD_SHADOW_STRONG }}>
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(218,165,32,0.06)" }} />
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: R.sm, background: `${GOLD}15`, border: `1px solid ${GOLD}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <CalendarIco />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: GOLD_TEXT, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: FONT_DISPLAY, marginBottom: 4, fontWeight: 700 }}>
            Today in the Church {happening.year ? `· ${happening.year}` : ""}
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, color: TEXT, fontWeight: 600, letterSpacing: "0.05em", lineHeight: 1.4 }}>{happening.title}</div>
        </div>
      </div>
      {happening.type && (
        <div style={{ display: "inline-block", background: `${GOLD}15`, border: `1px solid ${GOLD}40`, borderRadius: R.lg, padding: "4px 14px", marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: GOLD_TEXT, fontFamily: FONT_DISPLAY, letterSpacing: "0.1em", fontWeight: 600 }}>{happening.type}</span>
        </div>
      )}
      <p style={{ fontSize: 15, color: TEXT_BODY, lineHeight: 1.75, fontFamily:FONT_UI, marginBottom: 12, fontWeight: 500 }}>{happening.body}</p>
      {happening.ccc && (
        <div style={{ background: SURFACE, borderLeft: `3px solid ${GOLD}80`, borderRadius: "0 12px 12px 0", padding: "11px 14px" }}>
          <div style={{ fontSize: 12, color: GOLD_TEXT, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: FONT_DISPLAY, marginBottom: 5, fontWeight: 700 }}>Catechism Connection</div>
          <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.7, fontFamily:FONT_UI, fontWeight: 500 }}>{happening.ccc}</p>
        </div>
      )}
    </div>
  );
}
