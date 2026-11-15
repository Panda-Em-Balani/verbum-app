import { CalendarIco } from "../../components/Icons.jsx";
import { GOLD, SURFACE, R } from "../../theme.js";
import { goldCard, cardTitle, eyebrow, body, secondary, noteBlock } from "../../styles/text.js";

// A feast or event of the day, with its Catechism connection.
export default function DailyCatholicHappening({ happening }) {
  return (
    <div style={{ ...goldCard, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: R.sm, background: SURFACE, border: `1px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <CalendarIco />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...eyebrow, marginBottom: 4 }}>About this day{happening.year ? ` · ${happening.year}` : ""}</div>
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
