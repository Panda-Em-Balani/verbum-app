import { useState } from "react";
import { ClockIco } from "../../components/Icons.jsx";
import { THREE_OCLOCK_PRAYER } from "../../content/threeOclock.js";
import { MERCY, FONT_UI, R, CARD_SHADOW_STRONG } from "../../theme.js";
import { cardTitle, eyebrow, body, prayerText } from "../../styles/text.js";

// Shown on Home during the three o'clock hour.
export default function ThreeOClockBanner() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ background: MERCY.bg, border: `1px solid ${MERCY.border}`, borderRadius: R.md, padding: 18, marginBottom: 16, boxShadow: CARD_SHADOW_STRONG }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: `1px solid ${MERCY.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><ClockIco color={MERCY.accent} /></div>
        <div>
          <div style={{ ...cardTitle, color: MERCY.text }}>The Three O'Clock Hour</div>
          <div style={{ ...eyebrow, color: MERCY.accent }}>Hour of Mercy</div>
        </div>
      </div>
      <p style={{ ...body, color: MERCY.text, marginBottom: 12 }}>This is the Hour of Mercy, the hour of Christ's death on the Cross. Pause for a moment of prayer.</p>
      <div style={{ ...prayerText, color: MERCY.text, fontStyle: "italic", marginBottom: 12 }}>“{THREE_OCLOCK_PRAYER.shortPrayer}”</div>
      <button type="button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)} style={{ minHeight: 44, padding: "0 14px", background: "none", border: `1px solid ${MERCY.border}`, borderRadius: R.sm, color: MERCY.accent, fontFamily: FONT_UI, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>{expanded ? "Hide the prayers" : "More prayers for this hour"}</button>
      {expanded && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${MERCY.border}` }}>
          <div style={{ ...eyebrow, color: MERCY.accent, marginBottom: 8 }}>Three O'Clock Prayers</div>
          <div style={{ ...prayerText, color: MERCY.text }}>{THREE_OCLOCK_PRAYER.chaplet}</div>
        </div>
      )}
    </div>
  );
}
