import { useState, useEffect } from "react";
import ShareButton from "../../ShareButton.jsx";
import { Cross } from "../../components/Icons.jsx";
import { getLiturgicalSeason, getSaintOfDay, isThreeOClockHour } from "../../liturgy/legacy.js";
import DailyVerseCard from "./DailyVerseCard.jsx";
import SaintOfDayCard from "./SaintCard.jsx";
import ThreeOClockBanner from "./ThreeOClockBanner.jsx";
import DailyCatholicHappening from "./TodayInChurchCard.jsx";
import { CARD, BORDER, TEXT, MUTED, GOLD_TEXT, FONT_DISPLAY, FONT_UI, R, CARD_SHADOW } from "../../theme.js";

export default function HomeTab({favorites,onFav,user}) {
  // Note: top padding accounts for fixed header
  const [time,setTime]=useState(new Date());
  useEffect(()=>{ const t=setInterval(()=>setTime(new Date()),15000); return()=>clearInterval(t); },[]);
  const saint=getSaintOfDay(); const season=getLiturgicalSeason();
  const h=time.getHours(); const is3oclock=isThreeOClockHour();
  const firstName=user?.name?.split(' ')[0]||''; const moment=h<12?{g:`Good Morning${firstName?`, ${firstName}`:''}`,p:"Morning Prayer",l:"Begin this day in God's presence."}:h<17?{g:"Good Afternoon",p:"Midday Prayer",l:"Pause and rest in the Lord."}:{g:"Good Evening",p:"Evening Prayer",l:"Give thanks for this day."};
  const dateStr=time.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
  const timeStr=time.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:true});
  return (
    <div style={{padding:"0 20px 20px"}}>
      <div style={{textAlign:"center",padding:"24px 0 20px",marginTop:"calc(56px + env(safe-area-inset-top))"}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:14}}><Cross size={28}/></div>
        <div style={{fontSize:16,color:GOLD_TEXT,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4,fontWeight:700,fontFamily:FONT_DISPLAY}}>{dateStr}</div>
        <div style={{fontSize:16,color:MUTED,fontFamily:FONT_UI,fontWeight:500,marginBottom:8,letterSpacing:"0.06em"}}>{timeStr}</div>
        <div style={{fontFamily:FONT_DISPLAY,fontSize:28,color:TEXT,marginBottom:6,letterSpacing:"0.08em",fontWeight:700}}>{moment.g}</div>
        <div style={{fontSize:15,color:MUTED,fontFamily:FONT_UI,fontWeight:500}}>{moment.l}</div>
      </div>
      <DailyVerseCard onFav={onFav} favorites={favorites} />

      {is3oclock && <ThreeOClockBanner />}
      <DailyCatholicHappening />
      <SaintOfDayCard saint={saint} />
      <div style={{background:season.bg,border:`1.5px solid ${season.border}`,borderRadius:R.md,padding:"16px 20px",marginBottom:16,boxShadow:CARD_SHADOW}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
          <div style={{width:10,height:10,borderRadius:"50%",background:season.light,flexShrink:0}}/>
          <div>
            <div style={{fontSize:12,color:season.light,letterSpacing:"0.16em",textTransform:"uppercase",fontFamily:FONT_DISPLAY,fontWeight:700,marginBottom:2}}>Liturgical Season</div>
            <div style={{fontFamily:FONT_DISPLAY,fontSize:17,color:TEXT,fontWeight:600,letterSpacing:"0.06em"}}>{season.name}</div>
          </div>
        </div>
        <p style={{fontSize:14,color:MUTED,lineHeight:1.7,fontFamily:FONT_UI,fontWeight:500,paddingLeft:20}}>{season.desc}</p>
      </div>
      <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:R.md,padding:20,marginBottom:16,boxShadow:CARD_SHADOW,textAlign:"center"}}>
        <div style={{fontFamily:FONT_DISPLAY,fontSize:16,color:TEXT,fontWeight:700,letterSpacing:"0.06em",marginBottom:6}}>Invite a friend</div>
        <p style={{fontSize:14,color:MUTED,lineHeight:1.7,fontFamily:FONT_UI,fontWeight:500,marginBottom:12}}>Share Verbum and help someone grow in prayer.</p>
        <ShareButton source="invite" label="Share Verbum" />
      </div>
    </div>
  );
}
