import { useState } from "react";
import { requestNotificationPermission } from "../notifications.js";
import Dialog from "./Dialog.jsx";
import { BellIco } from "./Icons.jsx";
import { GOLD, SURFACE } from "../theme.js";
import { primaryButton, secondaryButton } from "../styles/buttons.js";
import { cardTitle, body } from "../styles/text.js";

// Asks before the browser's own permission prompt, so "Maybe later" costs nothing.
// onDismiss: the person chose "Maybe later" (remembered). onClose: closed without choosing.
export default function NotificationBanner({ onGranted, onDismiss, onClose }) {
  const [requesting, setRequesting] = useState(false);
  const handleEnable = async () => {
    setRequesting(true);
    const granted = await requestNotificationPermission();
    setRequesting(false);
    if (granted) onGranted();
    else onDismiss();
  };
  return (
    <Dialog open onClose={onClose} label="Daily reminders">
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ width: 54, height: 54, borderRadius: "50%", background: SURFACE, border: `1.5px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
          <BellIco />
        </div>
        <div style={{ ...cardTitle, fontSize: 19, marginBottom: 10 }}>Daily Reminders</div>
        <p style={body}>Get a morning verse, the Three O'Clock Prayer and feast day reminders as notifications.</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button type="button" onClick={handleEnable} disabled={requesting} style={primaryButton}>{requesting ? "Requesting…" : "Enable notifications"}</button>
        <button type="button" onClick={onDismiss} style={secondaryButton}>Maybe later</button>
      </div>
    </Dialog>
  );
}
