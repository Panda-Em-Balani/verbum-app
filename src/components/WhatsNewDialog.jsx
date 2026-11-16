import Dialog from "./Dialog.jsx";
import { GOLD, SURFACE } from "../theme.js";
import { primaryButton, secondaryButton } from "../styles/buttons.js";
import { cardTitle, body, secondary } from "../styles/text.js";

// Announces a new feature (see src/announcements.js).
export default function WhatsNewDialog({ announcement, onOpen, onClose }) {
  return (
    <Dialog open onClose={onClose} label={announcement.title}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div aria-hidden="true" style={{ width: 54, height: 54, borderRadius: "50%", background: SURFACE, border: `1.5px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h9l4 4v14H6z" /><path d="M9 11h7M9 15h7M9 7h3" /></svg>
        </div>
        <div style={{ ...cardTitle, fontSize: 19, marginBottom: 10 }}>{announcement.title}</div>
        <p style={{ ...body, marginBottom: 8 }}>{announcement.body}</p>
        <p style={secondary}>{announcement.where}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button type="button" onClick={onOpen} style={primaryButton}>{announcement.actionLabel}</button>
        <button type="button" onClick={onClose} style={secondaryButton}>Not now</button>
      </div>
    </Dialog>
  );
}
