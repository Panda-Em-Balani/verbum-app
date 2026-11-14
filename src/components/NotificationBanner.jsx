import { useState } from "react";
import { BellIco } from "./Icons.jsx";
import { requestNotificationPermission } from "../notifications.js";
import { CARD, BORDER, TEXT, TEXT_BODY, MUTED, GOLD, GOLD_DEEP, FONT_DISPLAY, FONT_UI, R, CARD_SHADOW_STRONG } from "../theme.js";

export default function NotificationBanner({ onGranted, onDismiss }) {
  const [requesting, setRequesting] = useState(false);
  const handleEnable = async () => {
    setRequesting(true);
    const granted = await requestNotificationPermission();
    setRequesting(false);
    if (granted) { onGranted(); }
    else { onDismiss(); }
  };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}>
      <div role="dialog" aria-modal="true" aria-label="Daily reminders" style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: R.lg, padding: 28, maxWidth: 340, width: "100%", boxShadow: CARD_SHADOW_STRONG, position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 100, height: 2, background: `linear-gradient(90deg,transparent,${GOLD},transparent)` }} />
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ width: 54, height: 54, borderRadius: "50%", background: `${GOLD}18`, border: `1.5px solid ${GOLD}50`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <BellIco on />
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 19, color: TEXT, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10 }}>Daily Reminders</div>
          <p style={{ fontSize: 14, color: TEXT_BODY, lineHeight: 1.82, fontFamily:FONT_UI, fontWeight: 500 }}>
            Stay connected to your faith with daily notifications: a morning verse, the Three O'Clock Prayer, and Catholic feast day reminders.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={handleEnable} disabled={requesting} style={{ width: "100%", background: `linear-gradient(135deg,${GOLD},${GOLD_DEEP})`, border: "none", borderRadius: R.sm, padding: "13px", color: "#FFFFFF", fontSize: 15, fontFamily: FONT_DISPLAY, fontWeight: 600, letterSpacing: "0.08em", cursor: requesting ? "default" : "pointer" }}>
            {requesting ? "Requesting..." : "Enable Notifications"}
          </button>
          <button onClick={onDismiss} style={{ width: "100%", background: "none", border: `1px solid ${BORDER}`, borderRadius: R.sm, padding: "12px", minHeight: 44, color: MUTED, fontSize: 14, fontFamily:FONT_UI, cursor: "pointer", fontWeight: 500 }}>
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
