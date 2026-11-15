import { useState } from "react";
import { Cross, MassIco, BroadcastIco } from "../components/Icons.jsx";
import { STREAMS, MASS_TIMES_URL } from "../content/streams.js";
import { secondaryButton } from "../styles/buttons.js";
import { GOLD, GOLD_DEEP, GOLD_TEXT, SURFACE, CARD, BORDER, MUTED, R, CARD_SHADOW, CARD_SHADOW_STRONG, FONT_UI } from "../theme.js";
import { card, goldCard, cardTitle, eyebrow, body, secondary, screenWrap, screenHeader, screenTitle, screenSub } from "../styles/text.js";

const STREAM_ICONS = { cross: Cross, broadcast: BroadcastIco };

export default function MassTab() {
  const [selected, setSelected] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const activeStream = selected !== null ? STREAMS[selected] : null;

  return (
    <div style={screenWrap}>
      <div style={screenHeader}>
        <h1 style={{ ...screenTitle, margin: "0 0 4px" }}>Virtual Mass</h1>
        <div style={screenSub}>Join the celebration of the Eucharist</div>
      </div>

      <div style={{ ...eyebrow, marginBottom: 12 }}>Available Streams</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
        {STREAMS.map((stream, i) => {
          const on = selected === i;
          const Icon = STREAM_ICONS[stream.icon] || BroadcastIco;
          const inner = (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: SURFACE, border: `1px solid ${on ? GOLD : BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...cardTitle, fontSize: 15, marginBottom: 3 }}>{stream.label}</div>
                <div style={{ ...secondary, fontSize: 14 }}>{stream.note}</div>
                {!stream.embedUrl && <div style={{ ...secondary, fontSize: 14, fontWeight: 700, color: GOLD_TEXT, marginTop: 6 }}>{stream.watchLabel} ↗</div>}
              </div>
            </div>
          );
          const box = { display: "block", background: on ? "linear-gradient(135deg,#FFFCF5,#FFF3D6)" : CARD, border: `1.5px solid ${on ? GOLD_DEEP : BORDER}`, borderRadius: R.md, padding: "14px 16px", cursor: "pointer", textAlign: "left", textDecoration: "none", boxShadow: on ? CARD_SHADOW_STRONG : CARD_SHADOW };
          // A stream that cannot play inside the app opens on its own site.
          if (!stream.embedUrl) return <a key={stream.id} href={stream.watchUrl} target="_blank" rel="noopener noreferrer" style={box}>{inner}</a>;
          return <button key={stream.id} type="button" aria-pressed={on} onClick={() => { setSelected(i); setLoaded(false); }} style={box}>{inner}</button>;
        })}
      </div>

      {activeStream ? (
        <>
          <div style={{ ...eyebrow, marginBottom: 10 }}>Now Watching</div>
          <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", borderRadius: R.md, overflow: "hidden", border: `1px solid ${BORDER}`, background: "#0A0806", boxShadow: CARD_SHADOW_STRONG, marginBottom: 10 }}>
            {!loaded && (
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                <Cross size={28} />
                <div style={{ fontFamily: FONT_UI, fontSize: 14, color: "#D8CBB4" }}>Loading stream…</div>
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
          <p style={{ ...secondary, fontSize: 14, textAlign: "center", marginBottom: 16 }}>
            Not playing? <a href={activeStream.watchUrl} target="_blank" rel="noopener noreferrer" style={{ color: GOLD_TEXT, fontWeight: 700 }}>{activeStream.watchLabel}</a>
          </p>
        </>
      ) : (
        <div style={{ ...card, padding: "28px 20px", textAlign: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><MassIco on /></div>
          <div style={{ ...cardTitle, marginBottom: 8 }}>Choose a stream above</div>
          <p style={{ ...secondary, color: MUTED }}>Pick one of the Catholic streams to begin watching Mass online.</p>
        </div>
      )}

      <div style={{ ...card, marginBottom: 14 }}>
        <div style={{ ...cardTitle, marginBottom: 6 }}>Find Mass times near you</div>
        <p style={{ ...secondary, marginBottom: 14 }}>Look up Mass, Confession and Adoration times at parishes around the world.</p>
        <a href={MASS_TIMES_URL} target="_blank" rel="noopener noreferrer" style={secondaryButton}>Open MassTimes.org</a>
      </div>

      <div style={goldCard}>
        <div style={{ ...eyebrow, marginBottom: 8 }}>A Note on Virtual Mass</div>
        <p style={body}>The Church encourages physical attendance at Mass whenever possible, since it is there we receive Christ truly present in the Eucharist. Watching a live stream is a meaningful act of worship when in-person attendance is not possible. If you are able, please attend Mass at your local parish.</p>
      </div>
    </div>
  );
}
