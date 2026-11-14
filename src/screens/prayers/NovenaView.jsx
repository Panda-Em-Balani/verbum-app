import { useState } from "react";
import { ChevIco } from "../../components/Icons.jsx";
import { NOVENAS } from "../../content/novenas.js";
import { useProgress, toggleNovenaDay } from "../../progress.js";
import { GOLD, GOLD_BRIGHT, GOLD_TEXT, SURFACE, CARD, BORDER, CREAM, MUTED, WHITE, CINZEL, R, EMBOSS } from "../../theme.js";

export default function NovenaView({ onBack }) {
  const [selected,setSelected]=useState(null); const [currentDay,setCurrentDay]=useState(0); const prayedDays=useProgress().novena;
  if (selected) {
    const novena=NOVENAS.find(n=>n.id===selected); const day=novena.days[currentDay]; const hasCompleted=prayedDays.has(`${selected}-${currentDay}`);
    return (
      <div>
        <button onClick={()=>setSelected(null)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:MUTED,fontSize:15,cursor:"pointer",fontFamily:"'Lato',sans-serif",marginBottom:16,padding:0,minHeight:44}}><ChevIco dir="left"/> Back to Novenas</button>
        <div style={{background:novena.color,border:`1px solid ${novena.border}`,borderRadius:R.md,padding:20,marginBottom:14}}>
          <div style={{fontSize:12,color:novena.accent||GOLD_TEXT,letterSpacing:"0.2em",textTransform:"uppercase",fontFamily:CINZEL,marginBottom:6}}>Novena</div>
          <div style={{fontFamily:CINZEL,fontSize:19,color:WHITE,fontWeight:600,letterSpacing:"0.06em",textShadow:EMBOSS,marginBottom:4}}>{novena.title}</div>
          <div style={{fontSize:14,color:novena.accent||GOLD_TEXT,fontFamily:CINZEL,letterSpacing:"0.08em",marginBottom:12}}>{novena.subtitle}</div>
          <p style={{fontSize:15,color:CREAM,lineHeight:1.78,fontFamily:"'Lato',sans-serif"}}>{novena.description}</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(9,1fr)",marginBottom:14}}>
          {novena.days.map((_,i)=>{const done=prayedDays.has(`${selected}-${i}`);const active=currentDay===i;return<button key={i} aria-label={`Day ${i+1}${done?", prayed":""}`} aria-current={active?"step":undefined} onClick={()=>setCurrentDay(i)} style={{width:34,height:34,margin:"5px auto",borderRadius:"50%",padding:0,background:active?GOLD:done?"#EAF6EC":CARD,border:`1.5px solid ${active?GOLD:done?"#4A9A5A":BORDER}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:active?"#1A1000":done?"#2E6B36":MUTED,fontSize:14,fontFamily:CINZEL,fontWeight:active?700:400}}>{done&&!active?"\u2713":i+1}</button>;})}
        </div>
        <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:R.md,padding:20,marginBottom:12}}>
          <div style={{fontSize:12,color:GOLD_TEXT,letterSpacing:"0.2em",textTransform:"uppercase",fontFamily:CINZEL,marginBottom:6}}>Day {currentDay+1}</div>
          <div style={{fontFamily:CINZEL,fontSize:17,color:WHITE,fontWeight:600,textShadow:EMBOSS,marginBottom:4}}>Intention</div>
          <div style={{fontSize:15,color:GOLD_TEXT,fontFamily:CINZEL,letterSpacing:"0.06em",marginBottom:16}}>{day.intention}</div>
          <div style={{borderTop:`1px solid ${BORDER}`,paddingTop:16}}><div style={{fontSize:12,color:GOLD_TEXT,letterSpacing:"0.2em",textTransform:"uppercase",fontFamily:CINZEL,marginBottom:10}}>Prayer</div><div style={{fontFamily:CINZEL,fontSize:14,color:CREAM,lineHeight:2.1,textShadow:EMBOSS,whiteSpace:"pre-line"}}>{day.prayer}</div></div>
        </div>
        <button onClick={()=>toggleNovenaDay(`${selected}-${currentDay}`)} style={{width:"100%",background:hasCompleted?"#EAF6EC":SURFACE,border:`1px solid ${hasCompleted?"#4A9A5A":GOLD+"66"}`,borderRadius:R.sm,padding:"13px",color:hasCompleted?"#2E6B36":GOLD_TEXT,fontSize:15,fontFamily:CINZEL,fontWeight:600,letterSpacing:"0.08em",cursor:"pointer",marginBottom:10}}>{hasCompleted?"\u2713 Prayed Today":"Mark as Prayed"}</button>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>{if(currentDay>0){setCurrentDay(currentDay-1);}}} disabled={currentDay===0} style={{flex:1,background:CARD,border:`1px solid ${currentDay===0?BORDER:GOLD+"40"}`,borderRadius:R.sm,padding:"12px 0",minHeight:44,cursor:currentDay===0?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,opacity:currentDay===0?.35:1}}><ChevIco dir="left"/><span style={{fontSize:15,color:MUTED,fontFamily:"'Lato',sans-serif",fontWeight:500}}>Previous</span></button>
          <button onClick={()=>{if(currentDay<8)setCurrentDay(currentDay+1);}} disabled={currentDay===8} style={{flex:1,background:currentDay===8?CARD:SURFACE,border:`1px solid ${currentDay===8?BORDER:GOLD+"55"}`,borderRadius:R.sm,padding:"12px 0",minHeight:44,cursor:currentDay===8?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,opacity:currentDay===8?.35:1}}><span style={{fontSize:15,color:currentDay===8?MUTED:GOLD_TEXT,fontFamily:"'Lato',sans-serif"}}>{currentDay===8?"Complete":"Next Day"}</span>{currentDay<8&&<ChevIco/>}</button>
        </div>
      </div>
    );
  }
  return (
    <div>
      <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:MUTED,fontSize:15,cursor:"pointer",fontFamily:"'Lato',sans-serif",marginBottom:16,padding:0,minHeight:44}}><ChevIco dir="left"/> Back to Prayers</button>
      <div style={{fontFamily:CINZEL,fontSize:19,color:WHITE,fontWeight:600,letterSpacing:"0.07em",marginBottom:4,textShadow:EMBOSS}}>Novenas</div>
      <p style={{fontSize:15,color:MUTED,fontFamily:"'Lato',sans-serif",fontWeight:500,marginBottom:18,lineHeight:1.7}}>A novena is nine days of prayer offered for a particular intention. Select one to begin.</p>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {NOVENAS.map(n=><button key={n.id} onClick={()=>{setSelected(n.id);setCurrentDay(0);}} style={{background:n.color,border:`1px solid ${n.border}`,borderRadius:R.md,padding:18,cursor:"pointer",textAlign:"left",width:"100%"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div style={{flex:1}}><div style={{fontFamily:CINZEL,fontSize:17,color:WHITE,fontWeight:600,letterSpacing:"0.06em",textShadow:EMBOSS,marginBottom:3}}>{n.title}</div><div style={{fontSize:14,color:n.accent||GOLD_BRIGHT,fontFamily:CINZEL,letterSpacing:"0.08em",marginBottom:10}}>{n.subtitle}</div><p style={{fontSize:14,color:MUTED,lineHeight:1.7,fontFamily:"'Lato',sans-serif"}}>{n.description.substring(0,100)}...</p></div><ChevIco/></div><div style={{marginTop:12,display:"flex",gap:5}}>{Array.from({length:9},(_,i)=><div key={i} style={{width:18,height:4,borderRadius:2,background:prayedDays.has(`${n.id}-${i}`)?"#4A9A5A":BORDER}}/>)}</div></button>)}
      </div>
    </div>
  );
}
