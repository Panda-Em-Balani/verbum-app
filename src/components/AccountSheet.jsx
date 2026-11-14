import { useState } from "react";
import Dialog from "./Dialog.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";
import { ChevIco } from "./Icons.jsx";
import { BORDER, MUTED, TEXT, FONT_UI } from "../theme.js";
import { secondaryButton } from "../styles/buttons.js";
import { cardTitle, secondary } from "../styles/text.js";

// Opened from the header: who is signed in, about the app, and sign out.
export default function AccountSheet({ open, onClose, user, onSignOut }) {
  const [about, setAbout] = useState(false);
  const [confirming, setConfirming] = useState(false);
  return (
    <>
      <Dialog open={open} onClose={onClose} label="Account" placement="bottom">
        <div style={{ ...cardTitle, fontSize: 19 }}>{user?.name || "Your account"}</div>
        <div style={{ ...secondary, marginBottom: 16, overflowWrap: "anywhere" }}>{user?.email}</div>

        <button type="button" aria-expanded={about} onClick={() => setAbout(!about)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", minHeight: 48, padding: "0 2px", background: "none", border: "none", borderTop: `1px solid ${BORDER}`, borderBottom: about ? "none" : `1px solid ${BORDER}`, cursor: "pointer", color: TEXT, fontFamily: FONT_UI, fontSize: 16, textAlign: "left" }}>
          About Verbum
          <ChevIco dir={about ? "up" : "down"} />
        </button>
        {about && (
          <div style={{ padding: "0 2px 14px", borderBottom: `1px solid ${BORDER}` }}>
            <p style={secondary}>Verbum is a Catholic companion for daily Scripture and prayer.</p>
            <p style={{ ...secondary, fontSize: 13, color: MUTED, marginTop: 6 }}>Version {import.meta.env.VITE_APP_VERSION}</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
          <button type="button" onClick={() => setConfirming(true)} style={secondaryButton}>Sign out</button>
          <button type="button" onClick={onClose} style={{ ...secondaryButton, border: "none", color: MUTED, fontWeight: 400 }}>Close</button>
        </div>
      </Dialog>
      <ConfirmDialog
        open={confirming}
        title="Sign out of Verbum?"
        confirmLabel="Sign out"
        destructive
        onConfirm={() => { setConfirming(false); onClose(); onSignOut(); }}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
