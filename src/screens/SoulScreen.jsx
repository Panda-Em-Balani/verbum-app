import { useState } from "react";
import { LockIco } from "../components/Icons.jsx";
import VerseCard from "../components/VerseCard.jsx";
import { CATEGORIES } from "../content/categories.js";
import { VERSES } from "../verses.js";
import { SURFACE, CARD, BORDER, TEXT, TEXT_BODY, MUTED, GOLD, GOLD_TEXT, FONT_DISPLAY, FONT_UI, R, CARD_SHADOW } from "../theme.js";

export default function SoulCheckTab({ favorites, onFav }) {
  const [feeling, setFeeling] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const matched = feeling ? VERSES.filter(v => v.category.includes(feeling)).slice(0, 4) : [];
  const feelingLabel = feeling ? (CATEGORIES.find(c => c.id === feeling)?.label || feeling) : "";
  return (
    <div style={{ padding: "0 20px 20px" }}>
      <div style={{ padding: "24px 0 16px", marginTop: "calc(56px + env(safe-area-inset-top))" }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: TEXT, marginBottom: 4, letterSpacing: "0.07em", fontWeight: 600 }}>Soul Check</div>
        <div style={{ fontSize: 15, color: MUTED, fontFamily:FONT_UI, fontWeight: 500 }}>How is your soul today?</div>
      </div>

      <div style={{ background: "linear-gradient(135deg,#FFFCF5,#FFF3D6)", border: `1px solid ${GOLD}50`, borderRadius: R.md, padding: 20, marginBottom: 16, boxShadow: CARD_SHADOW }}>
        <div style={{ fontSize: 12, color: GOLD_TEXT, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: FONT_DISPLAY, fontWeight: 700, marginBottom: 10 }}>A Moment of Honesty</div>
        <p style={{ fontSize: 14, color: TEXT_BODY, lineHeight: 1.85, fontFamily:FONT_UI, fontWeight: 500 }}>
          Pause for a moment. Name what you are carrying, and let God's Word meet you there. Choose the word that best describes your heart right now.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {CATEGORIES.map(c => {
          const on = feeling === c.id;
          return (
            <button key={c.id} onClick={() => { setFeeling(on ? null : c.id); setExpandedId(null); }} style={{ background: on ? GOLD : CARD, border: `1px solid ${on ? GOLD : BORDER}`, borderRadius: R.lg, padding: "12px 16px", color: on ? "#FFFFFF" : MUTED, fontSize: 14, cursor: "pointer", fontFamily:FONT_UI, fontWeight: on ? 700 : 500, boxShadow: on ? CARD_SHADOW : "none", transition: "all 0.2s" }}>
              {c.sym ? `${c.sym} ` : ""}{c.label}
            </button>
          );
        })}
      </div>

      {feeling && (
        <>
          <div style={{ fontSize: 13, color: GOLD_TEXT, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: FONT_DISPLAY, fontWeight: 700, marginBottom: 12 }}>The Word for {feelingLabel}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            {matched.map(v => (
              <VerseCard key={v.id} verse={v} expanded={expandedId === v.id} onToggle={() => setExpandedId(expandedId === v.id ? null : v.id)} isFav={favorites.has(v.id)} onFav={onFav} />
            ))}
          </div>
          <div style={{ background: SURFACE, borderLeft: `3px solid ${GOLD}`, borderRadius: "0 12px 12px 0", padding: "13px 16px", marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: GOLD_TEXT, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: FONT_DISPLAY, marginBottom: 6, fontWeight: 700 }}>A Closing Prayer</div>
            <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.85, fontFamily:FONT_UI, fontWeight: 500, fontStyle: "italic" }}>
              Lord, You know my heart better than I know it myself. Take what I am feeling today and draw me closer to You through it. Amen.
            </p>
          </div>
        </>
      )}

      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: R.md, padding: 18, boxShadow: CARD_SHADOW }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <LockIco />
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 14, color: TEXT, fontWeight: 600, letterSpacing: "0.06em" }}>Guided Soul Check</div>
        </div>
        <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.78, fontFamily:FONT_UI, fontWeight: 500 }}>
          A personal, guided conversation about your spiritual life is coming with Verbum Premium.
        </p>
      </div>
    </div>
  );
}
