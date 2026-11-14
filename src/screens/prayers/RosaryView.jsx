import { useState, useEffect, useRef } from "react";
import { ChevIco } from "../../components/Icons.jsx";
import { ROSARY } from "../../content/rosary.js";
import { saveRosary, getSnapshot } from "../../progress.js";
import { GOLD, GOLD_DEEP, GOLD_TEXT, ON_GOLD, SURFACE, CARD, BORDER, TEXT, MUTED, SUCCESS, SUCCESS_BG, FONT_DISPLAY, FONT_UI, R } from "../../theme.js";
import { secondaryButton } from "../../styles/buttons.js";
import { card, cardTitle, eyebrow, verseRef, body, prayerText, secondary } from "../../styles/text.js";

const MYSTERY_TYPES = ["Joyful", "Sorrowful", "Glorious", "Luminous"];
const stepButton = (disabled) => ({ ...secondaryButton, flex: 1, width: "auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.4 : 1 });

// The rosary guide: mystery picker, decade meditation and bead counter.
export default function RosaryView() {
  const [saved] = useState(() => getSnapshot().rosary);
  const [mysteryType, setMysteryType] = useState(saved?.mystery || "Joyful");
  const [decade, setDecade] = useState(saved?.decade || 0);
  const [beads, setBeads] = useState(saved?.beads || 0);

  // Remember the rosary in progress (cleared when finished or reset).
  const rosaryReady = useRef(false);
  const pending = useRef(null);
  useEffect(() => {
    if (!rosaryReady.current) { rosaryReady.current = true; return; }
    const done = decade === 4 && beads === 10;
    const fresh = decade === 0 && beads === 0;
    const value = done || fresh ? null : { mystery: mysteryType, decade, beads };
    pending.current = { value };
    const t = setTimeout(() => { pending.current = null; saveRosary(value); }, 700);
    return () => clearTimeout(t);
  }, [mysteryType, decade, beads]);
  // Leaving the screen before the delay ends still saves the latest position.
  useEffect(() => () => { if (pending.current) { saveRosary(pending.current.value); pending.current = null; } }, []);

  const myst = ROSARY[mysteryType];
  const curDecade = myst.decades[decade];
  const goTo = (i) => { setDecade(i); setBeads(0); };

  return (
    <>
      <div role="group" aria-label="Mysteries" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        {MYSTERY_TYPES.map((t) => {
          const m = ROSARY[t];
          const on = mysteryType === t;
          return (
            <button key={t} type="button" aria-pressed={on} onClick={() => { setMysteryType(t); goTo(0); }} style={{ background: on ? m.color : CARD, border: `1px solid ${on ? m.border : BORDER}`, borderRadius: R.sm, padding: "12px", minHeight: 56, cursor: "pointer", textAlign: "left" }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, color: on ? TEXT : MUTED, fontWeight: 600, letterSpacing: "0.05em", marginBottom: 2 }}>{t}</div>
              <div style={{ fontFamily: FONT_UI, fontSize: 13, color: MUTED }}>{m.day}</div>
            </button>
          );
        })}
      </div>

      <div style={{ background: myst.color, border: `1px solid ${myst.border}`, borderRadius: R.lg, padding: 22, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ ...eyebrow, color: MUTED }}>Decade {decade + 1} of 5</div>
          <div style={{ display: "flex" }}>
            {myst.decades.map((_, i) => (
              <button type="button" key={i} aria-label={`Decade ${i + 1}`} aria-current={i === decade ? "step" : undefined} onClick={() => goTo(i)} style={{ width: 24, height: 44, margin: "-12px 0", background: "none", border: "none", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: i === decade ? GOLD_DEEP : BORDER, display: "block" }} />
              </button>
            ))}
          </div>
        </div>
        <div style={{ ...cardTitle, fontSize: 19, marginBottom: 4 }}>{curDecade.name}</div>
        <div style={{ ...verseRef, marginBottom: 12 }}>{curDecade.ref}</div>
        <p style={body}>{curDecade.med}</p>
      </div>

      <div style={{ ...card, padding: 18, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ ...eyebrow, color: MUTED }}>Hail Mary</div>
          <div aria-live="polite" style={{ fontFamily: FONT_DISPLAY, fontSize: 15, color: beads === 10 ? GOLD_TEXT : MUTED, fontWeight: 600 }}>{beads}/10</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 44px)", justifyContent: "space-between", rowGap: 6 }}>
          {Array.from({ length: 10 }, (_, i) => (
            <button type="button" key={i} aria-label={`Hail Mary ${i + 1}`} aria-pressed={i < beads} onClick={() => setBeads(beads === i + 1 ? i : i + 1)} style={{ width: 44, height: 44, padding: 0, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ width: 34, height: 34, borderRadius: "50%", background: i < beads ? GOLD : SURFACE, border: `1.5px solid ${i < beads ? GOLD_DEEP : BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s, border-color 0.15s", fontSize: 13, color: i < beads ? ON_GOLD : MUTED, fontWeight: 700, fontFamily: FONT_DISPLAY }}>{i + 1}</span>
            </button>
          ))}
        </div>
        {beads === 10 && <div style={{ ...prayerText, fontStyle: "italic", textAlign: "center", marginTop: 14 }}>Glory be to the Father, and to the Son, and to the Holy Spirit.</div>}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button type="button" onClick={() => goTo(decade - 1)} disabled={decade === 0} style={stepButton(decade === 0)}><ChevIco dir="left" />Previous</button>
        <button type="button" onClick={() => goTo(decade + 1)} disabled={decade === 4} style={stepButton(decade === 4)}>Next decade<ChevIco /></button>
      </div>

      {decade === 4 && beads === 10 && (
        <div role="status" style={{ background: SUCCESS_BG, border: `1px solid ${SUCCESS}`, borderRadius: R.md, padding: 20, marginTop: 14, textAlign: "center" }}>
          <div style={{ ...cardTitle, marginBottom: 8 }}>Mysteries complete</div>
          <p style={{ ...secondary, color: SUCCESS }}>You have completed the {mysteryType} Mysteries. May Our Lady carry your intentions before the throne of God. Amen.</p>
        </div>
      )}
    </>
  );
}
