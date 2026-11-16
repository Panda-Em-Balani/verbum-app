import { RANK_LABEL, SEASON_TEXT } from "../../liturgy/match.js";
import { seasonTheme } from "../../liturgy/seasonTheme.js";
import { R, CARD_SHADOW } from "../../theme.js";
import { cardTitle, eyebrow, secondary } from "../../styles/text.js";

// The liturgical day: what the Church celebrates today, its rank and the season.
export default function TodayCard({ day }) {
  const theme = seasonTheme(day.color);
  const season = SEASON_TEXT[day.season] || SEASON_TEXT.ordinary;
  // Without calendar data only the season is known.
  const detail = day.source === "fallback" ? "Liturgical season" : `${RANK_LABEL[day.rank] || "Weekday"} · ${season.name}`;
  return (
    <div style={{ background: theme.tint, border: `1.5px solid ${theme.accent}`, borderRadius: R.md, padding: "16px 20px", marginBottom: 16, boxShadow: CARD_SHADOW }}>
      <div style={{ ...eyebrow, marginBottom: 4 }}>Today in the Church</div>
      <div style={{ ...cardTitle, marginBottom: 2 }}>{day.name}</div>
      <div style={{ ...secondary, fontSize: 14, marginBottom: 8 }}>{detail}</div>
      <p style={secondary}>{season.desc}</p>
    </div>
  );
}
