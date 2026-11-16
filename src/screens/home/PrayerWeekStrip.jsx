import { computeStreak } from "../../streak.js";
import { localDateKey } from "../../utils/date.js";
import { GOLD, GOLD_DEEP, ON_GOLD, SURFACE, BORDER, MUTED, FONT_UI } from "../../theme.js";
import { card, eyebrow, secondary } from "../../styles/text.js";

const INITIALS = ["S", "M", "T", "W", "T", "F", "S"];
const NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const weekday = (dateKey) => { const [y, m, d] = dateKey.split("-").map(Number); return new Date(y, m - 1, d).getDay(); };

// The last seven days at a glance and the current streak. A day counts when the Rosary was
// completed, a novena day was marked, or the Three O'Clock prayers were prayed.
export default function PrayerWeekStrip({ prayerLog }) {
  const { current, last7 } = computeStreak(prayerLog.keys(), localDateKey(new Date()));
  return (
    <div style={{ ...card, padding: "16px 18px", marginBottom: 16 }}>
      <div style={{ ...eyebrow, marginBottom: 12 }}>Your prayer this week</div>
      <div role="list" style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        {last7.map(({ dateKey, prayed }, i) => {
          const day = weekday(dateKey);
          const isToday = i === 6;
          return (
            <div key={dateKey} role="listitem" aria-label={`${isToday ? "Today" : NAMES[day]}: ${prayed ? "prayed" : "no prayer logged"}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div aria-hidden="true" style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: prayed ? GOLD : SURFACE, border: `1.5px solid ${prayed ? GOLD_DEEP : isToday ? GOLD_DEEP : BORDER}`, color: ON_GOLD, fontSize: 15, fontWeight: 700 }}>{prayed ? "✓" : ""}</div>
              <div aria-hidden="true" style={{ fontFamily: FONT_UI, fontSize: 12, color: MUTED, fontWeight: isToday ? 700 : 400 }}>{INITIALS[day]}</div>
            </div>
          );
        })}
      </div>
      <p style={{ ...secondary, fontSize: 14 }}>
        {current >= 1 ? `${current}-day streak` : "Pray the Rosary, a novena day or the Three O'Clock prayers to begin a streak."}
      </p>
    </div>
  );
}
