import { useOnlineStatus } from "../hooks/useOnlineStatus.js";
import { SURFACE, BORDER, MUTED, FONT_UI, HEADER_H } from "../theme.js";

// A thin strip under the header while there is no connection.
export default function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div role="status" style={{ position: "fixed", top: `calc(${HEADER_H}px + env(safe-area-inset-top))`, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, minHeight: 36, zIndex: 190, display: "flex", alignItems: "center", justifyContent: "center", padding: "6px 12px", background: SURFACE, borderBottom: `1px solid ${BORDER}`, color: MUTED, fontFamily: FONT_UI, fontSize: 14, textAlign: "center" }}>
      You're offline. Your saved prayers still work.
    </div>
  );
}
