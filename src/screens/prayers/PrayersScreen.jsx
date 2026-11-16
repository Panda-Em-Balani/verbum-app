import { useState } from "react";
import { navigate } from "../../router.js";
import { ChevIco, ClockIco, BeadsIco } from "../../components/Icons.jsx";
import { PRAYERS } from "../../content/prayers.js";
import { isThreeOClockHour } from "../../liturgy/legacy.js";
import IntentionsView from "./IntentionsView.jsx";
import NovenaView from "./NovenaView.jsx";
import RosaryView from "./RosaryView.jsx";
import ThreeOClockView from "./ThreeOClockView.jsx";
import { GOLD_DEEP, BORDER, MUTED, MERCY, R, CARD_SHADOW, CARD_SHADOW_STRONG } from "../../theme.js";
import { segment, segmentGroup } from "../../styles/buttons.js";
import { card, cardTitle, eyebrow, secondary, prayerText, noteBlock, screenWrap, screenHeader, screenTitle, screenSub, subScreenTop } from "../../styles/text.js";

const linkCard = { display: "block", width: "100%", textAlign: "left", cursor: "pointer", background: MERCY.bg, border: `1px solid ${MERCY.border}`, borderRadius: R.md, padding: 18, boxShadow: CARD_SHADOW };
const iconDisc = { width: 40, height: 40, borderRadius: "50%", border: `1px solid ${MERCY.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };

export default function PrayersTab({ route }) {
  const [expandedPrayer, setExpandedPrayer] = useState(null);
  const section = route.name === "rosary" ? "rosary" : "prayers";

  if (route.name === "novenas" || route.name === "novena") return <div style={{ ...screenWrap, ...subScreenTop }}><NovenaView novenaId={route.params.id} /></div>;
  if (route.name === "intentions") return <div style={{ ...screenWrap, ...subScreenTop }}><IntentionsView /></div>;
  if (route.name === "threeOclock") return <div style={{ ...screenWrap, ...subScreenTop }}><ThreeOClockView /></div>;

  return (
    <div style={screenWrap}>
      <div style={screenHeader}>
        <h1 style={{ ...screenTitle, margin: "0 0 4px" }}>{section === "prayers" ? "Catholic Prayers" : "The Holy Rosary"}</h1>
        <div style={screenSub}>{section === "prayers" ? "Traditional prayers of the faith" : "A decade-by-decade guide"}</div>
      </div>
      <div style={{ ...segmentGroup, marginBottom: 18 }}>
        {[{ id: "prayers", path: "/prayers", label: "Prayers" }, { id: "rosary", path: "/prayers/rosary", label: "Rosary" }].map((t) => <button key={t.id} type="button" aria-pressed={section === t.id} onClick={() => navigate(t.path, { replace: true })} style={segment(section === t.id)}>{t.label}</button>)}
      </div>

      {section === "prayers" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button type="button" onClick={() => navigate("/prayers/three-oclock")} style={linkCard}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={iconDisc}><ClockIco color={MERCY.accent} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...cardTitle, color: MERCY.text, marginBottom: 2 }}>Three O'Clock Prayer</div>
                <div style={{ ...secondary, fontSize: 14, color: MERCY.accent }}>Prayers for the Hour of Mercy</div>
              </div>
              <ChevIco />
            </div>
            {isThreeOClockHour() && <div style={{ ...secondary, fontSize: 14, color: MERCY.accent, fontWeight: 700, marginTop: 10 }}>It is the Hour of Mercy now</div>}
          </button>
          <button type="button" onClick={() => navigate("/prayers/novenas")} style={linkCard}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={iconDisc}><BeadsIco color={MERCY.accent} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...cardTitle, color: MERCY.text, marginBottom: 2 }}>Novenas</div>
                <div style={{ ...secondary, fontSize: 14, color: MERCY.accent }}>Nine days of prayer · 4 novenas</div>
              </div>
              <ChevIco />
            </div>
          </button>

          <button type="button" onClick={() => navigate("/prayers/intentions")} style={{ ...card, display: "block", width: "100%", textAlign: "left", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...cardTitle, marginBottom: 2 }}>My Intentions</div>
                <div style={{ ...secondary, fontSize: 14 }}>A private list of what you are praying for</div>
              </div>
              <ChevIco />
            </div>
          </button>

          {PRAYERS.map((p, i) => {
            const open = expandedPrayer === i;
            return (
              <div key={p.t} onClick={() => setExpandedPrayer(open ? null : i)} style={{ ...card, cursor: "pointer", transition: "border-color 0.2s, box-shadow 0.2s", ...(open ? { borderColor: GOLD_DEEP, boxShadow: CARD_SHADOW_STRONG } : null) }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div>
                    <div style={{ ...cardTitle, fontSize: 18, marginBottom: 2 }}>{p.t}</div>
                    <div style={{ ...secondary, fontSize: 14 }}>{p.s}</div>
                  </div>
                  <span aria-hidden="true" style={{ color: MUTED, fontSize: 18, lineHeight: 1 }}>{open ? "−" : "+"}</span>
                </div>
                {open && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
                    <div style={{ ...prayerText, marginBottom: 14 }}>{p.text}</div>
                    <div style={noteBlock}>
                      <div style={{ ...eyebrow, marginBottom: 5 }}>Note and Catechism</div>
                      <p style={secondary}>{p.note}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {section === "rosary" && <RosaryView />}
    </div>
  );
}
