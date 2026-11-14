import { useState } from "react";
import { HeartIco } from "../components/Icons.jsx";
import Pill from "../components/Pill.jsx";
import VerseCard from "../components/VerseCard.jsx";
import { CATEGORIES } from "../content/categories.js";
import { VERSES, DAILY_VERSES } from "../verses.js";
import { BORDER, DANGER, FONT_UI } from "../theme.js";
import { chip, segment, segmentGroup } from "../styles/buttons.js";
import { card, cardTitle, scripture, verseRef, body, secondary, screenWrap, screenHeader, screenTitle, screenSub } from "../styles/text.js";

export default function ExploreTab({ favorites, onFav }) {
  const [view, setView] = useState("browse");
  const [selectedCat, setSelectedCat] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const filtered = selectedCat ? VERSES.filter((v) => v.category.includes(selectedCat)) : VERSES;
  // Library favourites are saved by id, daily-verse favourites by reference.
  const favVerses = VERSES.filter((v) => favorites.has(v.id));
  const favDailyVerses = DAILY_VERSES.filter((v) => favorites.has(v.ref)).map((v) => ({ ...v, id: v.ref, category: v.category || [] }));
  const allFavVerses = [...favVerses, ...favDailyVerses];
  const toggle = (id) => setExpandedId(expandedId === id ? null : id);
  const tabs = [{ id: "browse", label: "Browse" }, { id: "favorites", label: `Saved${allFavVerses.length ? ` (${allFavVerses.length})` : ""}` }];

  return (
    <div style={screenWrap}>
      <div style={screenHeader}>
        <h1 style={{ ...screenTitle, margin: "0 0 4px" }}>{view === "browse" ? "Verse Library" : "Saved Verses"}</h1>
        <div style={screenSub}>{view === "browse" ? "Browse by theme or feeling" : "Your personal collection"}</div>
      </div>

      <div style={{ ...segmentGroup, marginBottom: 18 }}>
        {tabs.map((t) => <button key={t.id} type="button" aria-pressed={view === t.id} onClick={() => { setView(t.id); setExpandedId(null); }} style={segment(view === t.id)}>{t.label}</button>)}
      </div>

      {view === "browse" && (
        <>
          <div role="group" aria-label="Themes" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
            <button type="button" aria-pressed={!selectedCat} onClick={() => setSelectedCat(null)} style={chip(!selectedCat)}>All</button>
            {CATEGORIES.map((c) => {
              const on = selectedCat === c.id;
              return <button key={c.id} type="button" aria-pressed={on} onClick={() => setSelectedCat(on ? null : c.id)} style={chip(on)}>{c.label}</button>;
            })}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((v) => <VerseCard key={v.id} verse={v} expanded={expandedId === v.id} onToggle={() => toggle(v.id)} isFav={favorites.has(v.id)} onFav={onFav} />)}
          </div>
        </>
      )}

      {view === "favorites" && (allFavVerses.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 20px" }}>
          <div style={{ marginBottom: 14, display: "flex", justifyContent: "center" }}><HeartIco /></div>
          <div style={{ ...cardTitle, marginBottom: 8 }}>No saved verses yet</div>
          <p style={secondary}>Tap the heart on any verse to save it here.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {allFavVerses.map((v) => (
            <div key={v.id} style={{ ...card, padding: 0, overflow: "hidden" }}>
              <div onClick={() => toggle(v.id)} style={{ padding: "18px 18px 14px", cursor: "pointer" }}>
                <div style={{ ...scripture(19), marginBottom: 10 }}>“{v.text}”</div>
                <div style={verseRef}>{v.ref}</div>
              </div>
              {expandedId === v.id && (
                <div style={{ padding: "0 18px 14px" }}>
                  <p style={{ ...body, marginBottom: 12 }}>{v.explanation}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{v.category.map((c) => <Pill key={c} label={c} />)}</div>
                </div>
              )}
              <div style={{ borderTop: `1px solid ${BORDER}`, padding: "8px 16px", display: "flex", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => onFav(v.id)} style={{ minHeight: 44, padding: "0 14px", background: "none", border: "none", color: DANGER, fontFamily: FONT_UI, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
