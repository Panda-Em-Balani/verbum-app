import { useState, useEffect } from "react";
import ShareButton from "../../ShareButton.jsx";
import { Cross } from "../../components/Icons.jsx";
import Pill from "../../components/Pill.jsx";
import { SURFACE, BORDER, TEXT, FONT_SCRIPTURE, R, CARD_SHADOW_STRONG } from "../../theme.js";
import { card, cardTitle, eyebrow, body, secondary, noteBlock } from "../../styles/text.js";

export default function SaintOfDayCard({ saint }) {
  const [fetched, setFetched] = useState({ title: null, url: null });
  const [photoLoaded, setPhotoLoaded] = useState(false);
  const cacheKey = saint.wikiTitle ? `verbum-saint-photo-${saint.wikiTitle}` : null;
  const cachedUrl = cacheKey ? sessionStorage.getItem(cacheKey) : null;
  const photoUrl = cachedUrl || (fetched.title === saint.wikiTitle ? fetched.url : null);

  useEffect(() => {
    if (!saint.wikiTitle || cachedUrl) return;
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(saint.wikiTitle)}`)
      .then((r) => r.json())
      .then((data) => {
        const url = data.thumbnail?.source || null;
        if (url) {
          sessionStorage.setItem(cacheKey, url);
          setFetched({ title: saint.wikiTitle, url });
        }
      })
      .catch(() => {});
  }, [saint.wikiTitle, cachedUrl, cacheKey]);

  const feastDate = new Date(2024, saint.feast.m - 1, saint.feast.d).toLocaleDateString("en-US", { month: "long", day: "numeric" });

  return (
    <div style={{ ...card, marginBottom: 16, boxShadow: CARD_SHADOW_STRONG }}>
      <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
        <div style={{ width: 80, height: 80, borderRadius: R.sm, overflow: "hidden", flexShrink: 0, background: SURFACE, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {photoUrl ? (
            <img src={photoUrl} alt={saint.name} onLoad={() => setPhotoLoaded(true)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", opacity: photoLoaded ? 1 : 0, transition: "opacity 0.3s" }} />
          ) : (
            <Cross size={28} />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...eyebrow, marginBottom: 4 }}>Saint of the Day</div>
          <div style={{ ...cardTitle, fontWeight: 700, marginBottom: 4 }}>{saint.name}</div>
          <div style={{ ...secondary, fontSize: 14 }}>Feast Day: {feastDate}</div>
        </div>
      </div>

      {saint.patron && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ ...eyebrow, marginBottom: 6 }}>Patron of</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{saint.patron.map((p) => <Pill key={p} label={p} />)}</div>
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>{saint.themes.map((t) => <Pill key={t} label={t} />)}</div>

      <p style={{ ...body, marginBottom: 16 }}>{saint.bio}</p>

      <div style={noteBlock}>
        <div style={{ fontFamily: FONT_SCRIPTURE, fontStyle: "italic", fontWeight: 500, fontSize: 18, lineHeight: 1.5, color: TEXT }}>“{saint.quote}”</div>
      </div>
      <div style={{ marginTop: 14 }}><ShareButton text={saint.quote} verseRef={saint.name} source="saint" /></div>
    </div>
  );
}
