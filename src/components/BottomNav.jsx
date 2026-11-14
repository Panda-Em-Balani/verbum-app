import { navigate } from "../router.js";
import { HomeIco, ChatIco, BookIco, PrayIco, MassIco } from "./Icons.jsx";
import { GOLD_TEXT, BORDER, MUTED, DANGER, NAV_SHADOW, FONT_UI } from "../theme.js";

const TABS = [
  { id: "home", path: "/", label: "Home", I: HomeIco },
  { id: "soul", path: "/soul", label: "Soul", I: ChatIco },
  { id: "explore", path: "/explore", label: "Explore", I: BookIco },
  { id: "prayers", path: "/prayers", label: "Prayers", I: PrayIco },
  { id: "mass", path: "/mass", label: "Mass", I: MassIco },
];

// Tapping the tab you are on returns to its first screen, or scrolls it to the top.
export default function BottomNav({ tab, hasNewFavorites }) {
  return (
    <nav aria-label="Main" style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "rgba(255,253,248,0.95)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderTop: `1px solid ${BORDER}`, display: "flex", padding: "8px 0 calc(8px + env(safe-area-inset-bottom))", boxShadow: NAV_SHADOW, zIndex: 150 }}>
      {TABS.map(({ id, path, label, I }) => (
        <button key={id} type="button" onClick={() => navigate(path)} aria-current={tab === id ? "page" : undefined} style={{ flex: 1, minHeight: 48, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, padding: "4px 0", position: "relative" }}>
          {id === "explore" && hasNewFavorites && (
            <div role="status" aria-label="New saved verse" style={{ position: "absolute", top: 2, right: "calc(50% - 14px)", width: 9, height: 9, borderRadius: "50%", background: DANGER }} />
          )}
          <I on={tab === id} />
          <span style={{ fontFamily: FONT_UI, fontSize: 11, color: tab === id ? GOLD_TEXT : MUTED, letterSpacing: "0.04em", fontWeight: tab === id ? 700 : 400 }}>{label}</span>
        </button>
      ))}
    </nav>
  );
}
