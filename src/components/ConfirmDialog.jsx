import Dialog from "./Dialog.jsx";
import { primaryButton, secondaryButton, dangerButton } from "../styles/buttons.js";
import { cardTitle, secondary } from "../styles/text.js";

// A yes/no question in a dialog. Replaces window.confirm.
export default function ConfirmDialog({ open, title, message, confirmLabel, cancelLabel = "Cancel", destructive = false, onConfirm, onCancel }) {
  return (
    <Dialog open={open} onClose={onCancel} label={title}>
      <div style={{ ...cardTitle, fontSize: 18, marginBottom: message ? 8 : 18, textAlign: "center" }}>{title}</div>
      {message && <p style={{ ...secondary, marginBottom: 18, textAlign: "center" }}>{message}</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button type="button" onClick={onConfirm} style={destructive ? dangerButton : primaryButton}>{confirmLabel}</button>
        <button type="button" onClick={onCancel} style={secondaryButton}>{cancelLabel}</button>
      </div>
    </Dialog>
  );
}
