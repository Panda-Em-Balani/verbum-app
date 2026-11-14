import { useState, useEffect } from "react";
import ShareButton from "../../ShareButton.jsx";
import { Cross } from "../../components/Icons.jsx";
import Pill from "../../components/Pill.jsx";
import { SURFACE, CARD, BORDER, TEXT, TEXT_BODY, MUTED, GOLD, GOLD_TEXT, FONT_DISPLAY, FONT_UI, R, CARD_SHADOW_STRONG } from "../../theme.js";

export default function SaintOfDayCard({ saint }) {
  const [fetched, setFetched] = useState({ title: null, url: null });
  const [photoLoaded, setPhotoLoaded] = useState(false);
  const cacheKey = saint.wikiTitle ? `verbum-saint-photo-${saint.wikiTitle}` : null;
  const cachedUrl = cacheKey ? sessionStorage.getItem(cacheKey) : null;
  const photoUrl = cachedUrl || (fetched.title === saint.wikiTitle ? fetched.url : null);

  useEffect(() => {
    if (!saint.wikiTitle || cachedUrl) return;
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(saint.wikiTitle)}`)
      .then(r => r.json())
      .then(data => {
        const url = data.thumbnail?.source || null;
        if (url) {
          sessionStorage.setItem(cacheKey, url);
          setFetched({ title: saint.wikiTitle, url });
        }
      })
      .catch(() => {});
  }, [saint.wikiTitle, cachedUrl, cacheKey]);

  const feastDate = new Date(2024, saint.feast.m - 1, saint.feast.d)
    .toLocaleDateString("en-US", { month: "long", day: "numeric" });

  return (
    <div style={{ background: CARD, border: `1.5px solid ${BORDER}`, borderRadius: R.md, padding: 20, marginBottom: 16, boxShadow: CARD_SHADOW_STRONG, overflow: "hidden" }}>
      {/* Header row with photo */}
      <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
        {/* Photo */}
        <div style={{ width: 80, height: 80, borderRadius: R.sm, overflow: "hidden", flexShrink: 0, background: `linear-gradient(135deg,${GOLD}20,${GOLD}08)`, border: `1.5px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={saint.name}
              onLoad={() => setPhotoLoaded(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", opacity: photoLoaded ? 1 : 0, transition: "opacity 0.3s" }}
            />
          ) : (
            <Cross size={28} />
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, color: GOLD_TEXT, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 4, fontFamily: FONT_DISPLAY }}>Saint of the Day</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, color: TEXT, fontWeight: 700, letterSpacing: "0.04em", marginBottom: 4, lineHeight: 1.3 }}>{saint.name}</div>
          <div style={{ fontSize: 13, color: MUTED, fontFamily:FONT_UI, fontWeight: 500 }}>Feast Day: {feastDate}</div>
        </div>
      </div>

      {/* Patron */}
      {saint.patron && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: GOLD_TEXT, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6, fontFamily: FONT_DISPLAY }}>Patron of</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {saint.patron.map(p => <Pill key={p} label={p} />)}
          </div>
        </div>
      )}

      {/* Themes */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
        {saint.themes.map(t => <Pill key={t} label={t} />)}
      </div>

      {/* Bio */}
      <p style={{ fontSize: 15, color: TEXT_BODY, lineHeight: 1.75, marginBottom: 16, fontFamily:FONT_UI, fontWeight: 500 }}>{saint.bio}</p>

      {/* Quote */}
      <div style={{ borderLeft: `3px solid ${GOLD}`, padding: "11px 14px", background: SURFACE, borderRadius: "0 12px 12px 0" }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, color: TEXT, lineHeight: 1.7, fontWeight: 500 }}>"{saint.quote}"</div>
      </div>
      <div style={{ marginTop: 14 }}><ShareButton text={saint.quote} verseRef={saint.name} source="saint" /></div>
    </div>
  );
}
