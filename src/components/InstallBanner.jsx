import Dialog from "./Dialog.jsx";
import { R } from "../theme.js";
import { primaryButton, secondaryButton } from "../styles/buttons.js";
import { cardTitle, secondary } from "../styles/text.js";

export default function InstallBanner({ onInstall, onDismiss }) {
  return (
    <Dialog open onClose={onDismiss} label="Add Verbum to Home Screen" placement="bottom">
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
        <img src="/icon-192.png" alt="" width="56" height="56" style={{ borderRadius: R.sm, flexShrink: 0 }} />
        <div>
          <div style={{ ...cardTitle, fontSize: 18, marginBottom: 3 }}>Add Verbum to Home Screen</div>
          <p style={{ ...secondary, fontSize: 14 }}>Quick access, offline support and daily notifications.</p>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button type="button" onClick={onInstall} style={{ ...primaryButton, flex: 1, width: "auto" }}>Add to Home Screen</button>
        <button type="button" onClick={onDismiss} style={{ ...secondaryButton, width: "auto", minHeight: 48 }}>Later</button>
      </div>
    </Dialog>
  );
}
