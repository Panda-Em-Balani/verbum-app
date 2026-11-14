import { useState } from "react";
import VerseShareButton from "../../VerseShareButton.jsx";
import { HeartIco } from "../../components/Icons.jsx";
import Pill from "../../components/Pill.jsx";
import { getDailyVerseStatic } from "../../dailyVerse.js";
import { GOLD, GOLD_TEXT, SURFACE, CARD, BORDER, CREAM, MUTED, WHITE, CINZEL, R, EMBOSS, CARD_SHADOW, CARD_SHADOW_STRONG } from "../../theme.js";

export default function DailyVerseCard({ onFav, favorites }) {
  const verse = getDailyVerseStatic();
  const [expanded, setExpanded] = useState(false);
  const isFav = favorites.has(verse.ref);

  return (
    <div style={{ marginBottom: 16 }}>
      <div onClick={() => setExpanded(!expanded)} style={{ background: 'linear-gradient(135deg,#FFFCF5,#FFF3D6)', border: `1px solid ${GOLD}60`, borderRadius: R.lg, padding: 24, position: 'relative', overflow: 'hidden', boxShadow: CARD_SHADOW_STRONG, cursor: 'pointer', transition: 'box-shadow 0.2s' }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(218,165,32,0.08)' }} />
        <button type="button" aria-pressed={isFav} aria-label={isFav ? "Remove verse from saved" : "Save verse"} onClick={(e) => { e.stopPropagation(); onFav(verse.ref); }} style={{ position: 'absolute', top: 5, right: 5, zIndex: 2, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
          <HeartIco filled={isFav} />
        </button>
        <div style={{ fontSize: 13, color: GOLD_TEXT, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 14, fontFamily: CINZEL }}>Daily Verse</div>
        <div style={{ fontFamily: CINZEL, fontSize: 18, color: WHITE, lineHeight: 1.7, marginBottom: 16, letterSpacing: '0.04em', fontWeight: 600, textShadow: EMBOSS, paddingRight: 28 }}>"{verse.text}"</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: CINZEL, fontSize: 14, color: GOLD_TEXT, fontWeight: 700, letterSpacing: '0.16em' }}>— {verse.ref}</div>
          <button type="button" aria-expanded={expanded} onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }} style={{ background: 'none', border: 'none', padding: '12px 0 12px 12px', minHeight: 44, fontSize: 13, color: MUTED, fontFamily: "'Lato',sans-serif", cursor: 'pointer' }}>{expanded ? 'Tap to close' : 'Tap to reflect'}</button>
        </div>
        <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}><VerseShareButton text={verse.text} verseRef={verse.ref} source="daily-verse" /></div>
      </div>
      {expanded && (
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: R.md, padding: 22, marginTop: 8, boxShadow: CARD_SHADOW }}>
          <p style={{ fontSize: 15, color: CREAM, lineHeight: 1.95, marginBottom: 16, fontFamily: "'Lato',sans-serif", fontWeight: 500 }}>{verse.explanation}</p>
          {verse.example && (
            <div style={{ background: SURFACE, borderLeft: `3px solid ${GOLD}`, borderRadius: '0 12px 12px 0', padding: '13px 16px' }}>
              <div style={{ fontSize: 13, color: GOLD_TEXT, fontWeight: 800, letterSpacing: '0.14em', marginBottom: 7, textTransform: 'uppercase', fontFamily: CINZEL }}>In Practice</div>
              <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.85, fontFamily: "'Lato',sans-serif", fontWeight: 500 }}>{verse.example}</p>
            </div>
          )}
          {verse.category && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>{verse.category.map(c => <Pill key={c} label={c} />)}</div>}
        </div>
      )}

    </div>
  );
}
