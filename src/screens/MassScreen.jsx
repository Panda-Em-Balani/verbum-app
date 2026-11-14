import { useState } from "react";
import { Cross, MassIco } from "../components/Icons.jsx";
import { STREAMS } from "../content/streams.js";
import { SURFACE, CARD, BORDER, TEXT, TEXT_BODY, MUTED, GOLD, GOLD_TEXT, FONT_DISPLAY, FONT_UI, R, CARD_SHADOW, CARD_SHADOW_STRONG } from "../theme.js";

export default function MassTab() {
  const [selected, setSelected] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const activeStream = selected !== null ? STREAMS[selected] : null;

  return (
    <div style={{ padding: "0 0 20px" }}>
      {/* Header */}
      <div style={{ padding: "24px 20px 20px", marginTop: "calc(56px + env(safe-area-inset-top))", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 40, height: 40, borderRadius: R.sm, background: `${GOLD}18`, border: `1.5px solid ${GOLD}50`, display: "flex", alignItems: "center", justifyContent: "center" }}><MassIco on /></div>
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 19, color: TEXT, fontWeight: 600, letterSpacing: "0.07em" }}>Virtual Mass</div>
            <div style={{ fontSize: 13, color: MUTED, fontFamily:FONT_UI, marginTop: 2 }}>Join the celebration of the Eucharist</div>
          </div>
        </div>
      </div>

      {/* Stream list */}
      <div style={{ padding: "18px 20px 0" }}>
        <div style={{ fontSize: 12, color: GOLD_TEXT, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: FONT_DISPLAY, fontWeight: 700, marginBottom: 12 }}>Available Streams</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
          {STREAMS.map((stream, i) => (
            <button key={i} aria-pressed={selected === i} onClick={() => { setSelected(i); setLoaded(false); }} style={{ background: selected === i ? "linear-gradient(135deg,#FFFCF5,#FFF3D6)" : CARD, border: `1.5px solid ${selected === i ? GOLD : BORDER}`, borderRadius: R.md, padding: "14px 16px", cursor: "pointer", textAlign: "left", transition: "all 0.2s", boxShadow: selected === i ? CARD_SHADOW_STRONG : CARD_SHADOW }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: selected === i ? `${GOLD}20` : SURFACE, border: `1px solid ${selected === i ? GOLD + "60" : BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{stream.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, color: selected === i ? GOLD_TEXT : TEXT, fontWeight: 600, letterSpacing: "0.05em", marginBottom: 3 }}>{stream.label}</div>
                  <div style={{ fontSize: 13, color: MUTED, fontFamily:FONT_UI, lineHeight: 1.5 }}>{stream.note}</div>
                </div>
                {selected === i && <div style={{ width: 8, height: 8, borderRadius: "50%", background: GOLD, flexShrink: 0 }} />}
              </div>
            </button>
          ))}
        </div>

        {/* Player */}
        {activeStream ? (
          <>
            <div style={{ fontSize: 12, color: GOLD_TEXT, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: FONT_DISPLAY, fontWeight: 700, marginBottom: 10 }}>Now Watching</div>
            <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", borderRadius: R.md, overflow: "hidden", border: `1.5px solid ${BORDER}`, background: "#0A0806", boxShadow: CARD_SHADOW_STRONG, marginBottom: 14 }}>
              {!loaded && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                  <Cross size={28} />
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, color: MUTED, letterSpacing: "0.1em" }}>Loading stream...</div>
                </div>
              )}
              <iframe
                key={activeStream.embedUrl}
                src={activeStream.embedUrl}
                title={activeStream.label}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setLoaded(true)}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
              />
            </div>
          </>
        ) : (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: R.md, padding: "28px 20px", textAlign: "center", boxShadow: CARD_SHADOW, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><MassIco on /></div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 14, color: TEXT, fontWeight: 600, letterSpacing: "0.07em", marginBottom: 8 }}>Select a Stream Above</div>
            <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.75, fontFamily:FONT_UI }}>Choose one of the available Catholic streams to begin watching Mass online.</p>
          </div>
        )}

        {/* Parish stream note */}
        <div style={{ background: "linear-gradient(135deg,#F5EEF8,#EDE0F5)", border: "1px solid #C0A0D8", borderRadius: R.md, padding: 20, marginBottom: 14, boxShadow: CARD_SHADOW }}>
          <div style={{ fontSize: 12, color: "#6A3A98", letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: FONT_DISPLAY, fontWeight: 700, marginBottom: 8 }}>Parish Stream — Coming Soon</div>
          <p style={{ fontSize: 14, color: "#4A2870", lineHeight: 1.78, fontFamily:FONT_UI }}>
            A dedicated stream from your parish will be added here once a platform is confirmed. Check back soon. We are working on bringing your local community's Mass directly into the app.
          </p>
        </div>

        {/* Spiritual note */}
        <div style={{ background: "linear-gradient(135deg,#FFFCF5,#FFF3D6)", border: `1px solid ${GOLD}50`, borderRadius: R.md, padding: 20, boxShadow: CARD_SHADOW }}>
          <div style={{ fontSize: 12, color: GOLD_TEXT, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: FONT_DISPLAY, fontWeight: 700, marginBottom: 8 }}>A Note on Virtual Mass</div>
          <p style={{ fontSize: 14, color: TEXT_BODY, lineHeight: 1.78, fontFamily:FONT_UI }}>
            The Church encourages physical attendance at Mass whenever possible, since it is there we receive Christ truly present in the Eucharist. Watching a live stream is a meaningful act of worship when in-person attendance is not possible. If you are able, please attend Mass at your local parish.
          </p>
        </div>
      </div>
    </div>
  );
}
