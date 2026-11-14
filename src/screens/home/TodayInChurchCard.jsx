import { CalendarIco } from "../../components/Icons.jsx";
import { HAPPENINGS } from "../../content/happenings.js";
import { GOLD, SURFACE, R } from "../../theme.js";
import { goldCard, cardTitle, eyebrow, body, secondary, noteBlock } from "../../styles/text.js";

// Shows today's feast or event, when the calendar has one. Renders nothing on other days.
export default function DailyCatholicHappening() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const happening = HAPPENINGS.find((h) => h.month === month && h.day === day);
  if (!happening) return null;

  return (
    <div style={{ ...goldCard, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: R.sm, background: SURFACE, border: `1px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <CalendarIco />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...eyebrow, marginBottom: 4 }}>Today in the Church{happening.year ? ` · ${happening.year}` : ""}</div>
          <div style={cardTitle}>{happening.title}</div>
          {happening.type && <div style={{ ...secondary, fontSize: 14, marginTop: 2 }}>{happening.type}</div>}
        </div>
      </div>
      <p style={{ ...body, marginBottom: 12 }}>{happening.body}</p>
      {happening.ccc && (
        <div style={noteBlock}>
          <div style={{ ...eyebrow, marginBottom: 5 }}>Catechism Connection</div>
          <p style={secondary}>{happening.ccc}</p>
        </div>
      )}
    </div>
  );
}
