import { useState } from "react";
import { goBack } from "../../router.js";
import { ChevIco, ClockIco } from "../../components/Icons.jsx";
import { THREE_OCLOCK_PRAYER } from "../../content/threeOclock.js";
import { MERCY, R } from "../../theme.js";
import { backLink, secondaryButton } from "../../styles/buttons.js";
import { card, cardTitle, eyebrow, secondary, prayerText, noteBlock } from "../../styles/text.js";

export default function ThreeOClockView() {
  const [showChaplet, setShowChaplet] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => goBack("/prayers")} style={backLink}><ChevIco dir="left" /> Back to Prayers</button>
      <div style={{ background: MERCY.bg, border: `1px solid ${MERCY.border}`, borderRadius: R.lg, padding: 22, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", border: `1px solid ${MERCY.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><ClockIco color={MERCY.accent} /></div>
          <div>
            <h1 style={{ ...cardTitle, fontSize: 19, color: MERCY.text, margin: 0 }}>{THREE_OCLOCK_PRAYER.title}</h1>
            <div style={{ ...eyebrow, color: MERCY.accent }}>{THREE_OCLOCK_PRAYER.subtitle}</div>
          </div>
        </div>
        <div style={{ ...eyebrow, color: MERCY.accent, marginBottom: 6 }}>Jesus to Saint Faustina</div>
        <p style={{ ...prayerText, color: MERCY.text, fontStyle: "italic", margin: 0 }}>{THREE_OCLOCK_PRAYER.instruction}</p>
      </div>

      <div style={{ ...card, marginBottom: 12 }}>
        <div style={{ ...eyebrow, marginBottom: 10 }}>Prayer for the Hour of Mercy</div>
        <div style={prayerText}>{THREE_OCLOCK_PRAYER.shortPrayer}</div>
      </div>

      <button type="button" aria-expanded={showChaplet} onClick={() => setShowChaplet(!showChaplet)} style={{ ...secondaryButton, minHeight: 48, marginBottom: 12 }}>{showChaplet ? "Hide the Chaplet" : "Pray the Divine Mercy Chaplet"}</button>
      {showChaplet && (
        <div style={{ ...card, marginBottom: 12 }}>
          <div style={{ ...eyebrow, marginBottom: 10 }}>Divine Mercy Chaplet</div>
          <div style={prayerText}>{THREE_OCLOCK_PRAYER.chaplet}</div>
        </div>
      )}

      <div style={noteBlock}>
        <div style={{ ...eyebrow, marginBottom: 6 }}>Catechism of the Catholic Church</div>
        <p style={secondary}>{THREE_OCLOCK_PRAYER.ccc}</p>
      </div>
    </div>
  );
}
