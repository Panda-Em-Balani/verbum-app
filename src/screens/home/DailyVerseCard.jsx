import { useState } from "react";
import VerseShareButton from "../../VerseShareButton.jsx";
import Collapse from "../../components/Collapse.jsx";
import { HeartIco } from "../../components/Icons.jsx";
import Pill from "../../components/Pill.jsx";
import { getDailyVerseStatic } from "../../dailyVerse.js";
import { MUTED, FONT_UI, R } from "../../theme.js";
import { card, goldCard, scripture, verseRef, eyebrow, body, secondary, noteBlock } from "../../styles/text.js";

export default function DailyVerseCard({ onFav, favorites }) {
  const verse = getDailyVerseStatic();
  const [expanded, setExpanded] = useState(false);
  const isFav = favorites.has(verse.ref);

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ ...goldCard, borderRadius: R.lg, padding: 24, position: "relative" }}>
        <button type="button" aria-pressed={isFav} aria-label={isFav ? "Remove verse from saved" : "Save verse"} onClick={() => onFav(verse.ref)} style={{ position: "absolute", top: 8, right: 8, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", padding: 0, cursor: "pointer" }}>
          <HeartIco filled={isFav} />
        </button>
        <div style={{ ...eyebrow, marginBottom: 12 }}>Daily Verse</div>
        <div style={{ ...scripture(21), marginBottom: 12, paddingRight: 24 }}>“{verse.text}”</div>
        <div style={{ ...verseRef, marginBottom: 14 }}>{verse.displayRef || verse.ref}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <VerseShareButton text={verse.text} verseRef={verse.ref} label={verse.displayRef} source="daily-verse" />
          <button type="button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)} style={{ background: "none", border: "none", padding: "0 0 0 12px", minHeight: 44, fontSize: 14, color: MUTED, fontFamily: FONT_UI, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>{expanded ? "Close reflection" : "Read reflection"}</button>
        </div>
      </div>
      <Collapse open={expanded}>
        <div style={{ ...card, padding: 22, marginTop: 8 }}>
          <p style={{ ...body, marginBottom: 16 }}>{verse.explanation}</p>
          {verse.example && (
            <div style={noteBlock}>
              <div style={{ ...eyebrow, marginBottom: 6 }}>In Practice</div>
              <p style={secondary}>{verse.example}</p>
            </div>
          )}
          {verse.category && <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>{verse.category.map((c) => <Pill key={c} label={c} />)}</div>}
        </div>
      </Collapse>
    </div>
  );
}
