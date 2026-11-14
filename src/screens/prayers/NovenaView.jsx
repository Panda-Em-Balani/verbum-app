import { useState } from "react";
import { ChevIco } from "../../components/Icons.jsx";
import { NOVENAS } from "../../content/novenas.js";
import { useProgress, toggleNovenaDay } from "../../progress.js";
import { GOLD, GOLD_TEXT, ON_GOLD, CARD, BORDER, MUTED, SUCCESS, SUCCESS_BG, FONT_DISPLAY, R, CARD_SHADOW } from "../../theme.js";
import { backLink, secondaryButton } from "../../styles/buttons.js";
import { card, cardTitle, eyebrow, body, secondary, prayerText, screenTitle } from "../../styles/text.js";

const stepButton = (disabled) => ({ ...secondaryButton, flex: 1, width: "auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.4 : 1 });

export default function NovenaView({ onBack }) {
  const [selected, setSelected] = useState(null);
  const [currentDay, setCurrentDay] = useState(0);
  const prayedDays = useProgress().novena;

  if (selected) {
    const novena = NOVENAS.find((n) => n.id === selected);
    const day = novena.days[currentDay];
    const hasCompleted = prayedDays.has(`${selected}-${currentDay}`);
    return (
      <div>
        <button type="button" onClick={() => setSelected(null)} style={backLink}><ChevIco dir="left" /> Back to Novenas</button>
        <div style={{ background: novena.color, border: `1px solid ${novena.border}`, borderRadius: R.md, padding: 20, marginBottom: 14 }}>
          <div style={{ ...eyebrow, color: novena.accent || GOLD_TEXT, marginBottom: 6 }}>Novena</div>
          <h1 style={{ ...cardTitle, fontSize: 19, margin: "0 0 2px" }}>{novena.title}</h1>
          <div style={{ ...secondary, color: novena.accent || GOLD_TEXT, marginBottom: 10 }}>{novena.subtitle}</div>
          <p style={body}>{novena.description}</p>
        </div>

        <div role="group" aria-label="Days" style={{ display: "grid", gridTemplateColumns: "repeat(9,1fr)", marginBottom: 14 }}>
          {novena.days.map((_, i) => {
            const done = prayedDays.has(`${selected}-${i}`);
            const active = currentDay === i;
            return (
              <button key={i} type="button" aria-label={`Day ${i + 1}${done ? ", prayed" : ""}`} aria-current={active ? "step" : undefined} onClick={() => setCurrentDay(i)} style={{ height: 44, padding: 0, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ width: 34, height: 34, borderRadius: "50%", background: active ? GOLD : done ? SUCCESS_BG : CARD, border: `1.5px solid ${active ? GOLD : done ? SUCCESS : BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", color: active ? ON_GOLD : done ? SUCCESS : MUTED, fontSize: 14, fontFamily: FONT_DISPLAY, fontWeight: 700 }}>{done && !active ? "✓" : i + 1}</span>
              </button>
            );
          })}
        </div>

        <div style={{ ...card, marginBottom: 12 }}>
          <div style={{ ...eyebrow, marginBottom: 6 }}>Day {currentDay + 1} · Intention</div>
          <div style={{ ...cardTitle, marginBottom: 16 }}>{day.intention}</div>
          <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 16 }}>
            <div style={{ ...eyebrow, marginBottom: 8 }}>Prayer</div>
            <div style={prayerText}>{day.prayer}</div>
          </div>
        </div>

        <button type="button" aria-pressed={hasCompleted} onClick={() => toggleNovenaDay(`${selected}-${currentDay}`)} style={{ ...secondaryButton, minHeight: 48, marginBottom: 10, background: hasCompleted ? SUCCESS_BG : "none", borderColor: hasCompleted ? SUCCESS : GOLD, color: hasCompleted ? SUCCESS : GOLD_TEXT }}>{hasCompleted ? `✓ Day ${currentDay + 1} prayed` : `Mark day ${currentDay + 1} as prayed`}</button>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={() => setCurrentDay(currentDay - 1)} disabled={currentDay === 0} style={stepButton(currentDay === 0)}><ChevIco dir="left" />Previous</button>
          <button type="button" onClick={() => setCurrentDay(currentDay + 1)} disabled={currentDay === 8} style={stepButton(currentDay === 8)}>Next day<ChevIco /></button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button type="button" onClick={onBack} style={backLink}><ChevIco dir="left" /> Back to Prayers</button>
      <h1 style={{ ...screenTitle, margin: "0 0 4px" }}>Novenas</h1>
      <p style={{ ...secondary, marginBottom: 18 }}>A novena is nine days of prayer offered for a particular intention. Select one to begin.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {NOVENAS.map((n) => {
          const count = n.days.filter((_, i) => prayedDays.has(`${n.id}-${i}`)).length;
          return (
            <button key={n.id} type="button" onClick={() => { setSelected(n.id); setCurrentDay(0); }} style={{ background: n.color, border: `1px solid ${n.border}`, borderRadius: R.md, padding: 18, cursor: "pointer", textAlign: "left", width: "100%", boxShadow: CARD_SHADOW }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ ...cardTitle, marginBottom: 2 }}>{n.title}</div>
                  <div style={{ ...secondary, fontSize: 14, color: n.accent || GOLD_TEXT, marginBottom: 8 }}>{n.subtitle}</div>
                  <p style={{ ...secondary, fontSize: 14, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{n.description}</p>
                </div>
                <ChevIco />
              </div>
              <div aria-label={`${count} of 9 days prayed`} role="img" style={{ marginTop: 12, display: "flex", gap: 5 }}>
                {Array.from({ length: 9 }, (_, i) => <div key={i} style={{ width: 18, height: 4, borderRadius: 2, background: prayedDays.has(`${n.id}-${i}`) ? SUCCESS : BORDER }} />)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
