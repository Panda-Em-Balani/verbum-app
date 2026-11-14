import { useState } from "react";
import AccountSheet from "./AccountSheet.jsx";
import { UserIco } from "./Icons.jsx";
import { HEADER_BG, HEADER_TEXT, HEADER_H, HEADER_SHADOW, FONT_DISPLAY } from "../theme.js";

// Fixed top bar: wordmark in the middle, account button on the right.
export default function AppHeader({ user, onSignOut }) {
  const [accountOpen, setAccountOpen] = useState(false);
  const firstName = user?.name?.split(" ")[0] || "";
  return (
    <>
      <div style={{ position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: HEADER_BG, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: 16, paddingRight: 16, paddingTop: "env(safe-area-inset-top)", minHeight: HEADER_H, boxShadow: HEADER_SHADOW }}>
        <div style={{ width: 105 }} />
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, color: HEADER_TEXT, fontWeight: 600, letterSpacing: "0.2em" }}>VERBUM</div>
        <div style={{ width: 105, display: "flex", justifyContent: "flex-end" }}>
          <button type="button" onClick={() => setAccountOpen(true)} aria-label="Account" aria-haspopup="dialog" style={{ display: "flex", alignItems: "center", gap: 6, maxWidth: 105, minHeight: 44, padding: "0 12px", background: "rgba(255,255,255,0.13)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 22, cursor: "pointer", color: HEADER_TEXT }}>
            <UserIco />
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{firstName || "Account"}</span>
          </button>
        </div>
      </div>
      <AccountSheet open={accountOpen} onClose={() => setAccountOpen(false)} user={user} onSignOut={onSignOut} />
    </>
  );
}
