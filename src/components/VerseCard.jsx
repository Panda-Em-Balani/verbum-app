import VerseShareButton from "../VerseShareButton.jsx";
import { HeartIco } from "./Icons.jsx";
import Pill from "./Pill.jsx";
import { GOLD_DEEP, BORDER, MUTED, CARD_SHADOW_STRONG } from "../theme.js";
import { card, scripture, verseRef, body, secondary, eyebrow, noteBlock } from "../styles/text.js";

export default function VerseCard({ verse, expanded, onToggle, isFav, onFav }) {
  return (
    <div onClick={onToggle} style={{ ...card, cursor: "pointer", transition: "border-color 0.2s, box-shadow 0.2s", ...(expanded ? { borderColor: GOLD_DEEP, boxShadow: CARD_SHADOW_STRONG } : null) }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...scripture(19), marginBottom: 10 }}>“{verse.text}”</div>
          <div style={verseRef}>{verse.ref}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span aria-hidden="true" style={{ fontSize: 18, lineHeight: 1, color: MUTED }}>{expanded ? "−" : "+"}</span>
          <button onClick={(e) => { e.stopPropagation(); onFav(verse.id); }} type="button" aria-pressed={isFav} aria-label={isFav ? "Remove verse from saved" : "Save verse"} style={{ background: "none", border: "none", padding: 0, margin: -12, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><HeartIco filled={isFav} /></button>
        </div>
      </div>
      {expanded && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
          <p style={{ ...body, marginBottom: 14 }}>{verse.explanation}</p>
          {verse.example && (
            <div style={{ ...noteBlock, marginBottom: 12 }}>
              <div style={{ ...eyebrow, marginBottom: 6 }}>In Practice</div>
              <p style={secondary}>{verse.example}</p>
            </div>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{verse.category.map((c) => <Pill key={c} label={c} />)}</div>
          <div style={{ marginTop: 14 }}><VerseShareButton text={verse.text} verseRef={verse.ref} source="verse" /></div>
        </div>
      )}
    </div>
  );
}
