import VerseShareButton from "../VerseShareButton.jsx";
import Collapse from "./Collapse.jsx";
import { HeartIco } from "./Icons.jsx";
import Pill from "./Pill.jsx";
import { GOLD_DEEP, BORDER, MUTED, CARD_SHADOW_STRONG } from "../theme.js";
import { cardHeaderButton } from "../styles/cardButton.js";
import { card, scripture, verseRef, body, secondary, eyebrow, noteBlock } from "../styles/text.js";

// A verse that opens to show its reflection. The verse itself is the button that opens it;
// the heart is a separate button beside it.
export default function VerseCard({ verse, expanded, onToggle, isFav, onFav }) {
  return (
    <div style={{ ...card, position: "relative", transition: "border-color 0.2s, box-shadow 0.2s", ...(expanded ? { borderColor: GOLD_DEEP, boxShadow: CARD_SHADOW_STRONG } : null) }}>
      <button type="button" aria-expanded={expanded} onClick={onToggle} style={{ ...cardHeaderButton, paddingRight: 40 }}>
        <span style={{ ...scripture(19), display: "block", marginBottom: 10 }}>“{verse.text}”</span>
        <span style={{ ...verseRef, display: "block" }}>{verse.displayRef || verse.ref}</span>
        <span aria-hidden="true" style={{ position: "absolute", top: 20, right: 20, width: 20, textAlign: "center", fontSize: 18, lineHeight: 1, color: MUTED }}>{expanded ? "−" : "+"}</span>
      </button>
      <button onClick={() => onFav(verse.id)} type="button" aria-pressed={isFav} aria-label={isFav ? "Remove verse from saved" : "Save verse"} style={{ position: "absolute", top: 40, right: 8, background: "none", border: "none", padding: 0, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><HeartIco filled={isFav} /></button>
      <Collapse open={expanded}>
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
          <p style={{ ...body, marginBottom: 14 }}>{verse.explanation}</p>
          {verse.example && (
            <div style={{ ...noteBlock, marginBottom: 12 }}>
              <div style={{ ...eyebrow, marginBottom: 6 }}>In Practice</div>
              <p style={secondary}>{verse.example}</p>
            </div>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{verse.category.map((c) => <Pill key={c} label={c} />)}</div>
          <div style={{ marginTop: 14 }}><VerseShareButton text={verse.text} verseRef={verse.ref} label={verse.displayRef} source="verse" /></div>
        </div>
      </Collapse>
    </div>
  );
}
