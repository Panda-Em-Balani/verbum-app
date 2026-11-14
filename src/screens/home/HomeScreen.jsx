import { useState, useEffect } from "react";
import ShareButton from "../../ShareButton.jsx";
import { Cross } from "../../components/Icons.jsx";
import { getLiturgicalSeason, getSaintOfDay, isThreeOClockHour } from "../../liturgy/legacy.js";
import DailyVerseCard from "./DailyVerseCard.jsx";
import SaintOfDayCard from "./SaintCard.jsx";
import ThreeOClockBanner from "./ThreeOClockBanner.jsx";
import DailyCatholicHappening from "./TodayInChurchCard.jsx";
import { TEXT, MUTED, FONT_DISPLAY, FONT_UI, R, CARD_SHADOW } from "../../theme.js";
import { card, cardTitle, eyebrow, secondary, screenWrap } from "../../styles/text.js";

export default function HomeTab({ favorites, onFav, user }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 15000); return () => clearInterval(t); }, []);
  const saint = getSaintOfDay();
  const season = getLiturgicalSeason();
  const h = time.getHours();
  const firstName = user?.name?.split(" ")[0] || "";
  const moment = h < 12
    ? { g: `Good Morning${firstName ? `, ${firstName}` : ""}`, l: "Begin this day in God's presence." }
    : h < 17
      ? { g: "Good Afternoon", l: "Pause and rest in the Lord." }
      : { g: "Good Evening", l: "Give thanks for this day." };
  const dateStr = time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const timeStr = time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return (
    <div style={screenWrap}>
      <div style={{ textAlign: "center", padding: "24px 0 20px", marginTop: "calc(56px + env(safe-area-inset-top))" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}><Cross size={28} /></div>
        <div style={{ ...eyebrow, fontSize: 14, letterSpacing: "0.12em", marginBottom: 4 }}>{dateStr}</div>
        <div style={{ fontFamily: FONT_UI, fontSize: 15, color: MUTED, marginBottom: 8 }}>{timeStr}</div>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 28, lineHeight: 1.25, color: TEXT, margin: "0 0 6px", letterSpacing: "0.06em", fontWeight: 700 }}>{moment.g}</h1>
        <div style={{ fontFamily: FONT_UI, fontSize: 15, color: MUTED }}>{moment.l}</div>
      </div>

      <DailyVerseCard onFav={onFav} favorites={favorites} />
      {isThreeOClockHour(time) && <ThreeOClockBanner />}
      <DailyCatholicHappening />
      <SaintOfDayCard saint={saint} />

      <div style={{ background: season.bg, border: `1.5px solid ${season.border}`, borderRadius: R.md, padding: "16px 20px", marginBottom: 16, boxShadow: CARD_SHADOW }}>
        <div style={{ ...eyebrow, color: season.light, marginBottom: 2 }}>Liturgical Season</div>
        <div style={{ ...cardTitle, marginBottom: 6 }}>{season.name}</div>
        <p style={secondary}>{season.desc}</p>
      </div>

      <div style={{ ...card, marginBottom: 16, textAlign: "center" }}>
        <div style={{ ...cardTitle, marginBottom: 6 }}>Invite a friend</div>
        <p style={{ ...secondary, marginBottom: 12 }}>Share Verbum and help someone grow in prayer.</p>
        <ShareButton source="invite" label="Share Verbum" />
      </div>
    </div>
  );
}
