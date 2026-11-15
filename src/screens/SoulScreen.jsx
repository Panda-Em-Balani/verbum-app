import { useState } from "react";
import VerseCard from "../components/VerseCard.jsx";
import { CATEGORIES } from "../content/categories.js";
import { LIBRARY, favoriteKey } from "../verses.js";
import { chip } from "../styles/buttons.js";
import { goldCard, eyebrow, body, prayerText, noteBlock, screenWrap, screenHeader, screenTitle, screenSub } from "../styles/text.js";

export default function SoulCheckTab({ favorites, onFav }) {
  const [feeling, setFeeling] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const matched = feeling ? LIBRARY.filter((v) => v.category.includes(feeling)).slice(0, 6) : [];
  const feelingLabel = feeling ? (CATEGORIES.find((c) => c.id === feeling)?.label || feeling) : "";
  return (
    <div style={screenWrap}>
      <div style={screenHeader}>
        <h1 style={{ ...screenTitle, margin: "0 0 4px" }}>Soul Check</h1>
        <div style={screenSub}>How is your soul today?</div>
      </div>

      <div style={{ ...goldCard, marginBottom: 16 }}>
        <div style={{ ...eyebrow, marginBottom: 8 }}>A Moment of Honesty</div>
        <p style={body}>Pause for a moment. Name what you are carrying, and let God's Word meet you there. Choose the word that best describes your heart right now.</p>
      </div>

      <div role="group" aria-label="How are you feeling?" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {CATEGORIES.map((c) => {
          const on = feeling === c.id;
          return <button key={c.id} type="button" aria-pressed={on} onClick={() => { setFeeling(on ? null : c.id); setExpandedId(null); }} style={chip(on)}>{c.label}</button>;
        })}
      </div>

      {feeling && (
        <>
          <div style={{ ...eyebrow, fontSize: 13, marginBottom: 12 }}>The Word for {feelingLabel}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            {matched.map((v) => (
              <VerseCard key={v.id} verse={v} expanded={expandedId === v.id} onToggle={() => setExpandedId(expandedId === v.id ? null : v.id)} isFav={favorites.has(favoriteKey(v, favorites))} onFav={() => onFav(favoriteKey(v, favorites))} />
            ))}
          </div>
          <div style={noteBlock}>
            <div style={{ ...eyebrow, marginBottom: 6 }}>A Closing Prayer</div>
            <p style={{ ...prayerText, margin: 0, fontStyle: "italic" }}>Lord, You know my heart better than I know it myself. Take what I am feeling today and draw me closer to You through it. Amen.</p>
          </div>
        </>
      )}
    </div>
  );
}
