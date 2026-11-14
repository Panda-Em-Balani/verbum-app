import { HomeIco, ChatIco, BookIco, PrayIco, MassIco } from "./Icons.jsx";
import { BORDER, MUTED, GOLD_TEXT, NAV_SHADOW } from "../theme.js";

const TABS = [
  { id: "home",    label: "Home",    I: HomeIco },
  { id: "soul",    label: "Soul",    I: ChatIco },
  { id: "explore", label: "Explore", I: BookIco },
  { id: "prayers", label: "Prayers", I: PrayIco },
  { id: "mass",    label: "Mass",    I: MassIco },
]

export default function BottomNav({ tab, onChange, hasNewFavorites }) {
  return (
    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(14px)", borderTop: `1px solid ${BORDER}`, display: "flex", padding: "8px 0 calc(8px + env(safe-area-inset-bottom))", boxShadow: NAV_SHADOW, zIndex: 150 }}>
      {TABS.map(({ id, label, I }) => (
        <button key={id} onClick={() => onChange(id)} aria-current={tab === id ? "page" : undefined} style={{ flex: 1, minHeight: 48, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, padding: "4px 0", position: "relative" }}>
          {id === "explore" && hasNewFavorites && (
            <div role="status" aria-label="New saved verse" style={{ position: "absolute", top: 2, right: "calc(50% - 14px)", width: 9, height: 9, borderRadius: "50%", background: "#E53E3E" }} />
          )}
          <I on={tab === id} />
          <span style={{ fontSize: 11, color: tab === id ? GOLD_TEXT : MUTED, letterSpacing: "0.04em", fontWeight: tab === id ? 700 : 500 }}>{label}</span>
        </button>
      ))}
    </div>
  );
}
