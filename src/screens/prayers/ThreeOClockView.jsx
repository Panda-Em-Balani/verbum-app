import { useState } from "react";
import { ChevIco } from "../../components/Icons.jsx";
import { THREE_OCLOCK_PRAYER } from "../../content/threeOclock.js";
import { GOLD, GOLD_TEXT, SURFACE, CARD, BORDER, CREAM, MUTED, CINZEL, R, EMBOSS } from "../../theme.js";

export default function ThreeOClockView({ onBack }) {
  const [showChaplet,setShowChaplet]=useState(false);
  return (
    <div>
      <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:MUTED,fontSize:15,cursor:"pointer",fontFamily:"'Lato',sans-serif",marginBottom:16,padding:0,minHeight:44}}><ChevIco dir="left"/> Back to Prayers</button>
      <div style={{background:"#F5EEF8",border:"1px solid #9B59C0",borderRadius:R.lg,padding:22,marginBottom:14,position:"relative",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}><div style={{width:44,height:44,borderRadius:"50%",background:"rgba(155,89,192,0.12)",border:"1px solid rgba(155,89,192,0.35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:23}}>🕒</div><div><div style={{fontFamily:CINZEL,fontSize:19,color:"#4A2070",fontWeight:600,letterSpacing:"0.07em",textShadow:EMBOSS}}>{THREE_OCLOCK_PRAYER.title}</div><div style={{fontSize:13,color:"#7040A0",letterSpacing:"0.18em",fontFamily:CINZEL,textTransform:"uppercase"}}>{THREE_OCLOCK_PRAYER.subtitle}</div></div></div>
        <div style={{background:"rgba(155,89,192,0.06)",borderRadius:R.sm,padding:14,borderLeft:"3px solid rgba(155,89,192,0.4)"}}><div style={{fontSize:12,color:"#7040A0",letterSpacing:"0.16em",textTransform:"uppercase",fontFamily:CINZEL,marginBottom:8}}>Jesus to Saint Faustina</div><p style={{fontSize:14,color:"#4A2870",lineHeight:1.9,fontFamily:CINZEL,fontStyle:"italic",textShadow:EMBOSS}}>{THREE_OCLOCK_PRAYER.instruction}</p></div>
      </div>
      <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:R.md,padding:20,marginBottom:12}}><div style={{fontSize:12,color:GOLD_TEXT,letterSpacing:"0.2em",textTransform:"uppercase",fontFamily:CINZEL,marginBottom:12}}>Prayer for the Hour of Mercy</div><div style={{fontFamily:CINZEL,fontSize:15,color:CREAM,lineHeight:2.1,textShadow:EMBOSS}}>{THREE_OCLOCK_PRAYER.shortPrayer}</div></div>
      <button onClick={()=>setShowChaplet(!showChaplet)} style={{width:"100%",background:showChaplet?"#EAF6EC":SURFACE,border:`1px solid ${showChaplet?"#4A9A5A":GOLD+"66"}`,borderRadius:R.sm,padding:"13px",color:showChaplet?"#2E6B36":GOLD_TEXT,fontSize:15,fontFamily:CINZEL,fontWeight:600,cursor:"pointer",marginBottom:12}}>{showChaplet?"Hide Chaplet":"Full Divine Mercy Chaplet"}</button>
      {showChaplet&&<div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:R.md,padding:20,marginBottom:12}}><div style={{fontFamily:CINZEL,fontSize:14,color:CREAM,lineHeight:2.2,whiteSpace:"pre-line",textShadow:EMBOSS}}>{THREE_OCLOCK_PRAYER.chaplet}</div></div>}
      <div style={{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:R.sm,padding:16}}><div style={{fontSize:12,color:GOLD_TEXT,letterSpacing:"0.18em",textTransform:"uppercase",fontFamily:CINZEL,marginBottom:8}}>Catechism of the Catholic Church</div><p style={{fontSize:15,color:MUTED,lineHeight:1.78,fontFamily:"'Lato',sans-serif"}}>{THREE_OCLOCK_PRAYER.ccc}</p></div>
    </div>
  );
}
